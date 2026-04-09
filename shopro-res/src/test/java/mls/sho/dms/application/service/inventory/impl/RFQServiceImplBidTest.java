package mls.sho.dms.application.service.inventory.impl;

import mls.sho.dms.application.dto.inventory.BidLineItemRequest;
import mls.sho.dms.application.dto.inventory.CreateBidRequest;
import mls.sho.dms.application.service.inventory.RFQService;
import mls.sho.dms.entity.inventory.RawIngredient;
import mls.sho.dms.entity.inventory.RFQ;
import mls.sho.dms.entity.inventory.RfqStatus;
import mls.sho.dms.entity.inventory.Supplier;
import mls.sho.dms.repository.inventory.RawIngredientRepository;
import mls.sho.dms.repository.inventory.RFQRepository;
import mls.sho.dms.repository.inventory.SupplierRepository;
import mls.sho.dms.application.service.inventory.AlertService;
import mls.sho.dms.application.service.inventory.BidStateMachineService;
import mls.sho.dms.application.service.inventory.BiddingStateMachineService;
import mls.sho.dms.application.service.inventory.POGeneratorService;
import mls.sho.dms.repository.inventory.PurchaseOrderRepository;
import mls.sho.dms.entity.inventory.PurchaseOrder;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class RFQServiceImplBidTest {

    @Mock
    private RawIngredientRepository ingredientRepository;
    @Mock
    private RFQRepository rfqRepository;
    @Mock
    private SupplierRepository supplierRepository;
    @Mock
    private AlertService alertService;
    @Mock
    private BiddingStateMachineService stateMachineService;
    @Mock
    private BidStateMachineService bidStateMachineService;
    @Mock
    private POGeneratorService poGeneratorService;
    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;

    @InjectMocks
    private RFQServiceImpl rfqService;

    @Test
    void createBid_ValidRequest_ShouldCreateRfqsAndNotifySuppliers() {
        // Arrange
        UUID ingredientId = UUID.randomUUID();
        UUID supplierId = UUID.randomUUID();
        Instant deadline = Instant.now().plus(2, ChronoUnit.HOURS);
        LocalDate deliveryDate = LocalDate.now().plusDays(2);

        RawIngredient ingredient = new RawIngredient();
        ingredient.setId(ingredientId);
        ingredient.setName("Tomato");

        Supplier supplier = new Supplier();
        supplier.setId(supplierId);
        supplier.setContactEmail("vendor@example.com");

        CreateBidRequest request = new CreateBidRequest(
            List.of(new BidLineItemRequest(ingredientId, new BigDecimal("10.0"), deliveryDate)),
            List.of(supplierId),
            deadline
        );

        when(ingredientRepository.findById(ingredientId)).thenReturn(Optional.of(ingredient));
        when(rfqRepository.findActiveRfqsByIngredientId(ingredientId, RfqStatus.OPEN)).thenReturn(List.of());
        when(rfqRepository.save(any(RFQ.class))).thenAnswer(i -> i.getArguments()[0]);
        when(supplierRepository.findById(supplierId)).thenReturn(Optional.of(supplier));

        // Act
        rfqService.createBid(request);

        // Assert
        verify(rfqRepository, times(1)).save(any(RFQ.class));
        verify(alertService, times(1)).sendNotification(eq("vendor@example.com"), anyString(), anyString());
    }
}
