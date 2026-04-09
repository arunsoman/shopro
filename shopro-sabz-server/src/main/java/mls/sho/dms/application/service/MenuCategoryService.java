package mls.sho.dms.application.service;

import mls.sho.dms.application.dto.menu.CreateMenuCategoryRequest;
import mls.sho.dms.application.dto.menu.MenuCategoryResponse;
import mls.sho.dms.application.dto.menu.ReorderCategoriesRequest;

import java.util.List;
import java.util.UUID;

public interface MenuCategoryService {
    MenuCategoryResponse create(CreateMenuCategoryRequest request);
    
    MenuCategoryResponse update(UUID id, CreateMenuCategoryRequest request);
    
    List<MenuCategoryResponse> findAll();
    
    MenuCategoryResponse findById(UUID id);
    
    void delete(UUID id);
    
    void reorder(ReorderCategoriesRequest request);
}
