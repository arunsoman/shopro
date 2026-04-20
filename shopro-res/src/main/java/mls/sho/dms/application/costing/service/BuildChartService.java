package mls.sho.dms.application.costing.service;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.costing.repository.RecipeBuildChartRepository;
import mls.sho.dms.application.costing.entity.RecipeBuildChart;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BuildChartService {
    private final RecipeBuildChartRepository repository;

    @Transactional
    public RecipeBuildChart save(RecipeBuildChart chart) {
        return repository.save(chart);
    }

    @Transactional(readOnly = true)
    public RecipeBuildChart get(Long id) {
        return repository.findById(id).orElseThrow();
    }
}
