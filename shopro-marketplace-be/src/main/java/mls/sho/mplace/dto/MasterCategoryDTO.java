package mls.sho.mplace.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class MasterCategoryDTO {
    private UUID id;
    private String name;
    private String description;
    private String icon;
    private String storageCondition;
    private boolean perishable;
    private String attributes;
    private List<MasterCategoryDTO> subCategories;
}
