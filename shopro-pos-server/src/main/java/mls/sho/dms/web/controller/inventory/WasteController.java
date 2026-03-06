package mls.sho.dms.web.controller.inventory;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.LogWasteRequest;
import mls.sho.dms.application.service.inventory.WasteService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/inventory/waste")
@RequiredArgsConstructor
@Tag(name = "Inventory Waste", description = "Manual waste logging for ingredients and orders")
public class WasteController {

    private final WasteService wasteService;

    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logWaste(@Valid @RequestBody LogWasteRequest request) {
        wasteService.logWaste(request);
    }
}
