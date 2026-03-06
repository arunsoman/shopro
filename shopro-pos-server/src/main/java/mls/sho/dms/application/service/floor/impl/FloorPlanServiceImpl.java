package mls.sho.dms.application.service.floor.impl;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.floor.*;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.application.exception.ResourceNotFoundException;
import mls.sho.dms.application.service.floor.FloorPlanService;
import mls.sho.dms.entity.floor.*;
import mls.sho.dms.repository.floor.ReservationRepository;
import mls.sho.dms.repository.floor.SectionRepository;
import mls.sho.dms.repository.floor.TableShapeRepository;
import mls.sho.dms.repository.floor.WaitlistEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class FloorPlanServiceImpl implements FloorPlanService {

    private final SectionRepository sectionRepository;
    private final TableShapeRepository tableShapeRepository;
    private final WaitlistEntryRepository waitlistEntryRepository;
    private final ReservationRepository reservationRepository;

    private static final int RESERVATION_HOLD_WINDOW_MINS = 15;

    @Override
    public SectionResponse createSection(CreateSectionRequest request, String performedBy) {
        if (sectionRepository.existsByNameIgnoreCase(request.name())) {
            throw new BusinessRuleException("A section with the name '" + request.name() + "' already exists.");
        }

        Section section = new Section();
        section.setName(request.name());
        Section saved = sectionRepository.save(section);

        return mapToSectionResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SectionResponse> getAllSections() {
        return sectionRepository.findAll().stream()
                .map(this::mapToSectionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TableShapeResponse createTable(CreateTableShapeRequest request, String performedBy) {
        Section section = sectionRepository.findById(request.sectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section not found"));

        if (tableShapeRepository.existsBySectionAndNameIgnoreCase(section, request.name())) {
            throw new BusinessRuleException("Table name '" + request.name() + "' must be unique within section '" + section.getName() + "'.");
        }

        TableShape shape = new TableShape();
        shape.setSection(section);
        shape.setName(request.name());
        shape.setCapacity(request.capacity());
        shape.setPosX(request.posX());
        shape.setPosY(request.posY());
        shape.setWidth(request.width());
        shape.setHeight(request.height());
        shape.setShapeType(request.shapeType());
        shape.setStatus(TableStatus.AVAILABLE);

        TableShape saved = tableShapeRepository.save(shape);
        return mapToTableShapeResponse(saved);
    }

    @Override
    public TableShapeResponse updateTable(UUID id, CreateTableShapeRequest request, String performedBy) {
        TableShape shape = tableShapeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table shape not found."));

        // If changing section, verify the new section exists
        if (!shape.getSection().getId().equals(request.sectionId())) {
             Section newSection = sectionRepository.findById(request.sectionId())
                .orElseThrow(() -> new ResourceNotFoundException("New section not found"));
             
             if (tableShapeRepository.existsBySectionAndNameIgnoreCase(newSection, request.name())) {
                 throw new BusinessRuleException("Table name '" + request.name() + "' must be unique within section '" + newSection.getName() + "'.");
             }
             shape.setSection(newSection);
        } else if (!shape.getName().equalsIgnoreCase(request.name())) {
             if (tableShapeRepository.existsBySectionAndNameIgnoreCase(shape.getSection(), request.name())) {
                 throw new BusinessRuleException("Table name '" + request.name() + "' must be unique within section '" + shape.getSection().getName() + "'.");
             }
        }

        shape.setName(request.name());
        shape.setCapacity(request.capacity());
        shape.setPosX(request.posX());
        shape.setPosY(request.posY());
        shape.setWidth(request.width());
        shape.setHeight(request.height());
        shape.setShapeType(request.shapeType());

        return mapToTableShapeResponse(tableShapeRepository.save(shape));
    }

    @Override
    public void deleteTable(UUID id, String performedBy) {
        TableShape shape = tableShapeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table shape not found."));

        if (shape.getStatus() != TableStatus.AVAILABLE) {
            throw new BusinessRuleException("Cannot delete table '" + shape.getName() + "' because its status is " + shape.getStatus());
        }

        tableShapeRepository.delete(shape);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TableShapeResponse> getAllTables() {
        return tableShapeRepository.findAllWithSection().stream()
                .map(this::mapToTableShapeResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TableShapeResponse seatParty(UUID tableId, UUID waitlistEntryId, String performedBy) {
        TableShape table = tableShapeRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found."));

        if (table.getStatus() != TableStatus.AVAILABLE && table.getStatus() != TableStatus.HELD) {
             throw new BusinessRuleException("Table " + table.getName() + " is not available for seating.");
        }

        WaitlistEntry entry = waitlistEntryRepository.findById(waitlistEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("Waitlist entry not found."));

        if (entry.getStatus() != WaitlistStatus.WAITING && entry.getStatus() != WaitlistStatus.NOTIFIED) {
             throw new BusinessRuleException("Waitlist entry is already processed.");
        }

        // We do a soft warning in the UI, but on backend we enforce seat party logic
        // Seating a party sets the table status to OCCUPIED
        table.setStatus(TableStatus.OCCUPIED);
        
        entry.setStatus(WaitlistStatus.SEATED);
        entry.setSeatedAtTable(table);
        // Note: we can map the `performedBy` to a StaffMember here if we had full staff repository context.
        
        tableShapeRepository.save(table);
        waitlistEntryRepository.save(entry);

        return mapToTableShapeResponse(table);
    }

    @Override
    public TableShapeResponse markTableClean(UUID tableId, String performedBy) {
        TableShape table = tableShapeRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found."));

        if (table.getStatus() != TableStatus.DIRTY) {
            throw new BusinessRuleException("Only DIRTY tables can be marked clean. Current: " + table.getStatus());
        }

        table.setStatus(TableStatus.AVAILABLE);
        return mapToTableShapeResponse(tableShapeRepository.save(table));
    }

    @Override
    public TableShapeResponse updateTableStatus(UUID tableId, String newStatus, String performedBy) {
        TableShape table = tableShapeRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found."));
        TableStatus status;
        try {
            status = TableStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("Invalid table status: " + newStatus);
        }
        table.setStatus(status);
        return mapToTableShapeResponse(tableShapeRepository.save(table));
    }

    @Override
    public int calculateEstimatedWaitTime(int partySize) {
        long waitingParties = waitlistEntryRepository.countByStatusAndPartySize(
            WaitlistStatus.WAITING, partySize);
        return (int) (15 + (waitingParties * 10));
    }

    @Override
    public void updateReservationHolds() {
        Instant now = Instant.now();
        Instant windowEnd = now.plus(RESERVATION_HOLD_WINDOW_MINS, ChronoUnit.MINUTES);

        List<Reservation> upcoming = reservationRepository.findUpcomingByStatus(
            now, ReservationStatus.CONFIRMED);

        for (Reservation res : upcoming) {
            if (res.getReservationTime().isBefore(windowEnd) && 
                res.getTable().getStatus() == TableStatus.AVAILABLE) {
                
                res.getTable().setStatus(TableStatus.HELD);
                tableShapeRepository.save(res.getTable());
            }
        }
    }

    @Override
    public WaitlistEntryResponse suggestBestMatch(UUID tableId) {
        TableShape table = tableShapeRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found."));
        
        List<WaitlistEntry> waiting = waitlistEntryRepository.findByStatusOrderByCreatedAtAsc(
            WaitlistStatus.WAITING);

        return waiting.stream()
            .filter(e -> e.getPartySize() <= table.getCapacity())
            .min(Comparator.comparingInt(WaitlistEntry::getPartySize)
                .reversed()
                .thenComparing(WaitlistEntry::getCreatedAt))
            .map(this::mapToWaitlistEntryResponse)
            .orElse(null);
    }

    @Override
    public TableShapeResponse updateTablePosition(UUID id, int posX, int posY, String performedBy) {
        TableShape shape = tableShapeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table shape not found."));
        shape.setPosX(posX);
        shape.setPosY(posY);
        return mapToTableShapeResponse(tableShapeRepository.save(shape));
    }


    // --- Mappers ---
    private SectionResponse mapToSectionResponse(Section section) {
        long count = tableShapeRepository.countBySection(section);
        return new SectionResponse(section.getId(), section.getName(), (int) count);
    }

    private TableShapeResponse mapToTableShapeResponse(TableShape shape) {
        return new TableShapeResponse(
             shape.getId(),
             shape.getName(),
             shape.getCapacity(),
             shape.getStatus().name(),
             shape.getSection().getId(),
             shape.getSection().getName(),
             shape.getPosX(),
             shape.getPosY(),
             shape.getWidth(),
             shape.getHeight(),
             shape.getShapeType(),
             shape.getAssignedStaff() != null ? shape.getAssignedStaff().getId() : null,
             shape.getAssignedStaff() != null ? shape.getAssignedStaff().getFullName() : null
        );
    }

    private WaitlistEntryResponse mapToWaitlistEntryResponse(WaitlistEntry entry) {
        UUID tableId = null;
        String tableName = null;
        if (entry.getSeatedAtTable() != null) {
            tableId = entry.getSeatedAtTable().getId();
            tableName = entry.getSeatedAtTable().getName();
        }

        String handledBy = null;
        if (entry.getHandledBy() != null) {
             handledBy = entry.getHandledBy().getFullName();
        }

        return new WaitlistEntryResponse(
            entry.getId(),
            entry.getCustomerName(),
            entry.getPartySize(),
            entry.getPhoneNumber(),
            entry.getEstimatedWaitMinutes(),
            entry.getStatus().name(),
            entry.getNotifiedAt(),
            tableId,
            tableName,
            handledBy,
            entry.getCreatedAt()
        );
    }
}
