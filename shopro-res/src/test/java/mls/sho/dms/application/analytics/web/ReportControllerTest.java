package mls.sho.dms.application.analytics.web;

import mls.sho.dms.application.analytics.dto.*;
import mls.sho.dms.application.analytics.service.ReportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReportService reportService;

    @Test
    public void testGetGuestArrivalHeatmap() throws Exception {
        GuestArrivalReportDto dto = GuestArrivalReportDto.builder()
                .date(LocalDate.of(2026, 4, 1))
                .guestCount(10L)
                .intensity(0.5)
                .build();

        when(reportService.getGuestArrivalHeatmap(anyLong(), anyString(), any(LocalDate.class)))
                .thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/restaurants/1/reports/guest-heatmap")
                .param("view", "month")
                .param("startDate", "2026-04-01")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].date").value("2026-04-01"))
                .andExpect(jsonPath("$[0].guestCount").value(10))
                .andExpect(jsonPath("$[0].intensity").value(0.5));
    }

    @Test
    public void testGetInventoryValuation() throws Exception {
        InventoryValuationDto dto = InventoryValuationDto.builder()
                .totalValue(new java.math.BigDecimal("1250.50"))
                .timestamp(java.time.LocalDateTime.now())
                .build();

        when(reportService.getInventoryValuation(anyLong()))
                .thenReturn(dto);

        mockMvc.perform(get("/api/v1/restaurants/1/reports/inventory-valuation")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalValue").value(1250.50));
    }

    @Test
    public void testGetCategoryDistribution() throws Exception {
        CategoryDistributionDto dto = CategoryDistributionDto.builder()
                .category("MEAT")
                .value(new java.math.BigDecimal("500.00"))
                .percentage(40.0)
                .build();

        when(reportService.getCategoryDistribution(anyLong(), any()))
                .thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/restaurants/1/reports/category-distribution")
                .param("type", "INVENTORY")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].category").value("MEAT"))
                .andExpect(jsonPath("$[0].percentage").value(40.0));
    }

    @Test
    public void testGetWasteSummary() throws Exception {
        WasteSummaryDto dto = WasteSummaryDto.builder()
                .totalWasteValue(new java.math.BigDecimal("150.00"))
                .topWasteItems(List.of())
                .wasteByReason(java.util.Map.of("SPOILAGE", new java.math.BigDecimal("100.00")))
                .build();

        when(reportService.getWasteSummary(anyLong(), any(), any()))
                .thenReturn(dto);

        mockMvc.perform(get("/api/v1/restaurants/1/reports/waste-summary")
                .param("startDate", "2026-04-01")
                .param("endDate", "2026-04-07")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalWasteValue").value(150.00))
                .andExpect(jsonPath("$.wasteByReason.SPOILAGE").value(100.00));
    }
}
