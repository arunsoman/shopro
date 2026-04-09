package mls.sho.dms.application.kds.service;

import mls.sho.dms.application.kds.dto.KdsDtos.ManualTicketRequest;
import mls.sho.dms.application.kds.entity.KdsTicket;

/**
 * Service for dispatching tickets to stations.
 */
public interface TicketDispatchService {

    /**
     * Fire a new ticket from the expo screen.
     */
    KdsTicket createManualTicket(Long outletId, ManualTicketRequest req);
}
