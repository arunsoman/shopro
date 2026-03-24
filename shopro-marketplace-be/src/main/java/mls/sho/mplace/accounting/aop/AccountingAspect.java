package mls.sho.mplace.accounting.aop;

import mls.sho.mplace.accounting.engine.AccountingEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AccountingAspect {

    private final AccountingEngine          engine;
    private final SpelExpressionParser      spel = new SpelExpressionParser();

    @Around("@annotation(mls.sho.mplace.accounting.aop.AccountingEvent)")
    public Object intercept(ProceedingJoinPoint pjp) throws Throwable {
        Object result = pjp.proceed();

        MethodSignature sig    = (MethodSignature) pjp.getSignature();
        Method          method = sig.getMethod();
        AccountingEvent ann    = method.getAnnotation(AccountingEvent.class);

        try {
            StandardEvaluationContext spelCtx = buildSpelContext(pjp, result);
            AccountingEventContext ctx = resolveContext(ann, spelCtx, result);
            engine.post(ctx);

        } catch (Exception e) {
            log.error("Accounting aspect failed for method={} event={}", method.getName(), ann.type(), e);
        }

        return result;
    }

    private StandardEvaluationContext buildSpelContext(ProceedingJoinPoint pjp, Object result) {
        StandardEvaluationContext ctx = new StandardEvaluationContext();
        ctx.setVariable("result", result);

        String[]  paramNames = ((MethodSignature) pjp.getSignature()).getParameterNames();
        Object[]  args       = pjp.getArgs();
        if (paramNames != null) {
            for (int i = 0; i < paramNames.length; i++) {
                ctx.setVariable(paramNames[i], args[i]);
            }
        }
        return ctx;
    }

    private AccountingEventContext resolveContext(AccountingEvent ann, StandardEvaluationContext spelCtx, Object result) {
        BigDecimal gross      = evalBigDecimal(ann.amountExpression(), spelCtx);
        Object     entity     = evalObject(ann.entityExpression(), spelCtx);
        String     country    = evalString(ann.countryExpression(), spelCtx);

        BigDecimal commission = getField(entity, "commissionAmount");
        BigDecimal supplierCost = gross != null && commission != null
            ? gross.subtract(commission) : null;

        return AccountingEventContext.builder()
            .eventType(ann.type())
            .countryIsoCode(country)
            .venueId(getUuidField(entity, "venueId"))
            .entityId(getUuidField(entity, "id"))
            .entityType(entity != null ? entity.getClass().getSimpleName() : null)
            .entityReference(getStringField(entity, "referenceNumber"))
            .grossAmount(gross)
            .commissionAmount(commission)
            .supplierCost(supplierCost)
            .counterpartyId(getUuidField(entity, "counterpartyId"))
            .counterpartyType(getStringField(entity, "counterpartyType"))
            .initiatedBy(currentUser())
            .eventTime(Instant.now())
            .build();
    }

    private BigDecimal evalBigDecimal(String expr, StandardEvaluationContext ctx) {
        if (expr == null || expr.isBlank()) return null;
        try {
            Object v = spel.parseExpression(expr).getValue(ctx);
            return v != null ? new java.math.BigDecimal(v.toString()) : null;
        } catch (Exception e) { return null; }
    }

    private String evalString(String expr, StandardEvaluationContext ctx) {
        if (expr == null || expr.isBlank()) return null;
        try { return (String) spel.parseExpression(expr).getValue(ctx); }
        catch (Exception e) { return null; }
    }

    private Object evalObject(String expr, StandardEvaluationContext ctx) {
        if (expr == null || expr.isBlank()) return null;
        try { return spel.parseExpression(expr).getValue(ctx); }
        catch (Exception e) { return null; }
    }

    private BigDecimal getField(Object obj, String field) {
        if (obj == null) return null;
        try {
            var f = obj.getClass().getDeclaredField(field);
            f.setAccessible(true);
            return (BigDecimal) f.get(obj);
        } catch (Exception e) { return null; }
    }

    private UUID getUuidField(Object obj, String field) {
        if (obj == null) return null;
        try {
            var f = obj.getClass().getDeclaredField(field);
            f.setAccessible(true);
            Object v = f.get(obj);
            return v != null ? (UUID) v : null;
        } catch (Exception e) { return null; }
    }

    private String getStringField(Object obj, String field) {
        if (obj == null) return null;
        try {
            var f = obj.getClass().getDeclaredField(field);
            f.setAccessible(true);
            Object v = f.get(obj);
            return v != null ? v.toString() : null;
        } catch (Exception e) { return null; }
    }

    private String currentUser() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            return auth != null ? auth.getName() : "system";
        } catch (Exception e) { return "system"; }
    }
}
