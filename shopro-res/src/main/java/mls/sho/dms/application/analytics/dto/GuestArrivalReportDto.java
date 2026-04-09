package mls.sho.dms.application.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestArrivalReportDto {
    private LocalDate date;
    private Long guestCount;
    private Double intensity; // 0.0 to 1.0 based on relative volume
}
