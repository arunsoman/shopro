package mls.sho.dms.application.kds.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class KdsQueueChangedEvent {
    private final Long outletId;
    private final Long stationId; // null if all stations in outlet changed
}
