package mls.sho.dms.web.controller.inventory;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.InventoryBatchResponse;
import mls.sho.dms.entity.inventory.InventoryBatch;
import mls.sho.dms.entity.inventory.BatchStatus;
import mls.sho.dms.repository.inventory.InventoryBatchRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/inventory/batches")
@RequiredArgsConstructor
public class BatchController {

    private final InventoryBatchRepository batchRepository;

    @GetMapping("/ingredient/{ingredientId}")
    public List<InventoryBatchResponse> getActiveByIngredient(@PathVariable UUID ingredientId) {
        return batchRepository.findAllByIngredientIdAndStatusOrderByExpiryDateAsc(ingredientId, BatchStatus.ACTIVE)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @GetMapping("/active")
    public List<InventoryBatchResponse> getAllActive() {
        return batchRepository.findAllByStatusOrderByExpiryDateAsc(BatchStatus.ACTIVE)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public InventoryBatchResponse getById(@PathVariable UUID id) {
        return batchRepository.findById(id)
            .map(this::mapToResponse)
            .orElseThrow(() -> new IllegalArgumentException("Batch not found: " + id));
    }

    private InventoryBatchResponse mapToResponse(InventoryBatch batch) {
        return InventoryBatchResponse.builder()
            .id(batch.getId())
            .ingredientId(batch.getIngredient().getId())
            .ingredientName(batch.getIngredient().getName())
            .locationId(batch.getLocation() != null ? batch.getLocation().getId() : null)
            .locationName(batch.getLocation() != null ? batch.getLocation().getName() : null)
            .batchNumber(batch.getBatchNumber())
            .receivedQuantity(batch.getReceivedQuantity())
            .currentQuantity(batch.getCurrentQuantity())
            .costAtReceipt(batch.getCostAtReceipt())
            .receivedDate(batch.getReceivedDate())
            .expiryDate(batch.getExpiryDate())
            .status(batch.getStatus())
            .build();
    }
}
