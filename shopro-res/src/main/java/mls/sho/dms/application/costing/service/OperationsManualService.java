package mls.sho.dms.application.costing.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.costing.repository.OperationsManualRepository;
import mls.sho.dms.application.costing.entity.OperationsManualEntry;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OperationsManualService {
    private final OperationsManualRepository repository;

    @Transactional(readOnly = true)
    public List<OperationsManualEntry> getAll(Long restaurantId) {
        return repository.findAllByRestaurantId(restaurantId);
    }

    @Transactional
    public OperationsManualEntry save(OperationsManualEntry entry) {
        return repository.save(entry);
    }
}
