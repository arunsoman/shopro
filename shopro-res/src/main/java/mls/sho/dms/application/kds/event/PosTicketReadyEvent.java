package mls.sho.dms.application.kds.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PosTicketReadyEvent {
    private final Long posOrderId;
    private final String ticketNumber;
}
