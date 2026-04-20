package mls.sho.dms.application.pos.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.pos.repository.DiningTableRepository;
import mls.sho.dms.application.pos.repository.TableSessionRepository;
import mls.sho.dms.application.pos.entity.DiningTable;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.application.pos.entity.TableSession;
import mls.sho.dms.application.pos.entity.TableStaffMap;
import mls.sho.dms.application.pos.service.TableStaffMapService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

import mls.sho.dms.application.common.TenantGuard;

@Service
@RequiredArgsConstructor
public class TableSessionService {
    private final TableSessionRepository repository;
    private final DiningTableService tableService;
    private final DiningTableRepository tableRepository;
    private final TenantGuard tenantGuard;
    private final TableStaffMapService tableStaffMapService;

    @Transactional
    public TableSession openSession(Restaurant restaurant, Long tableId, int guests, LocalDateTime openedAt) {
        TableSession session = new TableSession();
        DiningTable table = new DiningTable();
        table.setId(tableId);
        session.setTable(table);
        session.setRestaurant(restaurant);
        session.setGuestCount(guests);
        session.setOpenedAt(openedAt != null ? openedAt : LocalDateTime.now());
        
        // Auto-populate server info from table_staff_map if available
        tableStaffMapService.getPrimaryServerForTable(tableId).ifPresent(assignment -> {
            session.setServerName(assignment.getStaff().getDisplayName());
            session.setServerRole(assignment.getStaff().getRole().name());
        });
        
        tableService.updateStatus(tableId, DiningTable.TableStatus.OCCUPIED);
        return repository.save(session);
    }

    @Transactional
    public TableSession openSession(Long restaurantId, Long tableId, int guests) {
        Restaurant restaurant = new Restaurant();
        restaurant.setId(restaurantId);
        return openSession(restaurant, tableId, guests, null);
    }

    @Transactional(readOnly = true)
    public java.util.List<TableSession> getActiveSessions(Long restaurantId) {
        return repository.findAllByTableRestaurantIdAndClosedAtIsNull(restaurantId);
    }

    @Transactional
    public void updateGuestCount(Long restaurantId, Long sessionId, int guests) {
        TableSession session = tenantGuard.session(restaurantId, sessionId);
        session.setGuestCount(guests);
        repository.save(session);
    }

    @Transactional
    public void closeSession(Long restaurantId, Long sessionId) {
        TableSession session = tenantGuard.session(restaurantId, sessionId);
        session.setClosedAt(LocalDateTime.now());
        if (session.getTable() != null) {
            tableService.updateStatus(session.getTable().getId(), DiningTable.TableStatus.DIRTY);
        }
        repository.save(session);
    }

    @Transactional
    public void closeSession(Long restaurantId, Long sessionId, LocalDateTime closedAt) {
        TableSession session = tenantGuard.session(restaurantId, sessionId);
        session.setClosedAt(closedAt != null ? closedAt : LocalDateTime.now());
        if (session.getTable() != null) {
            tableService.updateStatus(session.getTable().getId(), DiningTable.TableStatus.DIRTY);
        }
        repository.save(session);
    }
}
