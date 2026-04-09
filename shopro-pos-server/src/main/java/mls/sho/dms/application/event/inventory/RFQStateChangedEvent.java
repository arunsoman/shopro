package mls.sho.dms.application.event.inventory;

import lombok.Getter;
import mls.sho.dms.entity.inventory.procurement.RFQ;
import mls.sho.dms.entity.inventory.procurement.RfqStatus;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class RFQStateChangedEvent extends ApplicationEvent {
    private final RFQ rfq;
    private final RfqStatus fromStatus;
    private final RfqStatus toStatus;
    private final UUID actorId;
    private final String reason;

    public RFQStateChangedEvent(Object source, RFQ rfq, RfqStatus fromStatus, RfqStatus toStatus, UUID actorId, String reason) {
        super(source);
        this.rfq = rfq;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.actorId = actorId;
        this.reason = reason;
    }
}
