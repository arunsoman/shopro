package mls.sho.dms.application.service;

import mls.sho.dms.application.dto.DuplicateCheckResponse;
import mls.sho.dms.application.dto.menu.CreateMenuItemRequest;
import mls.sho.dms.application.dto.menu.MenuItemResponse;
import mls.sho.dms.application.dto.menu.UpdateMenuItemRequest;
import mls.sho.dms.entity.menu.MenuItemStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface MenuItemService {
    MenuItemResponse create(CreateMenuItemRequest request, String performedBy);
    
    MenuItemResponse update(UUID id, UpdateMenuItemRequest request, String performedBy);
    
    MenuItemResponse findById(UUID id);
    
    List<MenuItemResponse> findByCriteria(UUID categoryId, MenuItemStatus status);
    
    List<MenuItemResponse> findAllPublished();
    
    List<MenuItemResponse> findAllDrafts();
    
    DuplicateCheckResponse checkDuplicate(String name, UUID categoryId);
    
    MenuItemResponse updateStatus(UUID id, MenuItemStatus newStatus, String performedBy);
    
    String uploadPhoto(UUID id, MultipartFile file, String performedBy);
}
