package mls.sho.dms.application.mapper;

import mls.sho.dms.application.dto.menu.CreateMenuCategoryRequest;
import mls.sho.dms.application.dto.menu.MenuCategoryResponse;
import mls.sho.dms.entity.menu.MenuCategory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MenuCategoryMapper {

    MenuCategory toEntity(CreateMenuCategoryRequest request);

    MenuCategoryResponse toResponse(MenuCategory entity);
    
    @Mapping(target = "id", ignore = true)
    void updateEntityFromRequest(CreateMenuCategoryRequest request, @MappingTarget MenuCategory entity);
}
