package mls.sho.dms.application.pos.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TableSessionDto {
    private Long id;
    private Long tableId;
    private Integer guestCount;
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;
    private String serverName;
    private String serverRole;
}
