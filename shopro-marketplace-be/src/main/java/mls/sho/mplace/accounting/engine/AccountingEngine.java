package mls.sho.mplace.accounting.engine;

import mls.sho.mplace.accounting.aop.*;
import mls.sho.mplace.accounting.model.*;
import mls.sho.mplace.accounting.repository.*;
import mls.sho.mplace.tax.TaxEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.expression.*;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountingEngine {

    private final JournalEntryTemplateRepository templateRepo;
    private final JournalEntryRepository         journalRepo;
    private final TaxEngine                      taxEngine;
    private final ExpressionParser               spelParser = new SpelExpressionParser();

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void post(AccountingEventContext ctx) {
        enrichWithTax(ctx);

        List<JournalEntryTemplate> templates = templateRepo
            .findByEventTypeAndCountryOrderByLineOrder(ctx.getEventType(), ctx.getCountryIsoCode());

        if (templates.isEmpty()) {
            log.warn("No journal templates found for event={} country={}", ctx.getEventType(), ctx.getCountryIsoCode());
            return;
        }

        StandardEvaluationContext spelCtx = new StandardEvaluationContext();
        spelCtx.setVariable("ctx", ctx);

        String journalRef = generateRef();
        for (JournalEntryTemplate t : templates) {
            BigDecimal debit  = evaluate(t.getDebitExpression(),  spelCtx);
            BigDecimal credit = evaluate(t.getCreditExpression(), spelCtx);

            if (isZeroOrNull(debit) && isZeroOrNull(credit)) continue;

            JournalEntry entry = JournalEntry.builder()
                .journalRef(journalRef)
                .eventType(ctx.getEventType())
                .ledgerAccountCode(t.getLedgerAccountCode())
                .ledgerAccountName(t.getLedgerAccountName())
                .debitAmount(debit)
                .creditAmount(credit)
                .currency(resolveCurrency(ctx.getCountryIsoCode()))
                .countryIsoCode(ctx.getCountryIsoCode())
                .taxCode(ctx.getTaxCode())
                .entityId(ctx.getEntityId())
                .entityType(ctx.getEntityType())
                .entityReference(ctx.getEntityReference())
                .venueId(ctx.getVenueId())
                .counterpartyId(ctx.getCounterpartyId())
                .counterpartyType(ctx.getCounterpartyType())
                .description(t.getDescription())
                .initiatedBy(ctx.getInitiatedBy())
                .build();

            journalRepo.save(entry);
        }

        log.info("Posted {} journal lines for event={} ref={} entity={}",
            templates.size(), ctx.getEventType(), journalRef, ctx.getEntityReference());
    }

    private void enrichWithTax(AccountingEventContext ctx) {
        if (ctx.getCommissionAmount() == null || ctx.getCountryIsoCode() == null) return;
        try {
            var taxResult = taxEngine.calculateOnCommission(
                ctx.getCommissionAmount(), ctx.getCountryIsoCode(), ctx.getVenueId());
            ctx.setTaxAmount(taxResult.getOutputVat());
            ctx.setWhtAmount(taxResult.getWhtAmount());
            ctx.setTaxCode(taxResult.getPrimaryRuleCode());
        } catch (Exception e) {
            log.error("TaxEngine enrichment failed for ctx={}", ctx, e);
        }
    }

    private BigDecimal evaluate(String expression, EvaluationContext spelCtx) {
        if (expression == null || expression.isBlank()) return null;
        try {
            Object val = spelParser.parseExpression(expression).getValue(spelCtx);
            if (val == null) return null;
            return new BigDecimal(val.toString()).setScale(2, RoundingMode.HALF_UP);
        } catch (Exception e) {
            log.warn("SpEL evaluation failed for '{}': {}", expression, e.getMessage());
            return null;
        }
    }

    private boolean isZeroOrNull(BigDecimal v) {
        return v == null || v.compareTo(BigDecimal.ZERO) == 0;
    }

    private String generateRef() {
        return "JNL-" + java.time.LocalDate.now() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String resolveCurrency(String isoCode) {
        if (isoCode == null) return "USD";
        return switch (isoCode) {
            case "KE" -> "KES"; case "NG" -> "NGN"; case "ZA" -> "ZAR";
            case "GH" -> "GHS"; case "EG" -> "EGP"; case "TZ" -> "TZS";
            default   -> "USD";
        };
    }
}
