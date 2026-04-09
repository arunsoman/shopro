package mls.sho.dms.application.purchasing.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO for Supplier entity.
 */
@Data
public class SupplierDTO {
    private Long id;
    private String name;
    private String contactName;
    private String phone;
    private String email;
    private String accountNumber;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
