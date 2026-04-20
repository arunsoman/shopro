package mls.sho.dms.application.pos.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.pos.repository.DiningTableRepository;
import mls.sho.dms.application.pos.entity.DiningTable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiningTableService {

    private final DiningTableRepository repository;

    @Transactional(readOnly = true)
    public List<DiningTable> getAllTables(Long restaurantId) {
        return repository.findAllByRestaurantId(restaurantId);
    }

    @Transactional(readOnly = true)
    public List<DiningTable> getAvailableTables(Long restaurantId, int guests) {
        return repository.findAllByRestaurantIdAndStatusAndCapacityGreaterThanEqual(restaurantId, DiningTable.TableStatus.AVAILABLE, guests);
    }

    @Transactional
    public void updateStatus(Long tableId, DiningTable.TableStatus status) {
        DiningTable table = repository.findById(tableId).orElseThrow();
        table.setStatus(status);
        repository.save(table);
    }
}
