package mls.sho.dms.application.costing.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.costing.dto.MenuCostGroupDTO;
import mls.sho.dms.application.costing.repository.MenuCostGroupRepository;
import mls.sho.dms.application.pos.repository.MenuItemRepository;
import mls.sho.dms.application.costing.entity.MenuCostGroup;
import mls.sho.dms.application.pos.entity.MenuItem;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing Menu Cost Groups.
 */
@Service
@RequiredArgsConstructor
public class MenuCostGroupService {

    private final MenuCostGroupRepository repository;
    private final MenuItemRepository menuItemRepository;

    @Transactional(readOnly = true)
    public List<MenuCostGroupDTO> getCostGroups(Long restaurantId) {
        return repository.findAllByRestaurantId(restaurantId).stream()
                .map(group -> {
                    List<MenuItem> items = menuItemRepository.findAllByGroupId(group.getId());
                    MenuCostGroupDTO dto = toDTO(group);
                    dto.setItemCount(items.size());
                    
                    if (!items.isEmpty()) {
                        java.math.BigDecimal totalFc = items.stream()
                            .map(MenuItem::getTargetFoodCostPct)
                            .filter(java.util.Objects::nonNull)
                            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                        
                        if (totalFc.compareTo(java.math.BigDecimal.ZERO) > 0) {
                            dto.setAvgFoodCostPct(totalFc.divide(java.math.BigDecimal.valueOf(items.size()), 2, java.math.RoundingMode.HALF_UP).multiply(java.math.BigDecimal.valueOf(100)));
                        } else {
                            dto.setAvgFoodCostPct(group.getTargetFoodCostPct() != null ? group.getTargetFoodCostPct().multiply(java.math.BigDecimal.valueOf(100)) : java.math.BigDecimal.ZERO);
                        }
                    } else if (group.getTargetFoodCostPct() != null) {
                        dto.setAvgFoodCostPct(group.getTargetFoodCostPct().multiply(java.math.BigDecimal.valueOf(100)));
                    } else {
                        dto.setAvgFoodCostPct(java.math.BigDecimal.ZERO);
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public MenuCostGroupDTO toDTO(MenuCostGroup entity) {
        MenuCostGroupDTO dto = new MenuCostGroupDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDisplayOrder(entity.getDisplayOrder());
        return dto;
    }

    @Transactional
    public MenuCostGroupDTO createCostGroup(Long restaurantId, MenuCostGroupDTO dto) {
        MenuCostGroup entity = new MenuCostGroup();
        entity.setName(dto.getName());
        entity.setRestaurant(new mls.sho.dms.entity.Restaurant());
        entity.getRestaurant().setId(restaurantId);
        entity.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);
        
        // Convert percentage (e.g. 25) to decimal (0.25)
        BigDecimal targetFc = dto.getAvgFoodCostPct() != null 
            ? dto.getAvgFoodCostPct().divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP) 
            : BigDecimal.valueOf(0.25);
        entity.setTargetFoodCostPct(targetFc);
        
        return toDTO(repository.save(entity));
    }

    @Transactional
    public void deleteCostGroup(Long id) {
        repository.deleteById(id);
    }
}
