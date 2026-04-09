package mls.sho.dms.entity.users;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "auth_audit")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthAudit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "audit_id")
    private UUID auditId;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(nullable = false, length = 50)
    private String action;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(nullable = false)
    private Boolean success;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> details;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}