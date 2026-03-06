package mls.sho.dms.application.service.impl;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.menu.CreateMenuCategoryRequest;
import mls.sho.dms.application.dto.menu.MenuCategoryResponse;
import mls.sho.dms.application.dto.menu.ReorderCategoriesRequest;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.application.exception.ResourceNotFoundException;
import mls.sho.dms.application.mapper.MenuCategoryMapper;
import mls.sho.dms.application.service.MenuCategoryService;
import mls.sho.dms.entity.menu.MenuCategory;
import mls.sho.dms.repository.menu.MenuCategoryRepository;
import mls.sho.dms.repository.menu.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class MenuCategoryServiceImpl implements MenuCategoryService {

    private final MenuCategoryRepository menuCategoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final MenuCategoryMapper mapper;

    @Override
    public MenuCategoryResponse create(CreateMenuCategoryRequest request) {
        if (menuCategoryRepository.existsByNameIgnoreCase(request.name())) {
            throw new BusinessRuleException("A category with this name already exists.");
        }

        int nextOrder = menuCategoryRepository.findTopByOrderByDisplayOrderDesc()
                .map(cat -> cat.getDisplayOrder() + 1)
                .orElse(0);

        MenuCategory category = mapper.toEntity(request);
        category.setDisplayOrder(nextOrder);

        MenuCategory saved = menuCategoryRepository.save(category);
        return mapper.toResponse(saved);
    }

    @Override
    public MenuCategoryResponse update(UUID id, CreateMenuCategoryRequest request) {
        MenuCategory category = getMenuCategory(id);

        if (menuCategoryRepository.existsByNameIgnoreCaseAndIdNot(request.name(), id)) {
            throw new BusinessRuleException("A category with this name already exists.");
        }

        mapper.updateEntityFromRequest(request, category);
        return mapper.toResponse(menuCategoryRepository.save(category));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuCategoryResponse> findAll() {
        return menuCategoryRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MenuCategoryResponse findById(UUID id) {
        return mapper.toResponse(getMenuCategory(id));
    }

    @Override
    public void delete(UUID id) {
        MenuCategory category = getMenuCategory(id);
        
        long publishedItemsCount = menuItemRepository.countByCategoryAndStatus(category, mls.sho.dms.entity.menu.MenuItemStatus.PUBLISHED);
        if (publishedItemsCount > 0) {
            throw new BusinessRuleException("Category has " + publishedItemsCount + " published items. Reassign or archive them first.");
        }
        
        menuCategoryRepository.delete(category);
    }

    @Override
    public void reorder(ReorderCategoriesRequest request) {
        List<UUID> ids = request.categoryIds();
        // Fetch all requested categories
        List<MenuCategory> categories = menuCategoryRepository.findAllById(ids);
        
        if (categories.size() != ids.size()) {
            throw new BusinessRuleException("One or more category IDs are invalid.");
        }
        
        Map<UUID, MenuCategory> categoryMap = categories.stream()
                .collect(Collectors.toMap(MenuCategory::getId, c -> c));
        
        // Update display order based on list index
        for (int i = 0; i < ids.size(); i++) {
            MenuCategory cat = categoryMap.get(ids.get(i));
            cat.setDisplayOrder(i);
            menuCategoryRepository.save(cat);
        }
    }

    private MenuCategory getMenuCategory(UUID id) {
        return menuCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
    }
}
