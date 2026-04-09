package mls.sho.dms.application.service.inventory;

import mls.sho.dms.application.dto.inventory.LogWasteRequest;
import mls.sho.dms.application.dto.inventory.WasteLogResponse;
import java.util.List;

public interface WasteService {
    void logWaste(LogWasteRequest request);
    List<WasteLogResponse> findWasteLog();
}
