package mls.sho.dms.entity.notification;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import mls.sho.dms.entity.core.BaseEntity;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

/**
 * Defines a delivery channel and its API credentials/configuration.
 * Corresponds to the `channels` table.
 */
@Entity
@Table(name = "channels")
@Getter
@Setter
@NoArgsConstructor
public class Channel extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private ChannelType type;

    @Column(name = "name", nullable = false)
    private String name;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "config", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> config;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
}
