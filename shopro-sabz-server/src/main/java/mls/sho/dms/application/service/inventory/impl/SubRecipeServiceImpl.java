package mls.sho.dms.application.service.inventory.impl;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.inventory.SubRecipeResponse;
import mls.sho.dms.application.exception.ResourceNotFoundException;
import mls.sho.dms.application.service.inventory.SubRecipeService;
import mls.sho.dms.entity.inventory.SubRecipe;
import mls.sho.dms.repository.inventory.SubRecipeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubRecipeServiceImpl implements SubRecipeService {

    private final SubRecipeRepository subRecipeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SubRecipeResponse> findAll() {
        return subRecipeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SubRecipeResponse findById(UUID id) {
        return subRecipeRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Sub-recipe not found"));
    }

    private SubRecipeResponse mapToResponse(SubRecipe subRecipe) {
        return new SubRecipeResponse(
                subRecipe.getId(),
                subRecipe.getName(),
                subRecipe.getYieldQuantity(),
                subRecipe.getUnitOfMeasure(),
                subRecipe.getCostPerUnit()
        );
    }
}
