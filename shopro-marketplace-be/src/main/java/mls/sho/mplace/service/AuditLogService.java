package mls.sho.mplace.service;

import lombok.RequiredArgsConstructor;
import mls.sho.mplace.dto.AuditLogDto;
import mls.sho.mplace.entity.AuditLog;
import mls.sho.mplace.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public List<AuditLogDto> getRecentLogs() {
        return auditLogRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .toList();
    }

    private AuditLogDto mapToDto(AuditLog log) {
        return new AuditLogDto(
                log.getId(),
                log.getAction(),
                log.getPerformedBy(),
                log.getTarget(),
                log.getSeverity().name().toLowerCase(),
                log.getCreatedAt().toString()
        );
    }
}
