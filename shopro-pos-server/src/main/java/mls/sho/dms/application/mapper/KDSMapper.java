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

    @Mapping(target = "tableNumber", source = "ticket.orderTicket.table.name")
    @Mapping(target = "serverName", source = "ticket.orderTicket.server.fullName")
    @Mapping(target = "items", source = "items")
    @Mapping(target = "id", source = "ticket.id")
    @Mapping(target = "status", source = "ticket.status")
    @Mapping(target = "firedAt", source = "ticket.firedAt")
    @Mapping(target = "cookingAt", source = "ticket.cookingAt")
    public abstract KDSTicketResponse toResponse(KDSTicket ticket, List<KDSTicketItemResponse> items);

    @Mapping(target = "id", source = "entity.id")
    @Mapping(target = "menuItemId", source = "entity.orderItem.menuItem.id")
    @Mapping(target = "name", source = "entity.orderItem.menuItem.name")
    @Mapping(target = "quantity", source = "entity.totalQuantity")
    @Mapping(target = "quantityPending", source = "entity.quantityPending")
    @Mapping(target = "quantityCooking", source = "entity.quantityCooking")
    @Mapping(target = "quantityReady", source = "entity.quantityReady")
    @Mapping(target = "quantityServed", source = "entity.quantityServed")
    @Mapping(target = "status", source = "entity.status")
    @Mapping(target = "customNote", source = "entity.orderItem.customNote")
    @Mapping(target = "modifiers", ignore = true) // Will support modifiers later
    @Mapping(target = "priority", source = "entity.priority")
    @Mapping(target = "preparationTimeMinutes", expression = "java(entity.getOrderItem().getMenuItem().getPreparationTimeMinutes() != null ? entity.getOrderItem().getMenuItem().getPreparationTimeMinutes() : 0)")
    KDSTicketItemResponse toItemResponse(KDSTicketItem entity);
}
