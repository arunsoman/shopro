package mls.sho.dms.service.tableside;

import mls.sho.dms.dto.menu.MenuCategoryDto;
import mls.sho.dms.dto.menu.MenuItemDto;

import mls.sho.dms.dto.tableside.AddCartItemRequest;
import mls.sho.dms.dto.tableside.GuestCartItemDto;
import mls.sho.dms.dto.tableside.TablesideSessionDto;

import java.util.List;
import java.util.UUID;

public interface TablesideService {
    TablesideSessionDto getSessionByQrToken(UUID qrToken);
    TablesideSessionDto createOrGetSession(UUID tableId);
    TablesideSessionDto createOrGetSessionByTableName(String tableName);
    
    List<GuestCartItemDto> getCartItems(UUID sessionId);
    GuestCartItemDto addCartItem(UUID sessionId, AddCartItemRequest request);
    void removeCartItem(UUID sessionId, UUID itemId, String deviceFingerprint);
    
    /** Converts all guest cart items for this session into an active order ticket. */
    UUID submitOrder(UUID sessionId);

    List<MenuCategoryDto> getCategories();
    List<MenuItemDto> getMenuItemsByCategory(UUID categoryId);
}
