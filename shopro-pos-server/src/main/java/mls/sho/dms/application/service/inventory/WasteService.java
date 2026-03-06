package mls.sho.dms.application.service.inventory;

import mls.sho.dms.application.dto.inventory.LogWasteRequest;

public interface WasteService {
    void logWaste(LogWasteRequest request);
}
