package mls.sho.dms.application.mapper;

import mls.sho.dms.application.dto.menu.CreateMenuItemRequest;
import mls.sho.dms.application.dto.menu.MenuItemResponse;
import mls.sho.dms.application.dto.menu.UpdateMenuItemRequest;
import mls.sho.dms.entity.menu.MenuItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MenuItemMapper {

    @Mapping(target = "category", ignore = true) // Category is set by Service
    @Mapping(target = "status", ignore = true)   // Status defaults to DRAFT
    MenuItem toEntity(CreateMenuItemRequest request);

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    MenuItemResponse toResponse(MenuItem entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "status", ignore = true)
    void updateEntityFromRequest(UpdateMenuItemRequest request, @MappingTarget MenuItem entity);
}
