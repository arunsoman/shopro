package mls.sho.dms.application.kds.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class KdsSettingsChangedEvent {
    private final Long outletId;
}
