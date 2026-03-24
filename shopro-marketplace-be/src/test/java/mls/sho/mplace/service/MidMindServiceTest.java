package mls.sho.mplace.service;

import mls.sho.mplace.entity.*;
import mls.sho.mplace.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MidMindServiceTest {

    @Mock
    private PurchaseOrderRepository poRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private SubOrderRepository subOrderRepository;
    @Mock
    private SupplyListRepository supplyListRepository;
    @Mock
    private SupplierRepository supplierRepository;
    @Mock
    private ProcurementPolicyRepository policyRepository;
    @Mock
    private SystemSettingRepository settingRepository;
    @Mock
    private FinanceService financeService;
    @Mock
    private POActivityRepository activityRepository;
    @Mock
    private org.springframework.transaction.support.TransactionTemplate transactionTemplate;

    @InjectMocks
    private MidMindService midMindService;

    private PurchaseOrder po;
    private InventoryItem inventoryItem;
    private Food food;
    private OrderItem orderItem;

    @BeforeEach
    void setUp() {
        food = new Food();
        food.setId(1);
        food.setName("Test Food");

        inventoryItem = new InventoryItem();
        inventoryItem.setFood(food);

        orderItem = new OrderItem();
        orderItem.setInventoryItem(inventoryItem);
        orderItem.setQuantity(BigDecimal.TEN);
        orderItem.setPriceAtOrder(new BigDecimal("100.00"));
        orderItem.setItemName("Test Food Item");

        po = new PurchaseOrder();
        po.setId(UUID.randomUUID());
        po.setRoutingStatus(PurchaseOrder.RoutingStatus.PENDING_ROUTING);
        po.setItems(Collections.singletonList(orderItem));
    }

    @Test
    void testRoutePendingOrders_WithNullPrices_ShouldNotThrowNPE() {
        // Arrange
        when(poRepository.findAllByRoutingStatus(PurchaseOrder.RoutingStatus.PENDING_ROUTING))
                .thenReturn(Collections.singletonList(po));

        SupplyList supply1 = new SupplyList();
        supply1.setFoodId(1);
        supply1.setIsAvailable(true);
        supply1.setPrice(null); // This causes the NPE
        supply1.setSupplierId(UUID.randomUUID());

        SupplyList supply2 = new SupplyList();
        supply2.setFoodId(1);
        supply2.setIsAvailable(true);
        supply2.setPrice(new BigDecimal("50.00"));
        supply2.setSupplierId(UUID.randomUUID());

        when(supplyListRepository.findAllByFoodIdIn(anySet()))
                .thenReturn(Arrays.asList(supply1, supply2));
        
        when(settingRepository.findByKey("midmind_engine_status"))
                .thenReturn(Optional.of(new SystemSetting("midmind_engine_status", "RUNNING")));
        
        when(settingRepository.findByKey("wapp_enabled"))
                .thenReturn(Optional.of(new SystemSetting("wapp_enabled", "false")));

        doAnswer(invocation -> {
            invocation.<java.util.function.Consumer<org.springframework.transaction.TransactionStatus>>getArgument(0).accept(null);
            return null;
        }).when(transactionTemplate).executeWithoutResult(any());

        // Mock repository saves to avoid NPE in service
        when(poRepository.save(any())).thenReturn(po);
        when(poRepository.saveAndFlush(any())).thenReturn(po);
        
        Supplier mockSupplier = new Supplier();
        mockSupplier.setId(supply2.getSupplierId());
        when(supplierRepository.findById(any())).thenReturn(Optional.of(mockSupplier));
        
        when(activityRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        // Act & Assert
        assertDoesNotThrow(() -> midMindService.routePendingOrders());
        
        verify(poRepository, atLeastOnce()).saveAndFlush(any());
    }
}
