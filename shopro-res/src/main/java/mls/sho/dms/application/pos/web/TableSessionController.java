package mls.sho.dms.application.pos.web;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.pos.service.TableSessionService;
import org.springframework.web.bind.annotation.*;

/**
 * REST API for table sessions - DTO version (DISABLED).
 * Use PosController instead.
 */
@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/pos")
@RequiredArgsConstructor
public class TableSessionController {

    private final TableSessionService sessionService;

    // DISABLED - Use PosController endpoints instead
    // Duplicate mapping causes: Ambiguous mapping error
    
    /*
    @GetMapping("/tables")
    public List<DiningTableDto> getTables(@PathVariable Long restaurantId) {
        return List.of();
    }

    @PostMapping("/tables/{tableId}/open")
    public TableSessionDto openTable(...) { ... }

    @PostMapping("/sessions/{sessionId}/close")
    public void closeSession(...) { ... }
    */
}
