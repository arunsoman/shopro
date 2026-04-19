package mls.sho.dms.application.pos.dto;

import lombok.Data;

@Data
public class DiningTableDto {
    private Long id;
    private String tableNumber;
    private Integer capacity;
    private String status;
    private Integer posX;
    private Integer posY;
}
