package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.dto.CategoryDto;
import mls.sho.mplace.entity.Category;
import mls.sho.mplace.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryDto> getRootCategories() {
        return categoryRepository.findByParentIsNull().stream()
                .map(this::mapToDto)
                .toList();
    }

    public List<CategoryDto> getSubCategories(UUID parentId) {
        return categoryRepository.findByParent_Id(parentId).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional
    public CategoryDto createCategory(CategoryDto dto) {
        Category category = new Category();
        category.setName(dto.name());
        category.setIcon(dto.icon());
        if (dto.parentId() != null) {
            categoryRepository.findById(dto.parentId()).ifPresent(category::setParent);
        }
        Category saved = categoryRepository.save(category);
        return mapToDto(saved);
    }

    private CategoryDto mapToDto(Category category) {
        return new CategoryDto(
                category.getId(),
                category.getName(),
                category.getIcon(),
                category.getParent() != null ? category.getParent().getId() : null,
                category.getSubCategories().size()
        );
    }
}
