package mls.sho.dms.application.engineering.dto;

/**
 * Menu Engineering DTO Package
 * 
 * This package contains all Input and Output Data Transfer Objects
 * for the Menu Engineering API module.
 * 
 * ============================================================
 * INPUT DTOs (Requests)
 * ============================================================
 * 
 * Analysis:
 * - AnalysisRequest              POST /analyze
 * - CategoryAnalysisRequest     POST /analyze/by-category
 * 
 * Period:
 * - CreatePeriodRequest         POST /periods
 * - ComparePeriodsRequest       POST /periods/compare
 * 
 * Settings:
 * - UpdateSettingsRequest       PUT /settings
 * 
 * Recommendations:
 * - UpdateRecommendationRequest     PATCH /recommendations/{id}
 * - AssignRecommendationRequest     PATCH /recommendations/{id}/assign
 * - SetDueDateRequest               PATCH /recommendations/{id}/due-date
 * - AddCommentRequest              PATCH /recommendations/{id}/comment
 * - ApprovalRequest                POST /recommendations/{id}/approve, /reject
 * 
 * ============================================================
 * OUTPUT DTOs (Responses)
 * ============================================================
 * 
 * Analysis:
 * - MenuEngResultDTO                Analysis results
 * - CategoryAnalysisResultDTO       Category-specific results
 * 
 * Period:
 * - PeriodResponse                  Period details
 * - ComparePeriodsResponse          Period comparison
 * 
 * Settings:
 * - SettingsResponse                Settings details
 * 
 * Recommendations:
 * - RecommendationResponse          Recommendation details
 * 
 * Reports:
 * - ExecutiveSummaryResponse       KPIs and health score
 * - MatrixVisualizationResponse    4-quadrant data
 * - CategoryDistributionResponse   Category breakdown
 * - TopPerformerResponse            Top revenue items
 * - OpportunityItemResponse        High-margin/low-pop items
 * - ExportDataResponse              PDF/Excel/CSV data
 * 
 * Workflow:
 * - WorkflowStatsResponse           Pipeline statistics
 * - QuarterlyScheduleResponse       Review schedule
 * - ReminderResponse               Review reminders
 */
public class DtoPackage {
    // Marker class for Javadoc purposes
}
