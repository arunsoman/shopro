package mls.sho.mplace.service;

import mls.sho.mplace.dto.MasterCategoryDTO;
import mls.sho.mplace.entity.Category;
import mls.sho.mplace.entity.MasterCategory;
import mls.sho.mplace.repository.MasterCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class MasterCategoryService {

    private final MasterCategoryRepository masterCategoryRepository;
    private final mls.sho.mplace.repository.CategoryRepository categoryRepository;

    public MasterCategoryService(MasterCategoryRepository masterCategoryRepository, 
                                 mls.sho.mplace.repository.CategoryRepository categoryRepository) {
        this.masterCategoryRepository = masterCategoryRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<MasterCategoryDTO> getTopLevelCategories() {
        return masterCategoryRepository.findByParentIsNull().stream()
                .map(this::mapToDTO)
                .toList();
    }

    public List<MasterCategoryDTO> getSubCategories(UUID parentId) {
        return masterCategoryRepository.findByParent_Id(parentId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional
    public void syncToRestaurant(UUID restaurantId, List<UUID> masterCategoryIds) {
        for (UUID masterId : masterCategoryIds) {
            MasterCategory mc = masterCategoryRepository.findById(masterId).orElse(null);
            if (mc != null) {
                copyCategory(mc, null, restaurantId);
            }
        }
    }

    private void copyCategory(MasterCategory mc, Category parent, UUID restaurantId) {
        Category cat = new Category();
        cat.setName(mc.getName());
        cat.setIcon(mc.getIcon());
        cat.setRestaurantId(restaurantId);
        cat.setParent(parent);
        categoryRepository.save(cat);

        // Recursively copy subcategories if they are explicitly selected OR we want to copy the whole tree?
        // For now, let's just copy the ones provided. 
        // If the user selects a top level, they might expect subcategories too.
        // Let's check mc.getSubCategories()
        if (mc.getSubCategories() != null) {
            for (MasterCategory subMc : mc.getSubCategories()) {
                copyCategory(subMc, cat, restaurantId);
            }
        }
    }

    private MasterCategoryDTO mapToDTO(MasterCategory mc) {
        MasterCategoryDTO dto = new MasterCategoryDTO();
        dto.setId(mc.getId());
        dto.setName(mc.getName());
        dto.setDescription(mc.getDescription());
        dto.setIcon(mc.getIcon());
        dto.setStorageCondition(mc.getStorageCondition());
        dto.setPerishable(mc.isPerishable());
        dto.setAttributes(mc.getAttributes());
        if (mc.getSubCategories() != null) {
            dto.setSubCategories(mc.getSubCategories().stream().map(this::mapToDTO).toList());
        }
        return dto;
    }

    public List<MasterCategory> getAll() {
        return masterCategoryRepository.findAll();
    }
}
