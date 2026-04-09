package mls.sho.dms.application.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChannelDTO {
    private UUID id;
    private String type;
    private String name;
}
