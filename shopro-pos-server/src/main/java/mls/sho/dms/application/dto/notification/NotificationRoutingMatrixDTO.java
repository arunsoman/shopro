package mls.sho.dms.application.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRoutingMatrixDTO {
    private List<NotificationTypeDTO> types;
    private List<RecipientGroupDTO> groups;
    private List<ChannelDTO> channels;
    private Map<String, Map<String, List<String>>> matrix; // typeCode -> groupRoleCode -> channelTypes
}
