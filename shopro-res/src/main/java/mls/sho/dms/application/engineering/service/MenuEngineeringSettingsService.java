package mls.sho.dms.application.engineering.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.engineering.entity.MenuEngineeringSettings;
import mls.sho.dms.application.engineering.repository.MenuEngineeringSettingsRepository;
import mls.sho.dms.application.pos.repository.RestaurantRepository;
import mls.sho.dms.entity.Restaurant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MenuEngineeringSettingsService {

    private final MenuEngineeringSettingsRepository settingsRepository;
    private final RestaurantRepository restaurantRepository;

    @Transactional
    public Map<String, Object> getSettings(Long restaurantId) {
        MenuEngineeringSettings settings = settingsRepository.findByRestaurantId(restaurantId)
                .orElseGet(() -> createDefaultSettings(restaurantId));
        
        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("restaurantId", restaurantId);
        result.put("popularityThresholdFactor", settings.getPopularityThresholdFactor());
        result.put("foodCostWarningThreshold", settings.getFoodCostWarningThreshold());
        result.put("minContributionMargin", settings.getMinContributionMargin());
        result.put("defaultDaypart", settings.getDefaultDaypart());
        result.put("restaurantType", settings.getRestaurantType() != null ? settings.getRestaurantType() : "CASUAL");
        result.put("winnerPopularityThreshold", settings.getWinnerPopularityThreshold() != null ? settings.getWinnerPopularityThreshold() : new BigDecimal("0.70"));
        result.put("winnerMarginThreshold", settings.getWinnerMarginThreshold() != null ? settings.getWinnerMarginThreshold() : new BigDecimal("3.00"));
        result.put("autoGenerateRecommendations", settings.getAutoGenerateRecommendations() != null ? settings.getAutoGenerateRecommendations() : true);
        result.put("reminderDaysBefore", settings.getReminderDaysBefore() != null ? settings.getReminderDaysBefore() : 3);
        result.put("emailNotificationsEnabled", settings.getEmailNotificationsEnabled() != null ? settings.getEmailNotificationsEnabled() : true);
        result.put("notificationEmails", settings.getNotificationEmails() != null ? settings.getNotificationEmails() : "");
        result.put("targetWinnerPct", settings.getTargetWinnerPct() != null ? settings.getTargetWinnerPct() : new BigDecimal("20.00"));
        result.put("targetLoserPct", settings.getTargetLoserPct() != null ? settings.getTargetLoserPct() : new BigDecimal("10.00"));
        
        return result;
    }

    @Transactional
    public MenuEngineeringSettings updateSettings(Long restaurantId, Map<String, Object> body) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        MenuEngineeringSettings settings = settingsRepository.findByRestaurantId(restaurantId)
                .orElseGet(() -> {
                    MenuEngineeringSettings newSettings = new MenuEngineeringSettings();
                    newSettings.setRestaurant(restaurant);
                    return newSettings;
                });

        if (body.containsKey("popularityThresholdFactor")) {
            settings.setPopularityThresholdFactor(
                    new BigDecimal(body.get("popularityThresholdFactor").toString()));
        }
        if (body.containsKey("foodCostWarningThreshold")) {
            settings.setFoodCostWarningThreshold(
                    new BigDecimal(body.get("foodCostWarningThreshold").toString()));
        }
        if (body.containsKey("minContributionMargin")) {
            settings.setMinContributionMargin(
                    new BigDecimal(body.get("minContributionMargin").toString()));
        }
        if (body.containsKey("defaultDaypart")) {
            settings.setDefaultDaypart(body.get("defaultDaypart").toString());
        }
        if (body.containsKey("restaurantType")) {
            settings.setRestaurantType(body.get("restaurantType").toString());
        }
        if (body.containsKey("winnerPopularityThreshold")) {
            settings.setWinnerPopularityThreshold(
                    new BigDecimal(body.get("winnerPopularityThreshold").toString()));
        }
        if (body.containsKey("winnerMarginThreshold")) {
            settings.setWinnerMarginThreshold(
                    new BigDecimal(body.get("winnerMarginThreshold").toString()));
        }
        if (body.containsKey("autoGenerateRecommendations")) {
            settings.setAutoGenerateRecommendations(
                    (Boolean) body.get("autoGenerateRecommendations"));
        }
        if (body.containsKey("reminderDaysBefore")) {
            settings.setReminderDaysBefore(
                    Integer.parseInt(body.get("reminderDaysBefore").toString()));
        }
        if (body.containsKey("emailNotificationsEnabled")) {
            settings.setEmailNotificationsEnabled(
                    (Boolean) body.get("emailNotificationsEnabled"));
        }
        if (body.containsKey("notificationEmails")) {
            settings.setNotificationEmails(body.get("notificationEmails").toString());
        }
        if (body.containsKey("targetWinnerPct")) {
            settings.setTargetWinnerPct(
                    new BigDecimal(body.get("targetWinnerPct").toString()));
        }
        if (body.containsKey("targetLoserPct")) {
            settings.setTargetLoserPct(
                    new BigDecimal(body.get("targetLoserPct").toString()));
        }

        return settingsRepository.save(settings);
    }

    private MenuEngineeringSettings createDefaultSettings(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        
        MenuEngineeringSettings settings = new MenuEngineeringSettings();
        settings.setRestaurant(restaurant);
        settings.setPopularityThresholdFactor(new BigDecimal("0.70"));
        settings.setFoodCostWarningThreshold(new BigDecimal("35.00"));
        settings.setMinContributionMargin(new BigDecimal("2.00"));
        settings.setDefaultDaypart("ALL");
        settings.setRestaurantType("CASUAL");
        settings.setWinnerPopularityThreshold(new BigDecimal("0.70"));
        settings.setWinnerMarginThreshold(new BigDecimal("3.00"));
        settings.setAutoGenerateRecommendations(true);
        settings.setReminderDaysBefore(3);
        settings.setEmailNotificationsEnabled(true);
        settings.setTargetWinnerPct(new BigDecimal("20.00"));
        settings.setTargetLoserPct(new BigDecimal("10.00"));
        
        return settingsRepository.save(settings);
    }

    @Transactional(readOnly = true)
    public Optional<MenuEngineeringSettings> getSettingsEntity(Long restaurantId) {
        return settingsRepository.findByRestaurantId(restaurantId);
    }
}
