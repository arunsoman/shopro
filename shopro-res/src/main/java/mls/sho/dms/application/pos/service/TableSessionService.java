package mls.sho.dms.application.pos.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.pos.repository.TableSessionRepository;
import mls.sho.dms.entity.DiningTable;
import mls.sho.dms.entity.Restaurant;
import mls.sho.dms.entity.TableSession;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TableSessionService {
    private final TableSessionRepository repository;
    private final DiningTableService tableService;

    @Transactional
    public TableSession openSession(Restaurant restaurant, Long tableId, int guests, LocalDateTime openedAt) {
        TableSession session = new TableSession();
        DiningTable table = new DiningTable(); // Simplified mapping
        table.setId(tableId);
        session.setTable(table);
        session.setRestaurant(restaurant);
        session.setGuestCount(guests);
        session.setOpenedAt(openedAt != null ? openedAt : LocalDateTime.now());
        
        tableService.updateStatus(tableId, DiningTable.TableStatus.OCCUPIED);
        return repository.save(session);
    }

    @Transactional(readOnly = true)
    public java.util.List<TableSession> getActiveSessions(Long restaurantId) {
        return repository.findAllByTableRestaurantIdAndClosedAtIsNull(restaurantId);
    }

    @Transactional
    public void updateGuestCount(Long sessionId, int guests) {
        TableSession session = repository.findById(sessionId).orElseThrow();
        session.setGuestCount(guests);
        repository.save(session);
    }

    @Transactional
    public void closeSession(Long sessionId, LocalDateTime closedAt) {
        TableSession session = repository.findById(sessionId).orElseThrow();
        session.setClosedAt(closedAt != null ? closedAt : LocalDateTime.now());
        tableService.updateStatus(session.getTable().getId(), DiningTable.TableStatus.DIRTY);
        repository.save(session);
    }
}
