package mls.sho.dms.application.service.floor;

import mls.sho.dms.application.dto.floor.*;

import java.util.List;
import java.util.UUID;

public interface FloorPlanService {
    
    // --- Layout Management (Manager) ---
    SectionResponse createSection(CreateSectionRequest request, String performedBy);
    List<SectionResponse> getAllSections();
    
    TableShapeResponse createTable(CreateTableShapeRequest request, String performedBy);
    TableShapeResponse updateTable(UUID id, CreateTableShapeRequest request, String performedBy);
    void deleteTable(UUID id, String performedBy);
    List<TableShapeResponse> getAllTables();
    
    // --- Operational Management (Host/Server) ---
    TableShapeResponse seatParty(UUID tableId, UUID waitlistEntryId, String performedBy);
    TableShapeResponse markTableClean(UUID tableId, String performedBy);
    TableShapeResponse updateTableStatus(UUID tableId, String newStatus, String performedBy);
    
    // --- Advanced Operations ---
    int calculateEstimatedWaitTime(int partySize);
    void updateReservationHolds();
    WaitlistEntryResponse suggestBestMatch(UUID tableId);
    TableShapeResponse updateTablePosition(UUID id, int posX, int posY, String performedBy);
}
