package mls.sho.dms.application.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationManualTriggerRequest {
    private String typeCode;
    private UUID recipientId;
    private String recipientGroup;
    private String payload; // JSON string
}
