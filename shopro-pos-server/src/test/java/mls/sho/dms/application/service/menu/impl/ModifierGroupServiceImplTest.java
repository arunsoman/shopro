package mls.sho.dms.application.service.menu.impl;

import mls.sho.dms.application.dto.menu.ModifierGroupDTOs.CreateModifierGroupRequest;
import mls.sho.dms.application.dto.menu.ModifierGroupDTOs.CreateModifierOptionRequest;
import mls.sho.dms.application.exception.BusinessRuleException;
import mls.sho.dms.entity.menu.ModifierGroup;
import mls.sho.dms.repository.menu.ModifierGroupRepository;
import mls.sho.dms.repository.staff.AuditLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ModifierGroupServiceImplTest {

    @Mock
    private ModifierGroupRepository modifierGroupRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private ModifierGroupServiceImpl service;

    @Test
    void create_ShouldThrowWhenNameExists() {
        // Arrange
        var req = new CreateModifierGroupRequest("Temperature", false, 0, 1, List.of());
        when(modifierGroupRepository.existsByNameIgnoreCase("Temperature")).thenReturn(true);

        // Act & Assert
        assertThrows(BusinessRuleException.class, () -> service.create(req, "tester"));
        verify(modifierGroupRepository, never()).save(any());
    }

    @Test
    void create_ShouldSaveAndLogWhenValid() {
        // Arrange
        var optionReq = new CreateModifierOptionRequest("Rare", BigDecimal.ZERO, 0);
        var req = new CreateModifierGroupRequest("Temperature", true, 1, 1, List.of(optionReq));
        
        when(modifierGroupRepository.existsByNameIgnoreCase("Temperature")).thenReturn(false);
        
        ModifierGroup savedGroup = new ModifierGroup();
        savedGroup.setName("Temperature");
        ReflectionTestUtils.setField(savedGroup, "id", UUID.randomUUID());
        when(modifierGroupRepository.save(any(ModifierGroup.class))).thenReturn(savedGroup);

        // Act
        var res = service.create(req, "tester");

        // Assert
        assertNotNull(res);
        assertEquals("Temperature", res.name());
        verify(modifierGroupRepository).save(any(ModifierGroup.class));
        verify(auditLogRepository).save(any());
    }
}
