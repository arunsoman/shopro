package mls.sho.dms.application.dto.floor;

import java.util.UUID;

public record TableShapeResponse(
    UUID id,
    String name,
    int capacity,
    String status,
    UUID sectionId,
    String sectionName,
    int posX,
    int posY,
    int width,
    int height,
    String shapeType,
    UUID assignedStaffId,
    String assignedStaffName
) {}
