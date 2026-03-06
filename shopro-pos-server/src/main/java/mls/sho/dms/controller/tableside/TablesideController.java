package mls.sho.dms.controller.tableside;

import mls.sho.dms.dto.menu.MenuCategoryDto;
import mls.sho.dms.dto.menu.MenuItemDto;
import mls.sho.dms.dto.tableside.AddCartItemRequest;
import mls.sho.dms.dto.tableside.GuestCartItemDto;
import mls.sho.dms.dto.tableside.TablesideSessionDto;
import mls.sho.dms.service.tableside.TablesideService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tableside")
public class TablesideController {

    private final TablesideService tablesideService;

    public TablesideController(TablesideService tablesideService) {
        this.tablesideService = tablesideService;
    }

    @GetMapping("/scan/{qrToken}")
    public ResponseEntity<TablesideSessionDto> scanQrCode(@PathVariable UUID qrToken) {
        return ResponseEntity.ok(tablesideService.getSessionByQrToken(qrToken));
    }

    @PostMapping("/session/table/{tableId}")
    public ResponseEntity<TablesideSessionDto> createOrGetSession(@PathVariable UUID tableId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tablesideService.createOrGetSession(tableId));
    }

    /** Called by the guest app QR flow — looks up table by human-readable name (e.g. "W-1"). */
    @PostMapping("/session/by-name/{tableName}")
    public ResponseEntity<TablesideSessionDto> createOrGetSessionByName(@PathVariable String tableName) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tablesideService.createOrGetSessionByTableName(tableName));
    }

    @GetMapping("/{sessionId}/cart")
    public ResponseEntity<List<GuestCartItemDto>> getCartItems(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(tablesideService.getCartItems(sessionId));
    }

    @PostMapping("/{sessionId}/cart")
    public ResponseEntity<GuestCartItemDto> addCartItem(
            @PathVariable UUID sessionId,
            @RequestBody AddCartItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tablesideService.addCartItem(sessionId, request));
    }

    @DeleteMapping("/{sessionId}/cart/{itemId}")
    public ResponseEntity<Void> removeCartItem(
            @PathVariable UUID sessionId,
            @PathVariable UUID itemId,
            @RequestHeader("X-Device-Fingerprint") String deviceFingerprint) {
        tablesideService.removeCartItem(sessionId, itemId, deviceFingerprint);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{sessionId}/submit")
    public ResponseEntity<UUID> submitOrder(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(tablesideService.submitOrder(sessionId));
    }

    @GetMapping("/menu/categories")
    public ResponseEntity<List<MenuCategoryDto>> getCategories() {
        return ResponseEntity.ok(tablesideService.getCategories());
    }

    @GetMapping("/menu/items")
    public ResponseEntity<List<MenuItemDto>> getItemsByCategory(@RequestParam UUID categoryId) {
        return ResponseEntity.ok(tablesideService.getMenuItemsByCategory(categoryId));
    }
}
