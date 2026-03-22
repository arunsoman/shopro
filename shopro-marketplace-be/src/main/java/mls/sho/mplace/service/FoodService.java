package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.Food;
import mls.sho.mplace.repository.FoodRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FoodService {

    private final FoodRepository foodRepository;

    public Page<Food> getAll(Pageable pageable) {
        return foodRepository.findAll(pageable);
    }

    public Page<Food> search(String query, Pageable pageable) {
        return foodRepository.findByNameContainingIgnoreCaseOrFoodGroupContainingIgnoreCase(
                query, query, pageable);
    }

    public Optional<Food> findById(Integer id) {
        return foodRepository.findById(id);
    }
}
