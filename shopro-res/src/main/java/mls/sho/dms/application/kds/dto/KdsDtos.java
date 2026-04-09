package mls.sho.dms.application.kds.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import mls.sho.dms.application.kds.entity.KdsStation.StationType;
import mls.sho.dms.application.kds.entity.KdsTicket.TicketPriority;
import mls.sho.dms.application.kds.entity.KdsTicket.TicketSource;
import mls.sho.dms.application.kds.entity.KdsTicketItem.ItemStatus;

import java.time.LocalDateTime;
import java.util.List;

public class KdsDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StationTicketDto {
        private Long id;
        private Long ticketId;
        private String ticketNumber;
        private Integer guestCount;
        private String source;
        private LocalDateTime firedAt;
        private Long secondsElapsed;
        private String priority;
        private String serverNote;
        private List<StationTicketItemDto> items;
        private Integer courseNumber;
        private CourseInfoDto courseInfo;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CourseInfoDto {
        private Integer activeCourse;
        private List<Integer> pendingCourses;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StationQueuePageDto {
        private Long stationId;
        private String stationName;
        private StationType stationType;
        private List<StationTicketDto> tickets;
        private int totalInQueue;
        private int totalTicketsInQueue;
        private int remainingCount;
        private int deviceCapacity;
        private StationSettingsDto settings;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StationTicketItemDto {
        private Long id; // stationTicketItemId
        private String name;
        private Integer quantity;
        private Integer prepTimeMinutes;
        private List<String> modifications;
        private List<String> allergenFlags;
        private String status;
        private Long secondsElapsed;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BumpResultDto {
        private Long stationItemId;
        private ItemStatus ticketItemStatus;
        private String ticketStatus; 
        private Integer prepTimeSeconds;
        private boolean ticketCompleted;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BumpAllResultDto {
        private Long ticketId;
        private int itemsBumped;
        private boolean ticketCompleted;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecallResultDto {
        private Long stationItemId;
        private Long ticketId;
        private LocalDateTime recalledAt;
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecallAllResultDto {
        private Long ticketId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HeartbeatRequestDto {
        private long clientTimeMs;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HeartbeatResponseDto {
        private long serverTimeMs;
        private long settingsVersion;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StationSettingsDto {
        private int warnThresholdSeconds;
        private int alertThresholdSeconds;
        private boolean enableStartAction;
    }

    // ── Expo DTOs ───────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExpoQueueDto {
        private Long outletId;
        private String outletName;
        private int activeCount;
        private int ticketsOverWarn;
        private int ticketsOverAlert;
        private List<ExpoTicketDto> tickets;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExpoTicketDto {
        private Long ticketId;
        private String ticketNumber;
        private Integer guestCount;
        private String source;
        private String priority;
        private String serverNote;
        private LocalDateTime firedAt;
        private Long secondsElapsed;
        private OverallStatus overallStatus;
        private List<StationBreakdownDto> stationBreakdown;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StationBreakdownDto {
        private Long stationId;
        private String stationName;
        private StationType stationType;
        private StationStatus stationStatus;
        private List<StationTicketItemDto> items;
    }

    public enum OverallStatus {
        WAITING, COOKING, READY
    }

    public enum StationStatus {
        NOT_STARTED, IN_PROGRESS, ALL_DONE
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExpoTicketDetailDto {
        private Long ticketId;
        private String ticketNumber;
        private Integer guestCount;
        private String source;
        private String priority;
        private String serverNote;
        private LocalDateTime firedAt;
        private String overallStatus;
        private List<StationBreakdownDto> stationBreakdown;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CompletedTicketDto {
        private Long ticketId;
        private String ticketNumber;
        private LocalDateTime firedAt;
        private LocalDateTime completedAt;
        private Integer prepTimeSeconds;
        private boolean canRecall;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StationDeviceStatusDto {
        private Long stationId;
        private String stationName;
        private List<DeviceStatusInfoDto> devices;
        private boolean hasOnlineDevice;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DeviceStatusInfoDto {
        private Long deviceId;
        private String deviceName;
        private String deviceType; // Enum string
        private String status;     // ONLINE | OFFLINE
        private LocalDateTime lastSeenAt;
    }

    // ── Requests ────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ManualTicketRequest {
        private String ticketNumber;
        private Integer guestCount;
        private String serverNote;
        private List<ManualTicketItemRequest> items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ManualTicketItemRequest {
        private Long menuItemId;
        private String menuItemName;
        private Integer pluNumber;
        private Integer quantity;
        private List<String> modifications;
        private List<String> allergenFlags;
        private Integer courseNumber;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddTicketItemsRequest {
        private List<ManualTicketItemRequest> items;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FireCourseRequest {
        private int courseNumber;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SetNoteRequest {
        private String note;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VoidRequest {
        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateKdsSettingsRequest {
        private Integer warnThresholdSeconds;
        private Integer alertThresholdSeconds;
        private Integer maxTicketsPerScreen;
        private String sortOrder;
        private Boolean enableStartAction;
        private Boolean enableRunnerNotification;
        private Boolean enableAudioAlerts;
        private Boolean enableRecall;
        private Integer recallWindowSeconds;
        private Boolean enableCourseManagement;
        private Boolean highlightAllergens;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddRoutingRequest {
        public enum RoutingType { MENU_ITEM_ID, PLU, CATEGORY }
        private RoutingType routingType;
        private String routingKey;
        private String label;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StationRoutingDto {
        private Long id;
        private String routingType;
        private String routingKey;
        private String label;

        public static StationRoutingDto from(mls.sho.dms.application.kds.entity.StationRouting routing) {
            return StationRoutingDto.builder()
                .id(routing.getId())
                .routingType(routing.getRoutingType().name())
                .routingKey(routing.getRoutingKey())
                .label(routing.getLabel())
                .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegisterDeviceRequest {
        private Long stationId;
        private String name;
        private String deviceType;
        private String orientation;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class KdsDevicePairingDto {
        private Long deviceId;
        private String name;
        private String pairingCode;
        private LocalDateTime pairingCodeExpiresAt;
    }

    // ── Analytics DTOs ──────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OutletSummaryDto {
        private Long outletId;
        private String outletName;
        private int activeTickets;
        private int avgSecondsElapsed;
        private int ticketsOverWarn;
        private int ticketsOverAlert;
        private int stationsOnline;
        private int stationsTotal;
        private LocalDateTime lastActivity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StationPrepTimeDto {
        private Long stationId;
        private String stationName;
        private StationType stationType;
        private Integer avgSeconds;
        private Integer p50Seconds;
        private Integer p90Seconds;
        private Integer maxSeconds;
        private Integer sampleCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StationThroughputDto {
        private Long stationId;
        private String stationName;
        private List<HourlyThroughputDto> hourlyBreakdown;
        private int peakHour;
        private int totalTickets;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HourlyThroughputDto {
        private int hour;
        private int ticketCount;
        private int itemCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VoidRateDto {
        private Long menuItemId;
        private String menuItemName;
        private Integer pluNumber;
        private int totalFired;
        private int totalVoided;
        private double voidRatePct;
        private String avgVoidReasonCategory;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CentralAnalyticsDto {
        private Long restaurantId;
        private List<OutletAnalyticsDto> outlets;
        private List<CrossOutletComparisonDto> crossOutletComparison;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OutletAnalyticsDto {
        private Long outletId;
        private String outletName;
        private List<StationPrepTimeDto> stations;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CrossOutletComparisonDto {
        private StationType stationType;
        private String fastestOutlet;
        private String slowestOutlet;
        private int avgAcrossAll;
    }

    // Existing wrapper for manual mapping if needed
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KdsSettingsDto {
        private Integer warnThresholdSeconds;
        private Integer alertThresholdSeconds;
        private Integer maxTicketsPerScreen;
        private String sortOrder;
        private boolean enableStartAction;
        private boolean enableRunnerNotification;
        private boolean enableAudioAlerts;
        private boolean enableRecall;
        private Integer recallWindowSeconds;
        private boolean enableCourseManagement;
        private boolean highlightAllergens;

        public static KdsSettingsDto from(mls.sho.dms.application.kds.entity.KdsSettings settings) {
            KdsSettingsDto dto = new KdsSettingsDto();
            dto.setWarnThresholdSeconds(settings.getWarnThresholdSeconds());
            dto.setAlertThresholdSeconds(settings.getAlertThresholdSeconds());
            dto.setMaxTicketsPerScreen(settings.getMaxTicketsPerScreen());
            dto.setSortOrder(settings.getSortOrder().name());
            dto.setEnableStartAction(settings.isEnableStartAction());
            dto.setEnableRunnerNotification(settings.isEnableRunnerNotification());
            dto.setEnableAudioAlerts(settings.isEnableAudioAlerts());
            dto.setEnableRecall(settings.isEnableRecall());
            dto.setRecallWindowSeconds(settings.getRecallWindowSeconds());
            dto.setEnableCourseManagement(settings.isEnableCourseManagement());
            dto.setHighlightAllergens(settings.isHighlightAllergens());
            return dto;
        }
    }
}
