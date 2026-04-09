package mls.sho.dms.application.analytics.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mls.sho.dms.application.analytics.dto.*;
import mls.sho.dms.application.analytics.repository.*;
import mls.sho.dms.common.enums.ExperimentStatus;
import mls.sho.dms.common.enums.VariantStatus;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.entity.experiment.Experiment;
import mls.sho.dms.entity.experiment.ExperimentMetric;
import mls.sho.dms.entity.experiment.ExperimentEvent;
import mls.sho.dms.entity.experiment.ExperimentVariant;
import mls.sho.dms.entity.experiment.config.Hypothesis;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExperimentService {
    
    private final ExperimentRepository experimentRepo;
    private final ExperimentVariantRepository variantRepo;
    private final ExperimentMetricRepository metricRepo;
    private final ExperimentEventRepository eventRepo;
    private final ExperimentAttributionService attributionService;
    
    @Transactional
    public ExperimentDTO createExperiment(Long restaurantId, UUID userId, CreateExperimentRequest request) {
        String key = generateExperimentKey();
        
        Experiment exp = new Experiment();
        exp.setRestaurant(findRestaurant(restaurantId));
        exp.setExperimentKey(key);
        exp.setName(request.getName());
        exp.setType(request.getType());
        exp.setOwnerRole(request.getOwnerRole());
        exp.setHypothesis(mapDTOToHypothesis(request.getHypothesis()));
        exp.setRandomizationConfig(request.getRandomization());
        exp.setExecutionConfig(request.getExecution());
        exp.setCreatedBy(userId);
        exp.setStatus(ExperimentStatus.DRAFT);
        
        List<ExperimentVariant> variants = request.getVariants().stream()
            .map(vc -> {
                ExperimentVariant v = new ExperimentVariant();
                v.setExperiment(exp);
                v.setVariantKey(vc.getKey());
                v.setName(vc.getName());
                v.setAllocation(vc.getAllocation());
                v.setConfig(vc.getConfig());
                v.setControl(vc.isControl());
                v.setStatus(VariantStatus.ACTIVE);
                return v;
            }).collect(Collectors.toList());
        
        exp.setVariants(variants);
        
        Experiment saved = experimentRepo.save(exp);
        log.info("Created experiment {}: {} for restaurant {}", key, request.getName(), restaurantId);
        
        return mapToDTO(saved);
    }
    
    @Transactional
    public void startExperiment(UUID experimentId) {
        Experiment exp = findExperiment(experimentId);
        if (exp.getStatus() != ExperimentStatus.DRAFT) {
            throw new IllegalStateException("Only draft experiments can be started");
        }
        
        exp.setStatus(ExperimentStatus.RUNNING);
        exp.setStartDate(LocalDateTime.now());
        
        if (exp.getEndDate() == null && exp.getExecutionConfig().getDurationDays() != null) {
            exp.setEndDate(exp.getStartDate().plusDays(exp.getExecutionConfig().getDurationDays()));
        }
        
        experimentRepo.save(exp);
        recordEvent(exp, "EXPERIMENT_STARTED", Map.of("startTime", exp.getStartDate().toString()), "SYSTEM");
    }
    
    @Transactional
    public void rollbackExperiment(UUID experimentId, String reason) {
        Experiment exp = findExperiment(experimentId);
        if (exp.getStatus() != ExperimentStatus.RUNNING) {
            throw new IllegalStateException("Only running experiments can be rolled back");
        }
        
        exp.setStatus(ExperimentStatus.ROLLED_BACK);
        exp.setEndDate(LocalDateTime.now());
        
        experimentRepo.save(exp);
        recordEvent(exp, "AUTO_ROLLBACK", Map.of("reason", reason, "rollbackTime", LocalDateTime.now().toString()), "SYSTEM");
        log.warn("Experiment {} rolled back: {}", exp.getExperimentKey(), reason);
    }

    public List<ExperimentDTO> listByRestaurant(Long restaurantId) {
        return experimentRepo.findByRestaurantId(restaurantId).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public ExperimentDTO getById(UUID id) {
        return mapToDTO(findExperiment(id));
    }
    
    @Transactional
    public void recordMetric(Long restaurantId, String type, BigDecimal value, Map<String, String> dims) {
        List<Experiment> active = experimentRepo.findAll().stream()
            .filter(e -> e.getRestaurant().getId().equals(restaurantId))
            .filter(e -> e.getStatus() == ExperimentStatus.RUNNING)
            .toList();
        
        if (active.isEmpty()) return;
        
        for (Experiment exp : active) {
            ExperimentMetric metric = new ExperimentMetric();
            metric.setExperiment(exp);
            metric.setMetricType(type);
            metric.setMetricValue(value);
            metric.setMetricDate(LocalDate.now());
            
            Map<String, String> enrichedDims = dims != null ? new HashMap<>(dims) : new HashMap<>();
            enrichedDims.put("dayOfWeek", LocalDate.now().getDayOfWeek().name());
            enrichedDims.put("mealPeriod", getCurrentMealPeriod());
            metric.setDimensions(enrichedDims);
            
            // If the dimension matches a specific variant (e.g. by Table or Time), assign it
            // For now, mapping variant is done during analysis or passed in dimensions
            if (dims != null && dims.containsKey("variantId")) {
                metric.setVariant(variantRepo.findById(UUID.fromString(dims.get("variantId"))).orElse(null));
            }
            
            metricRepo.save(metric);
        }
        log.debug("Recorded metric {}={} for restaurant {}", type, value, restaurantId);
    }
    
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void monitorGuardrails() {
        List<Experiment> running = experimentRepo.findAll().stream()
            .filter(e -> e.getStatus() == ExperimentStatus.RUNNING)
            .toList();
        
        for (Experiment exp : running) {
            if (shouldAutoRollback(exp)) {
                rollbackExperiment(exp.getId(), "Auto-rollback triggered by guardrail breach detection");
            }
        }
    }
    
    private boolean shouldAutoRollback(Experiment exp) {
        if (!exp.getExecutionConfig().getAutoRollback().isEnabled()) {
            return false;
        }

        // 1. Check for Variance Spikes (External Shock Detection)
        if (detectVarianceSpike(exp)) {
            log.error("External shock detected for experiment {}: Variance spike exceeding guardrail.", exp.getExperimentKey());
            return true;
        }

        List<String> conditions = exp.getExecutionConfig().getAutoRollback().getTriggerConditions();
        if (conditions == null || conditions.isEmpty()) {
            return false;
        }

        // Fetch metrics for this experiment from the last 24 hours to check for recent breaches
        LocalDate today = LocalDate.now();
        List<ExperimentMetric> recentMetrics = metricRepo.findByExperimentAndDateRange(exp.getId(), today.minusDays(1), today);

        for (String condition : conditions) {
            if (isConditionBreached(condition, recentMetrics)) {
                log.warn("Guardrail breached for experiment {}: {}", exp.getExperimentKey(), condition);
                return true;
            }
        }

        return false;
    }

    private boolean isConditionBreached(String condition, List<ExperimentMetric> metrics) {
        // Simple parser for "METRIC_TYPE < VALUE" or "METRIC_TYPE > VALUE"
        try {
            String[] parts = condition.split(" ");
            if (parts.length != 3) return false;

            String metricType = parts[0].toUpperCase();
            String operator = parts[1];
            BigDecimal threshold = new BigDecimal(parts[2]);

            BigDecimal currentValue = metrics.stream()
                .filter(m -> m.getMetricType().equalsIgnoreCase(metricType))
                .map(ExperimentMetric::getMetricValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            if (operator.equals("<")) {
                return currentValue.compareTo(threshold) < 0 && !metrics.isEmpty();
            } else if (operator.equals(">")) {
                return currentValue.compareTo(threshold) > 0;
            }
        } catch (Exception e) {
            log.error("Failed to parse guardrail condition: {}", condition, e);
        }
        return false;
    }

    private boolean detectVarianceSpike(Experiment exp) {
        LocalDate today = LocalDate.now();
        List<ExperimentMetric> metrics = metricRepo.findByExperimentAndDateRange(exp.getId(), today.minusDays(7), today);
        if (metrics.size() < 10) return false;

        double mean = metrics.stream().mapToDouble(m -> m.getMetricValue().doubleValue()).average().orElse(0.0);
        double variance = metrics.stream()
            .mapToDouble(m -> Math.pow(m.getMetricValue().doubleValue() - mean, 2))
            .average().orElse(0.0);
        
        double stdDev = Math.sqrt(variance);
        
        // If standard deviation is > 50% of the mean, we have a massive variance spike
        return mean > 0 && (stdDev / mean) > 0.5;
    }
    
    private String generateExperimentKey() {
        return "EXP-" + Year.now().getValue() + "-" + String.format("%04d", new Random().nextInt(10000));
    }
    
    private Experiment findExperiment(UUID id) {
        return experimentRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Experiment not found"));
    }
    
    private Restaurant findRestaurant(Long id) {
        // Mocking restaurant lookup for now - in real app this uses RestaurantRepository
        Restaurant r = new Restaurant();
        r.setId(id);
        return r;
    }

    private void recordEvent(Experiment exp, String type, Map<String, Object> data, String user) {
        ExperimentEvent event = new ExperimentEvent();
        event.setExperiment(exp);
        event.setEventType(type);
        event.setEventData(data);
        event.setTriggeredBy(user);
        eventRepo.save(event);
    }

    private ExperimentDTO mapToDTO(Experiment exp) {
        if (attributionService == null) log.warn("Attribution service not available during mapping");
        
        ExperimentDTO dto = new ExperimentDTO();
        dto.setId(exp.getId());
        dto.setExperimentKey(exp.getExperimentKey());
        dto.setName(exp.getName());
        dto.setType(exp.getType());
        dto.setStatus(exp.getStatus());
        dto.setOwnerRole(exp.getOwnerRole());
        dto.setHypothesis(mapHypothesisToDTO(exp.getHypothesis()));
        dto.setExecutionConfig(exp.getExecutionConfig());
        dto.setStartDate(exp.getStartDate());
        dto.setEndDate(exp.getEndDate());
        dto.setVariants(exp.getVariants().stream().map(this::mapVariantToDTO).collect(Collectors.toList()));
        
        dto.setResults(calculateResults(exp));
        
        return dto;
    }

    private ExperimentResultsDTO calculateResults(Experiment exp) {
        List<ExperimentMetric> allMetrics = metricRepo.findByExperimentId(exp.getId());
        Double progress = calculateProgress(exp);

        if (allMetrics.isEmpty()) {
            return ExperimentResultsDTO.builder()
                .progressPercentage(progress)
                .statusMessage("Awaiting baseline data...")
                .sampleSize(0)
                .primaryLift(BigDecimal.ZERO)
                .confidence(new BigDecimal("50.00"))
                .build();
        }

        String primaryMetricKey = exp.getExecutionConfig().getPrimaryMetric();
        List<ExperimentMetric> relevantMetrics = allMetrics.stream()
            .filter(m -> primaryMetricKey == null || m.getMetricType().equalsIgnoreCase(primaryMetricKey))
            .toList();

        if (relevantMetrics.isEmpty()) {
            return ExperimentResultsDTO.builder()
                .progressPercentage(progress)
                .statusMessage("No data for: " + primaryMetricKey)
                .sampleSize(0)
                .build();
        }

        Map<UUID, List<ExperimentMetric>> byVariant = relevantMetrics.stream()
            .filter(m -> m.getVariant() != null)
            .collect(Collectors.groupingBy(m -> m.getVariant().getId()));

        ExperimentVariant control = exp.getVariants().stream().filter(ExperimentVariant::isControl).findFirst().orElse(null);
        ExperimentVariant treatment = exp.getVariants().stream().filter(v -> !v.isControl()).findFirst().orElse(null);

        BigDecimal controlMean = calculateMean(byVariant.get(control != null ? control.getId() : null));
        BigDecimal treatmentMean = calculateMean(byVariant.get(treatment != null ? treatment.getId() : null));

        BigDecimal lift = BigDecimal.ZERO;
        if (controlMean != null && controlMean.compareTo(BigDecimal.ZERO) > 0 && treatmentMean != null) {
            lift = treatmentMean.subtract(controlMean)
                .divide(controlMean, 4, java.math.RoundingMode.HALF_UP)
                .multiply(new BigDecimal(100));
        }

        long daysActive = java.time.Duration.between(exp.getStartDate(), LocalDateTime.now()).toDays();
        boolean minDurationMet = daysActive >= exp.getExecutionConfig().getMinDurationDays();

        String noveltyWarning = null;
        if (relevantMetrics.size() > 20) {
            noveltyWarning = detectNoveltyEffect(relevantMetrics);
        }

        return ExperimentResultsDTO.builder()
            .primaryLift(lift.setScale(2, java.math.RoundingMode.HALF_UP))
            .confidence(calculateConfidence(controlMean, treatmentMean, relevantMetrics.size()))
            .sampleSize(relevantMetrics.size())
            .controlValue(controlMean)
            .treatmentValue(treatmentMean)
            .progressPercentage(progress)
            .isSignificant(calculateConfidence(controlMean, treatmentMean, relevantMetrics.size()).compareTo(new BigDecimal("95.00")) >= 0)
            .minDurationMet(minDurationMet)
            .noveltyWarning(noveltyWarning)
            .statusMessage(exp.getStatus() == ExperimentStatus.RUNNING ? "Live Analysis" : "Final Report")
            .build();
    }

    private String detectNoveltyEffect(List<ExperimentMetric> metrics) {
        // Split metrics into first half and second half
        int mid = metrics.size() / 2;
        BigDecimal firstHalfMean = calculateMean(metrics.subList(0, mid));
        BigDecimal secondHalfMean = calculateMean(metrics.subList(mid, metrics.size()));

        if (firstHalfMean != null && secondHalfMean != null) {
            double decay = firstHalfMean.subtract(secondHalfMean).divide(firstHalfMean, 4, java.math.RoundingMode.HALF_UP).doubleValue();
            if (decay > 0.3) { // 30% decay in lift/performance
                return "Caution: Significant performance decay detected. Possible novelty effect.";
            }
        }
        return null;
    }

    private String getCurrentMealPeriod() {
        int hour = LocalDateTime.now().getHour();
        if (hour < 11) return "BREAKFAST";
        if (hour < 16) return "LUNCH";
        if (hour < 22) return "DINNER";
        return "LATE_NIGHT";
    }

    private BigDecimal calculateMean(List<ExperimentMetric> metrics) {
        if (metrics == null || metrics.isEmpty()) return null;
        BigDecimal sum = metrics.stream()
            .map(ExperimentMetric::getMetricValue)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        return sum.divide(new BigDecimal(metrics.size()), 4, java.math.RoundingMode.HALF_UP);
    }

    private Double calculateProgress(Experiment exp) {
        if (exp.getStartDate() == null) return 0.0;
        if (exp.getStatus() == ExperimentStatus.COMPLETED) return 100.0;
        if (exp.getEndDate() == null) return 50.0;
        
        long total = java.time.Duration.between(exp.getStartDate(), exp.getEndDate()).toMillis();
        long elapsed = java.time.Duration.between(exp.getStartDate(), LocalDateTime.now()).toMillis();
        
        if (total <= 0) return 100.0;
        double p = (double) elapsed / total * 100.0;
        return Math.min(100.0, Math.max(0.0, p));
    }

    private BigDecimal calculateConfidence(BigDecimal c, BigDecimal t, int samples) {
        if (samples < 5) return new BigDecimal("50.00");
        double base = 75.0 + Math.min(20.0, (double) samples / 10.0);
        return new BigDecimal(base).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    private HypothesisDTO mapHypothesisToDTO(Hypothesis h) {
        if (h == null) return null;
        return HypothesisDTO.builder()
            .description(h.getDescription())
            .targetAudience(h.getTargetAudience())
            .expectedValue(h.getExpectedValue())
            .confidenceLevel(h.getConfidenceLevel())
            .build();
    }

    private Hypothesis mapDTOToHypothesis(HypothesisDTO dto) {
        if (dto == null) return null;
        Hypothesis h = new Hypothesis();
        h.setDescription(dto.getDescription());
        h.setTargetAudience(dto.getTargetAudience());
        h.setExpectedValue(dto.getExpectedValue());
        h.setConfidenceLevel(dto.getConfidenceLevel());
        return h;
    }

    private VariantDTO mapVariantToDTO(ExperimentVariant v) {
        VariantDTO dto = new VariantDTO();
        dto.setId(v.getId());
        dto.setVariantKey(v.getVariantKey());
        dto.setName(v.getName());
        dto.setAllocation(v.getAllocation());
        dto.setConfig(v.getConfig());
        dto.setControl(v.isControl());
        dto.setStatus(v.getStatus());
        return dto;
    }
}
