package mls.sho.dms.application.dto.crm;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServerFeedbackStatsResponse {
    private UUID serverId;
    private String serverName;
    private long ratingCount;
    private double averageRating;
}
