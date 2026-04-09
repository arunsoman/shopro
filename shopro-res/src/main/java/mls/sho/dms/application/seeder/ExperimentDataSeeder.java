package mls.sho.dms.application.seeder;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.analytics.repository.ExperimentEventRepository;
import mls.sho.dms.application.analytics.repository.ExperimentMetricRepository;
import mls.sho.dms.application.analytics.repository.ExperimentRepository;
import mls.sho.dms.application.analytics.repository.ExperimentVariantRepository;
import mls.sho.dms.common.enums.*;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.entity.experiment.Experiment;
import mls.sho.dms.entity.experiment.ExperimentMetric;
import mls.sho.dms.entity.experiment.ExperimentVariant;
import mls.sho.dms.entity.experiment.config.ExecutionConfig;
import mls.sho.dms.entity.experiment.config.Hypothesis;
import mls.sho.dms.entity.experiment.config.RandomizationConfig;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ExperimentDataSeeder {

    private final ExperimentRepository experimentRepo;
    private final ExperimentVariantRepository variantRepo;
    private final ExperimentMetricRepository metricRepo;
    private final ExperimentEventRepository eventRepo;
    private final JdbcTemplate jdbcTemplate;
    private final Random random = new Random();

    @Transactional
    public void seed(Restaurant restaurant, UUID userId) {
        // Programmatically sync DB constraints (The Java Way)
        syncDatabaseConstraints();

        // Purge old seed data in FK-safe order:
        //   experiment_events → experiment_metrics → experiment_variants → experiments
        // (experiment_events is NOT cascaded from Experiment, so must be deleted explicitly first)
        eventRepo.deleteAll();
        metricRepo.deleteAll();
        variantRepo.deleteAll();
        experimentRepo.deleteAll();

        // 1. EXP-2026-LTY: Tiered Loyalty Boost (RUNNING)
        seedLoyaltyExperiment(restaurant, userId);

        // 2. EXP-2026-UPS: AI Upsell Prompting (RUNNING)
        seedUpsellExperiment(restaurant, userId);

        // 3. EXP-2026-HHR: Late Night Happy Hour (COMPLETED)
        seedHappyHourExperiment(restaurant, userId);

        // 4. EXP-2026-TBT: QR Quick-Pay Pilot (DRAFT)
        seedDraftExperiment(restaurant, userId);
    }

    private void syncDatabaseConstraints() {
        jdbcTemplate.execute("ALTER TABLE experiments DROP CONSTRAINT IF EXISTS experiments_type_check");
        jdbcTemplate.execute("ALTER TABLE experiments ADD CONSTRAINT experiments_type_check " +
                "CHECK (type IN ('AB_TEST', 'MULTI_ARMED', 'FACTORIAL', 'LOYALTY', 'SPEED', 'MARGIN', 'UPSELL', 'MENU'))");
    }

    private void seedLoyaltyExperiment(Restaurant restaurant, UUID userId) {
        if (experimentRepo.existsByExperimentKey("EXP-2026-LTY")) return;
        Experiment exp = createBaseExperiment(restaurant, userId, "EXP-2026-LTY", "Tiered Loyalty Boost", ExperimentType.LOYALTY, ExperimentStatus.RUNNING, ManagerRole.GM);
        exp.setStartDate(LocalDateTime.now().minusDays(10));
        exp.setEndDate(LocalDateTime.now().plusDays(20));

        Hypothesis h = new Hypothesis();
        h.setDescription("Offering double points on Tuesdays increases repeat visits by 15%.");
        h.setTargetAudience("Loyal Guests");
        h.setExpectedValue(15);
        h.setConfidenceLevel(new BigDecimal("95.00"));
        exp.setHypothesis(h);

        ExecutionConfig e = exp.getExecutionConfig();
        e.setPrimaryMetric("revisit");
        
        ExperimentVariant control = createVariant(exp, "control", "Standard Points", true, "1.0");
        ExperimentVariant treatment = createVariant(exp, "treatment", "Double Points Tuesday", false, "2.0");
        exp.setVariants(List.of(control, treatment));
        
        experimentRepo.save(exp);
        // Seed with Novelty Effect: first 5 days are high lift, next 5 are lower
        seedMetricsWithNovelty(exp, control, treatment, "revisit", 0.12, 0.20, 0.13, 10);
    }

    private void seedMetricsWithNovelty(Experiment exp, ExperimentVariant control, ExperimentVariant treatment, String metricType, double controlBase, double treatmentEarlyBase, double treatmentLateBase, int days) {
        List<ExperimentMetric> metrics = new ArrayList<>();
        LocalDate start = exp.getStartDate().toLocalDate();
        
        for (int i = 0; i < days; i++) {
            LocalDate date = start.plusDays(i);
            double tBase = (i < 5) ? treatmentEarlyBase : treatmentLateBase;
            
            metrics.add(createDummyMetric(exp, control, date, metricType, controlBase, i));
            metrics.add(createDummyMetric(exp, tBase > 0 ? treatment : control, date, metricType, tBase, i));
        }
        metricRepo.saveAll(metrics);
    }

    private ExperimentMetric createDummyMetric(Experiment exp, ExperimentVariant v, LocalDate date, String type, double base, int index) {
        ExperimentMetric m = new ExperimentMetric();
        m.setExperiment(exp);
        m.setVariant(v);
        m.setMetricDate(date);
        m.setMetricType(type);
        double val = base + (random.nextDouble() * base * 0.1) - (base * 0.05);
        m.setMetricValue(new BigDecimal(val).setScale(4, java.math.RoundingMode.HALF_UP));
        m.setSampleSize(20 + random.nextInt(10));
        
        Map<String, String> dims = new java.util.HashMap<>();
        dims.put("dayOfWeek", date.getDayOfWeek().name());
        dims.put("mealPeriod", index % 2 == 0 ? "LUNCH" : "DINNER");
        m.setDimensions(dims);
        return m;
    }

    private void seedUpsellExperiment(Restaurant restaurant, UUID userId) {
        if (experimentRepo.existsByExperimentKey("EXP-2026-UPS")) return;
        Experiment exp = createBaseExperiment(restaurant, userId, "EXP-2026-UPS", "AI Upsell Prompting", ExperimentType.UPSELL, ExperimentStatus.RUNNING, ManagerRole.CHEF);
        exp.setStartDate(LocalDateTime.now().minusDays(5));
        exp.setEndDate(LocalDateTime.now().plusDays(25));

        Hypothesis h = new Hypothesis();
        h.setDescription("Automated POS prompts for appetizers will increase attach rate by 8%.");
        h.setTargetAudience("All Guests");
        h.setExpectedValue(8);
        h.setConfidenceLevel(new BigDecimal("90.00"));
        exp.setHypothesis(h);

        ExecutionConfig e = exp.getExecutionConfig();
        e.setPrimaryMetric("upsell");
        
        ExperimentVariant control = createVariant(exp, "control", "No Prompt", true, "off");
        ExperimentVariant treatment = createVariant(exp, "treatment", "Smart Prompt", false, "on");
        exp.setVariants(List.of(control, treatment));
        
        experimentRepo.save(exp);
        seedMetrics(exp, control, treatment, "upsell", 0.22, 0.26, 5);
    }

    private void seedHappyHourExperiment(Restaurant restaurant, UUID userId) {
        if (experimentRepo.existsByExperimentKey("EXP-2026-HHR")) return;
        Experiment exp = createBaseExperiment(restaurant, userId, "EXP-2026-HHR", "Late Night Happy Hour", ExperimentType.MARGIN, ExperimentStatus.COMPLETED, ManagerRole.CFO);
        exp.setStartDate(LocalDateTime.now().minusDays(40));
        exp.setEndDate(LocalDateTime.now().minusDays(10));

        Hypothesis h = new Hypothesis();
        h.setDescription("Extending Happy Hour to midnight boosts late-night revenue by 20%.");
        h.setTargetAudience("All Guests");
        h.setExpectedValue(20);
        h.setConfidenceLevel(new BigDecimal("95.00"));
        exp.setHypothesis(h);

        ExecutionConfig e = exp.getExecutionConfig();
        e.setPrimaryMetric("revenue");
        
        ExperimentVariant control = createVariant(exp, "control", "Standard 9PM End", true, "9pm");
        ExperimentVariant treatment = createVariant(exp, "treatment", "Extended 12AM End", false, "12am");
        exp.setVariants(List.of(control, treatment));
        
        experimentRepo.save(exp);
        seedMetrics(exp, control, treatment, "revenue", 450.0, 560.0, 30);
    }

    private void seedDraftExperiment(Restaurant restaurant, UUID userId) {
        if (experimentRepo.existsByExperimentKey("EXP-2026-TBT")) return;
        Experiment exp = createBaseExperiment(restaurant, userId, "EXP-2026-TBT", "QR Quick-Pay Pilot", ExperimentType.SPEED, ExperimentStatus.DRAFT, ManagerRole.GM);
        
        Hypothesis h = new Hypothesis();
        h.setDescription("QR-based self-payment reduces average table dwell time by 12 minutes.");
        h.setTargetAudience("Lunch Guests");
        h.setExpectedValue(15);
        h.setConfidenceLevel(new BigDecimal("95.00"));
        exp.setHypothesis(h);

        ExecutionConfig e = exp.getExecutionConfig();
        e.setPrimaryMetric("dwell");
        
        createVariant(exp, "control", "Legacy Bill Pay", true, "manual");
        createVariant(exp, "treatment", "QR Instant Pay", false, "qr");
        
        experimentRepo.save(exp);
    }

    private Experiment createBaseExperiment(Restaurant restaurant, UUID userId, String key, String name, ExperimentType type, ExperimentStatus status, ManagerRole role) {
        Experiment exp = new Experiment();
        exp.setRestaurant(restaurant);
        exp.setExperimentKey(key);
        exp.setName(name);
        exp.setType(type);
        exp.setStatus(status);
        exp.setOwnerRole(role);
        exp.setCreatedBy(userId);
        exp.setRandomizationConfig(new RandomizationConfig());
        exp.setExecutionConfig(new ExecutionConfig());
        return exp;
    }

    private ExperimentVariant createVariant(Experiment exp, String key, String name, boolean isControl, String configVal) {
        ExperimentVariant v = new ExperimentVariant();
        v.setExperiment(exp);
        v.setVariantKey(key);
        v.setName(name);
        v.setAllocation(new BigDecimal("0.5000"));
        v.setControl(isControl);
        v.setConfig(Map.of("value", configVal));
        v.setStatus(VariantStatus.ACTIVE);
        return v;
    }

    private void seedMetrics(Experiment exp, ExperimentVariant control, ExperimentVariant treatment, String metricType, double controlBase, double treatmentBase, int days) {
        List<ExperimentMetric> metrics = new ArrayList<>();
        LocalDate start = exp.getStartDate().toLocalDate();
        
        for (int i = 0; i < days; i++) {
            LocalDate date = start.plusDays(i);
            metrics.add(createDummyMetric(exp, control, date, metricType, controlBase, i));
            metrics.add(createDummyMetric(exp, treatment, date, metricType, treatmentBase, i));
        }
        metricRepo.saveAll(metrics);
    }
}
