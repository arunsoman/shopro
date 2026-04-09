package mls.sho.dms.application.service.menu.impl;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.menu.ModifierGroupDTOs.CreateModifierGroupRequest;
import mls.sho.dms.application.dto.menu.ModifierGroupDTOs.CreateModifierOptionRequest;
import mls.sho.dms.application.dto.menu.ModifierGroupDTOs.ModifierGroupResponse;
import mls.sho.dms.application.dto.menu.ModifierGroupDTOs.ModifierOptionResponse;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.application.exception.ResourceNotFoundException;
import mls.sho.dms.application.service.menu.ModifierGroupService;
import mls.sho.dms.entity.menu.ModifierGroup;
import mls.sho.dms.entity.menu.ModifierOption;
import mls.sho.dms.entity.staff.AuditLog;
import mls.sho.dms.repository.menu.ModifierGroupRepository;
import mls.sho.dms.repository.staff.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class ModifierGroupServiceImpl implements ModifierGroupService {

    private final ModifierGroupRepository modifierGroupRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    public ModifierGroupResponse create(CreateModifierGroupRequest request, String performedBy) {
        if (modifierGroupRepository.existsByNameIgnoreCase(request.name())) {
            throw new BusinessRuleException(
                "A modifier group with the name '" + request.name() + "' already exists."
            );
        }

        if (request.required() && request.minSelections() < 1) {
            throw new BusinessRuleException(
                "A required modifier group must have a minimum selection of at least 1."
            );
        }
        
        if (request.maxSelections() < request.minSelections()) {
            throw new BusinessRuleException(
                "Max selections cannot be less than min selections."
            );
        }

        ModifierGroup group = new ModifierGroup();
        group.setName(request.name());
        group.setRequired(request.required());
        group.setMinSelections(request.minSelections());
        group.setMaxSelections(request.maxSelections());

        for (CreateModifierOptionRequest optionReq : request.options()) {
            ModifierOption option = new ModifierOption();
            option.setLabel(optionReq.label());
            option.setUpchargeAmount(optionReq.upchargeAmount());
            option.setDisplayOrder(optionReq.displayOrder());
            group.addOption(option);
        }

        ModifierGroup saved = modifierGroupRepository.save(group);

        AuditLog log = new AuditLog();
        log.setAction("CREATE_MODIFIER_GROUP");
        log.setEntityType("ModifierGroup");
        log.setEntityId(saved.getId());
        log.setAfterState(Map.of("name", saved.getName(), "performedBy", performedBy));
        log.setOccurredAt(java.time.Instant.now());
        auditLogRepository.save(log);

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ModifierGroupResponse findById(UUID id) {
        return modifierGroupRepository.findById(id)
            .map(this::mapToResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Modifier group not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModifierGroupResponse> findAll() {
        return modifierGroupRepository.findAll().stream()
            .map(this::mapToResponse)
            .toList();
    }

    private ModifierGroupResponse mapToResponse(ModifierGroup group) {
        List<ModifierOptionResponse> options = group.getOptions().stream()
            .map(opt -> new ModifierOptionResponse(
                opt.getId(),
                opt.getLabel(),
                opt.getUpchargeAmount(),
                opt.getDisplayOrder()
            ))
            .toList();

        return new ModifierGroupResponse(
            group.getId(),
            group.getName(),
            group.isRequired(),
            group.getMinSelections(),
            group.getMaxSelections(),
            options
        );
    }
}
