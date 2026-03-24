package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.entity.Food;
import mls.sho.mplace.entity.SupplyList;
import mls.sho.mplace.repository.FoodRepository;
import mls.sho.mplace.repository.SupplyListRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupplyListService {

    private final SupplyListRepository supplyListRepository;
    private final FoodRepository foodRepository;

    public List<SupplyList> getSupplyListBySupplier(UUID supplierId) {
        return supplyListRepository.findBySupplierId(supplierId);
    }

    @Transactional
    public SupplyList addFoodToSupplyList(UUID supplierId, Integer foodId) {
        Optional<SupplyList> existing = supplyListRepository.findBySupplierIdAndFoodId(supplierId, foodId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Food food = foodRepository.findById(foodId)
                .orElseThrow(() -> new RuntimeException("Food item not found: " + foodId));

        SupplyList item = new SupplyList();
        item.setSupplierId(supplierId);
        item.setFoodId(foodId);
        item.setName(food.getName());
        item.setDescription(food.getDescription());
        item.setIsAvailable(true);
        item.setOfferCount(0);
        item.setStockQty(0.0);
        item.setAutoResponseMode(false);

        return supplyListRepository.save(item);
    }

    @Transactional
    public void removeFromSupplyList(UUID supplierId, Integer foodId) {
        supplyListRepository.findBySupplierIdAndFoodId(supplierId, foodId)
                .ifPresent(supplyListRepository::delete);
    }

    @Transactional
    public SupplyList updateSupplyListItem(UUID supplierId, Integer foodId, SupplyList updateRequest) {
        SupplyList item = supplyListRepository.findBySupplierIdAndFoodId(supplierId, foodId)
                .orElseThrow(() -> new RuntimeException("Item not found in supply list"));

        if (updateRequest.getPrice() != null) item.setPrice(updateRequest.getPrice());
        if (updateRequest.getOfferCount() != null) item.setOfferCount(updateRequest.getOfferCount());
        if (updateRequest.getStockQty() != null) item.setStockQty(updateRequest.getStockQty());
        if (updateRequest.getIsAvailable() != null) item.setIsAvailable(updateRequest.getIsAvailable());
        if (updateRequest.getAutoResponseMode() != null) item.setAutoResponseMode(updateRequest.getAutoResponseMode());

        return supplyListRepository.save(item);
    }

    public Optional<SupplyList> findBySupplierAndFood(UUID supplierId, Integer foodId) {
        return supplyListRepository.findBySupplierIdAndFoodId(supplierId, foodId);
    }
}
