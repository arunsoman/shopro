package mls.sho.dms.application.service.inventory.impl;

import mls.sho.dms.application.event.inventory.RFQStateChangedEvent;
import mls.sho.dms.entity.inventory.RFQ;
import mls.sho.dms.entity.inventory.RFQStatusHistory;
import mls.sho.dms.entity.inventory.RfqStatus;
import mls.sho.dms.repository.inventory.RFQRepository;
import mls.sho.dms.repository.inventory.RFQStatusHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
class BiddingStateMachineServiceImplTest {

    @Mock
    private RFQRepository rfqRepository;

    @Mock
    private RFQStatusHistoryRepository rfqHistoryRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private BiddingStateMachineServiceImpl stateMachineService;

    private UUID rfqId;
    private RFQ rfq;
    private UUID actorId;

    @BeforeEach
    void setUp() {
        rfqId = UUID.randomUUID();
        rfq = new RFQ();
        rfq.setId(rfqId);
        rfq.setStatus(RfqStatus.OPEN);
        actorId = UUID.randomUUID();
    }

    @Test
    void transition_ValidTransition_UpdatesStatusAndRecordsHistory() {
        // Arrange
        when(rfqRepository.findById(rfqId)).thenReturn(Optional.of(rfq));

        // Act
        stateMachineService.transition(rfqId, RfqStatus.PENDING_REVIEW, actorId, "Ready for review");

        // Assert
        assertEquals(RfqStatus.PENDING_REVIEW, rfq.getStatus());
        verify(rfqRepository).save(rfq);
        verify(rfqHistoryRepository).save(any(RFQStatusHistory.class));
        verify(eventPublisher).publishEvent(any(RFQStateChangedEvent.class));
    }

    @Test
    void transition_InvalidTransition_ThrowsException() {
        // Arrange
        rfq.setStatus(RfqStatus.AWARDED); // Terminal state
        when(rfqRepository.findById(rfqId)).thenReturn(Optional.of(rfq));

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> 
            stateMachineService.transition(rfqId, RfqStatus.OPEN, actorId, "Reopening")
        );
    }

    @Test
    void transition_SameStatus_DoesNothing() {
        // Arrange
        rfq.setStatus(RfqStatus.OPEN);
        when(rfqRepository.findById(rfqId)).thenReturn(Optional.of(rfq));

        // Act
        stateMachineService.transition(rfqId, RfqStatus.OPEN, actorId, "No change");

        // Assert
        verify(rfqRepository, never()).save(any());
        verify(rfqHistoryRepository, never()).save(any());
    }

    @Test
    void transition_NotFound_ThrowsException() {
        // Arrange
        when(rfqRepository.findById(rfqId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> 
            stateMachineService.transition(rfqId, RfqStatus.CLOSED, actorId, "Closing")
        );
    }
}
