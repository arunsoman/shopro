package mls.sho.dms.application.inventory.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.inventory.dto.InventoryDtos.PhysicalInventoryLineDto;
import mls.sho.dms.application.inventory.dto.InventoryDtos.PhysicalInventoryPeriodDto;
import mls.sho.dms.application.inventory.entity.PhysicalInventoryLine;
import mls.sho.dms.application.inventory.entity.PhysicalInventoryPeriod;
import mls.sho.dms.application.inventory.entity.PhysicalInventoryPeriod.PeriodStatus;
import mls.sho.dms.application.inventory.repository.IngredientRepository;
import mls.sho.dms.application.inventory.repository.InventoryLedgerRepository;
import mls.sho.dms.application.inventory.repository.PhysicalInventoryLineRepository;
import mls.sho.dms.application.inventory.repository.PhysicalInventoryPeriodRepository;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import mls.sho.dms.common.enums.InventoryType;
import mls.sho.dms.entity.Ingredient;
import mls.sho.dms.entity.Restaurant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhysicalInventoryService {

    private final PhysicalInventoryPeriodRepository periodRepository;
    private final PhysicalInventoryLineRepository lineRepository;
    private final IngredientRepository ingredientRepository;
    private final InventoryLedgerRepository ledgerRepository;
    private final RestaurantRepository restaurantRepository;
    private final InventoryIntelligenceService intelligenceService;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPeriods(Long restaurantId) {
        return periodRepository.findAllByRestaurantIdOrderByCountDateDesc(restaurantId)
                .stream()
                .map(this::toSummaryMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PhysicalInventoryPeriodDto getCurrentPeriod(Long restaurantId, InventoryType type) {
        PhysicalInventoryPeriod period = periodRepository.findFirstByRestaurantIdAndInventoryTypeAndStatus(
                restaurantId, type, PeriodStatus.OPEN)
                .orElseThrow(() -> new RuntimeException("No open period found"));
        return toPeriodDto(period);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPeriodDetail(Long restaurantId, Long periodId) {
        PhysicalInventoryPeriod period = findPeriod(restaurantId, periodId);
        List<Map<String, Object>> lines = period.getLines().stream()
                .map(this::toLineMap)
                .collect(Collectors.toList());
        Map<String, Object> summary = toSummaryMap(period);
        return Map.of(
            "period", summary,
            "lines", lines
        );
    }

    @Transactional
    public PhysicalInventoryPeriodDto createPeriod(Long restaurantId, Map<String, Object> body) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        String typeName = body.getOrDefault("inventoryType", "FOOD").toString();
        InventoryType type = InventoryType.valueOf(typeName);

        PhysicalInventoryPeriod period = new PhysicalInventoryPeriod();
        period.setRestaurant(restaurant);
        period.setInventoryType(type);
        period.setPeriodName(body.getOrDefault("periodName", "Count " + LocalDate.now()).toString());
        period.setCountDate(body.containsKey("countDate")
                ? LocalDate.parse(body.get("countDate").toString())
                : LocalDate.now());
        period.setStatus(PeriodStatus.OPEN);

        // Pre-populate lines from all active ingredients of this type
        List<Ingredient> ingredients = ingredientRepository.findFiltered(
                restaurantId, type, null, true, null);

        for (Ingredient ing : ingredients) {
            BigDecimal expected = ledgerRepository.sumQuantityByIngredient(restaurantId, ing.getId());

            PhysicalInventoryLine line = new PhysicalInventoryLine();
            line.setPeriod(period);
            line.setIngredient(ing);
            line.setExpectedQty(expected != null ? expected : BigDecimal.ZERO);
            period.getLines().add(line);
        }

        return toPeriodDto(periodRepository.save(period));
    }

    @Transactional
    public PhysicalInventoryLineDto updateLineCount(Long restaurantId, Long periodId, Long lineId,
                                                    Map<String, Object> body) {
        findPeriod(restaurantId, periodId); // validate ownership
        PhysicalInventoryLine line = lineRepository.findById(lineId)
                .orElseThrow(() -> new RuntimeException("Line not found"));

        BigDecimal counted = new BigDecimal(body.get("countedQty").toString());
        line.setCountedQty(counted);
        line.setVariance(counted.subtract(line.getExpectedQty()));
        line.setUpdatedAt(LocalDateTime.now());
        return toLineDto(lineRepository.save(line));
    }

    @Transactional
    public List<PhysicalInventoryLineDto> batchUpdateLines(Long restaurantId, Long periodId,
                                                           List<Map<String, Object>> updates) {
        findPeriod(restaurantId, periodId); // validate ownership
        return updates.stream().map(upd -> {
            Long lineId = Long.parseLong(upd.get("lineId").toString());
            return updateLineCount(restaurantId, periodId, lineId, upd);
        }).collect(Collectors.toList());
    }

    @Transactional
    public PhysicalInventoryPeriodDto finalisePeriod(Long restaurantId, Long periodId) {
        PhysicalInventoryPeriod period = findPeriod(restaurantId, periodId);
        if (period.getStatus() == PeriodStatus.FINALISED) {
            throw new RuntimeException("Period already finalised");
        }

        // Reconcile each counted line against the perpetual ledger
        for (PhysicalInventoryLine line : period.getLines()) {
            if (line.getCountedQty() != null) {
                intelligenceService.recordReconciliation(
                        period.getRestaurant(),
                        line.getIngredient(),
                        line.getCountedQty(),
                        "PHYSICAL_COUNT_" + periodId);
            }
        }

        period.setStatus(PeriodStatus.FINALISED);
        period.setFinalisedAt(LocalDateTime.now());
        return toPeriodDto(periodRepository.save(period));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> comparePeriods(Long restaurantId, Long id1, Long id2) {
        PhysicalInventoryPeriod p1 = findPeriod(restaurantId, id1);
        PhysicalInventoryPeriod p2 = findPeriod(restaurantId, id2);

        Map<Long, BigDecimal> counts1 = p1.getLines().stream()
                .filter(l -> l.getCountedQty() != null)
                .collect(Collectors.toMap(l -> l.getIngredient().getId(), PhysicalInventoryLine::getCountedQty));

        List<Map<String, Object>> diff = p2.getLines().stream()
                .filter(l -> l.getCountedQty() != null)
                .map(l -> {
                    BigDecimal prior = counts1.getOrDefault(l.getIngredient().getId(), BigDecimal.ZERO);
                    BigDecimal delta = l.getCountedQty().subtract(prior);
                    Map<String, Object> entry = new java.util.LinkedHashMap<>();
                    entry.put("ingredientId", l.getIngredient().getId());
                    entry.put("description",  l.getIngredient().getDescription());
                    entry.put("period1Qty",   prior);
                    entry.put("period2Qty",   l.getCountedQty());
                    entry.put("delta",        delta);
                    return entry;
                })
                .collect(Collectors.toList());

        return Map.of(
            "period1Id", id1,
            "period2Id", id2,
            "differences", diff
        );
    }

    // -- Helpers -----------------------------------------------

    private PhysicalInventoryPeriodDto toPeriodDto(PhysicalInventoryPeriod p) {
        List<PhysicalInventoryLineDto> lines = p.getLines().stream()
                .map(this::toLineDto)
                .collect(Collectors.toList());
        return PhysicalInventoryPeriodDto.builder()
                .id(p.getId())
                .periodName(p.getPeriodName())
                .inventoryType(p.getInventoryType())
                .countDate(p.getCountDate())
                .status(p.getStatus().name())
                .createdAt(p.getCreatedAt())
                .finalisedAt(p.getFinalisedAt())
                .lines(lines)
                .build();
    }

    private PhysicalInventoryLineDto toLineDto(PhysicalInventoryLine l) {
        return PhysicalInventoryLineDto.builder()
                .id(l.getId())
                .ingredientId(l.getIngredient().getId())
                .ingredientName(l.getIngredient().getDescription())
                .expectedQty(l.getExpectedQty())
                .countedQty(l.getCountedQty() != null ? l.getCountedQty() : BigDecimal.ZERO)
                .variance(l.getVariance() != null ? l.getVariance() : BigDecimal.ZERO)
                .updatedAt(l.getUpdatedAt())
                .build();
    }

    private PhysicalInventoryPeriod findPeriod(Long restaurantId, Long periodId) {
        PhysicalInventoryPeriod period = periodRepository.findById(periodId)
                .orElseThrow(() -> new RuntimeException("Period not found"));
        if (!period.getRestaurant().getId().equals(restaurantId)) {
            throw new RuntimeException("Period does not belong to this restaurant");
        }
        return period;
    }

    private Map<String, Object> toSummaryMap(PhysicalInventoryPeriod p) {
        return Map.of(
            "id",            p.getId(),
            "periodName",    p.getPeriodName(),
            "inventoryType", p.getInventoryType().name(),
            "countDate",     p.getCountDate().toString(),
            "status",        p.getStatus().name(),
            "lineCount",     p.getLines().size()
        );
    }

    private Map<String, Object> toLineMap(PhysicalInventoryLine l) {
        return Map.of(
            "id",           l.getId(),
            "ingredientId", l.getIngredient().getId(),
            "description",  l.getIngredient().getDescription(),
            "expectedQty",  l.getExpectedQty(),
            "countedQty",   l.getCountedQty() != null ? l.getCountedQty() : BigDecimal.ZERO,
            "variance",     l.getVariance()   != null ? l.getVariance()   : BigDecimal.ZERO
        );
    }
}
