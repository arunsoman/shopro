package mls.sho.dms.application.mapper;

import mls.sho.dms.application.dto.kds.KDSTicketItemResponse;
import mls.sho.dms.application.dto.kds.KDSTicketResponse;
import mls.sho.dms.entity.kds.KDSTicket;
import mls.sho.dms.entity.kds.KDSTicketItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface KDSMapper {

    @Mapping(target = "tableNumber", source = "entity.orderTicket.table.name")
    @Mapping(target = "serverName", source = "entity.orderTicket.server.fullName")
    @Mapping(target = "items", source = "items")
    @Mapping(target = "id", source = "entity.id")
    @Mapping(target = "status", source = "entity.status")
    @Mapping(target = "firedAt", source = "entity.firedAt")
    KDSTicketResponse toResponse(KDSTicket entity, List<KDSTicketItemResponse> items);

    @Mapping(target = "id", source = "entity.id")
    @Mapping(target = "menuItemId", source = "entity.orderItem.menuItem.id")
    @Mapping(target = "name", source = "entity.orderItem.menuItem.name")
    @Mapping(target = "quantity", source = "entity.orderItem.quantity")
    @Mapping(target = "status", source = "entity.status")
    @Mapping(target = "customNote", source = "entity.orderItem.customNote")
    @Mapping(target = "modifiers", ignore = true) // Will support modifiers later
    KDSTicketItemResponse toItemResponse(KDSTicketItem entity);
}
