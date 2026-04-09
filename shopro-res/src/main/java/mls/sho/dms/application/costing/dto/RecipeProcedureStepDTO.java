package mls.sho.dms.application.costing.dto;

import lombok.Data;

/**
 * DTO for RecipeProcedureStep entity.
 */
@Data
public class RecipeProcedureStepDTO {
    private Long id;
    private Integer stepNumber;
    private String instruction;
    private boolean criticalControlPoint;
}
