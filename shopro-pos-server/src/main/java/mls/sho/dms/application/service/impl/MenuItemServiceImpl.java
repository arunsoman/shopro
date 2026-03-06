package mls.sho.dms.application.service.impl;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.DuplicateCheckResponse;
import mls.sho.dms.application.dto.menu.CreateMenuItemRequest;
import mls.sho.dms.application.dto.menu.MenuItemResponse;
import mls.sho.dms.application.dto.menu.UpdateMenuItemRequest;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.application.exception.ResourceNotFoundException;
import mls.sho.dms.application.mapper.MenuItemMapper;
import mls.sho.dms.application.service.MenuItemService;
import mls.sho.dms.application.service.PhotoStorageService;
import mls.sho.dms.entity.menu.MenuCategory;
import mls.sho.dms.entity.menu.MenuItem;
import mls.sho.dms.entity.menu.MenuItemStatus;
import mls.sho.dms.entity.menu.MenuItemModifierGroup;
import mls.sho.dms.entity.menu.ModifierGroup;
import mls.sho.dms.repository.menu.MenuCategoryRepository;
import mls.sho.dms.repository.menu.MenuItemRepository;
import mls.sho.dms.repository.menu.ModifierGroupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class MenuItemServiceImpl implements MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final ModifierGroupRepository modifierGroupRepository;
    private final MenuItemMapper mapper;
    private final PhotoStorageService photoStorageService;

    @Override
    public MenuItemResponse create(CreateMenuItemRequest request, String performedBy) {
        MenuCategory category = getCategory(request.categoryId());

        if (menuItemRepository.existsByNameIgnoreCaseAndCategory(request.name(), category)) {
            throw new BusinessRuleException(
                "An item with the name '" + request.name() + "' already exists in " + category.getName() + ".");
        }

        MenuItem item = mapper.toEntity(request);
        item.setCategory(category);
        item.setStatus(MenuItemStatus.DRAFT);
        item.setPhotoUrl(request.photoUrl());

        if (request.modifierGroupIds() != null && !request.modifierGroupIds().isEmpty()) {
            int displayOrder = 0;
            for (UUID groupId : request.modifierGroupIds()) {
                ModifierGroup group = modifierGroupRepository.findById(groupId)
                    .orElseThrow(() -> new BusinessRuleException("Modifier Group not found with ID: " + groupId));

                MenuItemModifierGroup link = new MenuItemModifierGroup();
                link.setModifierGroup(group);
                link.setDisplayOrder(displayOrder++);
                item.addModifierGroup(link);
            }
        }

        MenuItem saved = menuItemRepository.save(item);
        return buildResponse(saved);
    }

    @Override
    public MenuItemResponse update(UUID id, UpdateMenuItemRequest request, String performedBy) {
        MenuItem item = getMenuItem(id);
        MenuCategory category = getCategory(request.categoryId());

        if (menuItemRepository.existsByNameIgnoreCaseAndCategoryAndIdNot(request.name(), category, id)) {
            throw new BusinessRuleException(
                "An item with the name '" + request.name() + "' already exists in " + category.getName() + ".");
        }

        mapper.updateEntityFromRequest(request, item);
        item.setCategory(category);
        if (request.photoUrl() != null) {
            item.setPhotoUrl(request.photoUrl());
        }

        return buildResponse(menuItemRepository.save(item));
    }

    @Override
    @Transactional(readOnly = true)
    public MenuItemResponse findById(UUID id) {
        return buildResponse(getMenuItem(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuItemResponse> findByCriteria(UUID categoryId, MenuItemStatus status) {
        MenuCategory category = getCategory(categoryId);
        return menuItemRepository.findByCategoryAndStatus(category, status)
                .stream()
                .map(this::buildResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuItemResponse> findAllPublished() {
        return menuItemRepository.findAllByStatusIn(List.of(MenuItemStatus.PUBLISHED, MenuItemStatus.EIGHTY_SIXED))
                .stream()
                .map(this::buildResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuItemResponse> findAllDrafts() {
        return menuItemRepository.findAll()
                .stream()
                .filter(i -> i.getStatus() == MenuItemStatus.DRAFT)
                .map(this::buildResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DuplicateCheckResponse checkDuplicate(String name, UUID categoryId) {
        MenuCategory category = getCategory(categoryId);
        boolean exists = menuItemRepository.existsByNameIgnoreCaseAndCategory(name, category);
        return new DuplicateCheckResponse(exists, exists ? category.getName() : null);
    }

    @Override
    public MenuItemResponse updateStatus(UUID id, MenuItemStatus newStatus, String performedBy) {
        MenuItem item = getMenuItem(id);

        if (newStatus == MenuItemStatus.PUBLISHED && item.getBasePrice() == null) {
            throw new BusinessRuleException("Cannot publish an item without a base price.");
        }

        item.setStatus(newStatus);
        return buildResponse(menuItemRepository.save(item));
    }

    @Override
    public String uploadPhoto(UUID id, MultipartFile file, String performedBy) {
        MenuItem item = getMenuItem(id);

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png"))) {
            throw new BusinessRuleException("Only JPEG and PNG files are accepted.");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BusinessRuleException("Photo exceeds 5 MB limit. Please compress and retry.");
        }

        if (item.getPhotoUrl() != null) {
            photoStorageService.deletePhoto(item.getPhotoUrl());
        }

        String newUrl = photoStorageService.uploadPhoto(id, file);
        item.setPhotoUrl(newUrl);
        menuItemRepository.save(item);

        return newUrl;
    }

    /**
     * Builds a full MenuItemResponse including modifier groups and their options,
     * so the POS UI can display the modifier selection dialog.
     */
    private MenuItemResponse buildResponse(MenuItem item) {
        String createdStr = item.getCreatedAt() != null ? item.getCreatedAt().toString() : null;
        String updatedStr = item.getUpdatedAt() != null ? item.getUpdatedAt().toString() : null;

        List<MenuItemResponse.ModifierGroupResponse> modifierGroupResponses = item.getModifierGroups() == null
            ? List.of()
            : item.getModifierGroups().stream()
                .map(link -> {
                    ModifierGroup group = link.getModifierGroup();
                    List<MenuItemResponse.ModifierOptionResponse> optionResponses = group.getOptions() == null
                        ? List.of()
                        : group.getOptions().stream()
                            .map(opt -> new MenuItemResponse.ModifierOptionResponse(
                                opt.getId(),
                                opt.getLabel(),
                                opt.getUpchargeAmount()
                            ))
                            .toList();
                    return new MenuItemResponse.ModifierGroupResponse(
                        group.getId(),
                        group.getName(),
                        group.isRequired(),
                        group.getMinSelections(),
                        group.getMaxSelections(),
                        optionResponses
                    );
                })
                .toList();

        return new MenuItemResponse(
            item.getId(),
            item.getName(),
            item.getDescription(),
            item.getBasePrice(),
            item.getCategory().getId(),
            item.getCategory().getName(),
            item.getStatus().name(),
            item.getPhotoUrl(),
            createdStr,
            updatedStr,
            modifierGroupResponses
        );
    }

    private MenuItem getMenuItem(UUID id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu Item not found with ID: " + id));
    }

    private MenuCategory getCategory(UUID id) {
        return menuCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu Category not found with ID: " + id));
    }
}
