package mls.sho.dms.application.service.inventory.impl;

import mls.sho.dms.application.event.inventory.POStateChangedEvent;
import mls.sho.dms.entity.inventory.procurement.PurchaseOrder;
import mls.sho.dms.entity.inventory.procurement.PurchaseOrderStatus;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import mls.sho.dms.repository.inventory.POStatusHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class POStateMachineServiceTest {

    @Mock
    private PurchaseOrderRepository poRepository;

    @Mock
    private POStatusHistoryRepository poHistoryRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private POStateMachineServiceImpl stateMachineService;

    private UUID poId;
    private PurchaseOrder po;
    private UUID actorId;

    @BeforeEach
    void setUp() {
        poId = UUID.randomUUID();
        actorId = UUID.randomUUID();
        po = new PurchaseOrder();
        po.setId(poId);
        po.setStatus(PurchaseOrderStatus.DRAFT);
    }

    @Test
    void transition_ValidTransition_ShouldUpdateStatusAndPublishEvent() {
        // Arrange
        when(poRepository.findById(poId)).thenReturn(Optional.of(po));

        // Act
        stateMachineService.transition(poId, PurchaseOrderStatus.PENDING_APPROVAL, actorId, "Submitting for review");

        // Assert
        assertEquals(PurchaseOrderStatus.PENDING_APPROVAL, po.getStatus());
        verify(poRepository).save(po);
        verify(poHistoryRepository).save(any());
        verify(eventPublisher).publishEvent(any(POStateChangedEvent.class));
    }

    @Test
    void transition_InvalidTransition_ShouldThrowException() {
        // Arrange
        po.setStatus(PurchaseOrderStatus.DRAFT);
        when(poRepository.findById(poId)).thenReturn(Optional.of(po));

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> 
            stateMachineService.transition(poId, PurchaseOrderStatus.SHIPPED, actorId, "Direct to ship")
        );
        
        verify(poRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void transition_PoNotFound_ShouldThrowException() {
        // Arrange
        when(poRepository.findById(poId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> 
            stateMachineService.transition(poId, PurchaseOrderStatus.PENDING_APPROVAL, actorId, "N/A")
        );
    }

    @Test
    void transition_CounterOffer_ShouldBeAllowedFromSent() {
        // Arrange
        po.setStatus(PurchaseOrderStatus.SENT);
        when(poRepository.findById(poId)).thenReturn(Optional.of(po));

        // Act
        stateMachineService.transition(poId, PurchaseOrderStatus.COUNTER_OFFERED, actorId, "Price too high");

        // Assert
        assertEquals(PurchaseOrderStatus.COUNTER_OFFERED, po.getStatus());
    }
}
