package mls.sho.dms.application.engineering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Response DTO for export data (PDF/Excel/CSV preparation).
 * Contains all data needed for generating export files.
 * 
 * OUTPUT: GET /periods/{id}/export
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExportDataResponse {
    
    /**
     * Report title.
     */
    private String reportTitle;
    
    /**
     * Period name.
     */
    private String periodName;
    
    /**
     * Period start date.
     */
    private String startDate;
    
    /**
     * Period end date.
     */
    private String endDate;
    
    /**
     * Report generation timestamp.
     */
    private String generatedAt;
    
    /**
     * All items with their analysis data.
     */
    private List<Map<String, Object>> items;
    
    /**
     * Summary data.
     */
    private Map<String, Object> summary;
    
    /**
     * Available export formats.
     */
    private ExportFormats availableFormats;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExportFormats {
        /**
         * URL or format spec for PDF export.
         */
        private String pdf;
        
        /**
         * URL or format spec for Excel export.
         */
        private String excel;
        
        /**
         * URL or format spec for CSV export.
         */
        private String csv;
    }
}
