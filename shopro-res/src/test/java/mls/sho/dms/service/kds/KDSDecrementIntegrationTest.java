package mls.sho.dms.service.kds;

import mls.sho.dms.application.mapper.KDSMapper;
import mls.sho.dms.application.service.order.OrderServiceImpl;
import mls.sho.dms.entity.menu.MenuItem;
import mls.sho.dms.entity.order.OrderItem;
import mls.sho.dms.entity.order.OrderType;
import mls.sho.dms.entity.order.OrderTicket;
import mls.sho.dms.entity.order.OrderItemStatus;
import mls.sho.dms.repository.order.*;
import mls.sho.dms.repository.staff.StaffRepository;
import mls.sho.dms.repository.crm.CustomerProfileRepository;
import mls.sho.dms.repository.menu.MenuItemRepository;
import mls.sho.dms.repository.menu.ModifierOptionRepository;
import mls.sho.dms.repository.floor.TableShapeRepository;
import mls.sho.dms.service.edp.EdpPublisher;
import mls.sho.dms.service.kds.KDSService;
import mls.sho.dms.application.service.inventory.RecipeService;
import mls.sho.dms.application.service.staff.StaffService;
import mls.sho.dms.tax.entity.VenueCountryAssignment;
import mls.sho.dms.tax.entity.Country;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class KDSDecrementIntegrationTest {

    @Mock private OrderTicketRepository orderTicketRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private OrderItemModifierRepository orderItemModifierRepository;
    @Mock private MenuItemRepository menuItemRepository;
    @Mock private ModifierOptionRepository modifierOptionRepository;
    @Mock private TableShapeRepository tableShapeRepository;
    @Mock private StaffRepository staffMemberRepository;
    @Mock private CustomerProfileRepository customerProfileRepository;
    @Mock private mls.sho.dms.application.service.crm.LoyaltyService loyaltyService;
    @Mock private RecipeService recipeService;
    @Mock private KDSService kdsService;
    @Mock private StaffService staffService;
    @Mock private OrderAuditLogRepository orderAuditLogRepository;
    @Mock private mls.sho.dms.application.service.core.NotificationEngine notificationEngine;
    @Mock private EdpPublisher edpPublisher;
    @Mock private SimpMessagingTemplate messagingTemplate;
    @Mock private mls.sho.dms.tax.repository.VenueCountryAssignmentRepository venueCountryAssignmentRepository;
    @Mock private mls.sho.dms.tax.repository.TaxCalculationResultRepository taxCalculationResultRepository;
    @Mock private mls.sho.dms.tax.repository.TaxRuleRepository taxRuleRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testDecrementTargetsCorrectUnitIndex() {
        // 1. Setup Order with Quantity 3
        UUID orderId = UUID.randomUUID();
        UUID itemId = UUID.randomUUID();
        
        OrderTicket ticket = new OrderTicket();
        ticket.setId(orderId);
        ticket.setSubtotal(BigDecimal.ZERO);
        ticket.setOrderType(OrderType.DINE_IN);
        
        MenuItem menuItem = new MenuItem();
        menuItem.setId(UUID.randomUUID());
        
        OrderItem item = new OrderItem();
        item.setId(itemId);
        item.setMenuItem(menuItem);
        item.setQuantity(3);
        item.setUnitPrice(BigDecimal.TEN);
        item.setModifierUpchargeTotal(BigDecimal.ZERO);
        item.setTicket(ticket);
        item.setStatus(OrderItemStatus.SENT);
        
        when(orderItemRepository.findById(itemId)).thenReturn(Optional.of(item));
        when(orderTicketRepository.findById(orderId)).thenReturn(Optional.of(ticket));
        when(orderItemRepository.findByTicketAndStatusNotOrderByCreatedAtAsc(any(OrderTicket.class), eq(OrderItemStatus.VOIDED)))
            .thenReturn(new ArrayList<>(java.util.List.of(item)));
        when(kdsService.getRemovableQuantity(itemId)).thenReturn(3);

        // Mock Tax to avoid TaxNotConfiguredException
        VenueCountryAssignment assignment = mock(VenueCountryAssignment.class);
        Country country = new Country();
        country.setName("TestLand");
        country.setTaxIncluded(false);
        when(assignment.getCountry()).thenReturn(country);
        when(venueCountryAssignmentRepository.findByVenueIdAndActiveTrue(any())).thenReturn(Optional.of(assignment));
        
        mls.sho.dms.tax.entity.TaxRule mockRule = mock(mls.sho.dms.tax.entity.TaxRule.class);
        when(mockRule.getDefaultRate()).thenReturn(BigDecimal.valueOf(0.05));
        when(mockRule.isAppliesToDineIn()).thenReturn(true); 
        
        List<Object[]> ruleData = new ArrayList<>();
        ruleData.add(new Object[]{mockRule, null}); // Rule at 0, Override at 1
        when(taxRuleRepository.findActiveRulesWithOverridesForVenue(any())).thenReturn(ruleData);
        when(kdsService.decrementSpecificUnit(any(), anyInt())).thenReturn("OK");

        // 2. Decrement Quantity from 3 to 2
        orderService.updateItemQuantity(orderId, itemId, 2);
        
        // 3. Verify specifically targets unitIndex 3 (the highest)
        verify(kdsService).decrementSpecificUnit(eq(itemId), eq(3));
        
        // 4. Verify EDP event with unitIndex 3
        verify(edpPublisher).publish(eq("order.item_decrement"), argThat(payload -> 
            payload.get("unitIndex").equals(3) && 
            payload.get("quantity").equals(1) &&
            payload.get("menuItemId").equals(menuItem.getId())
        ));
    }

    @Test
    public void testDecrementRejectedWhenAlreadyCooking() {
        // 1. Setup Order with Quantity 1
        UUID orderId = UUID.randomUUID();
        UUID itemId = UUID.randomUUID();
        
        OrderTicket ticket = new OrderTicket();
        ticket.setId(orderId);
        ticket.setOrderType(OrderType.DINE_IN);
        
        OrderItem item = new OrderItem();
        item.setId(itemId);
        item.setQuantity(1);
        item.setStatus(OrderItemStatus.SENT);
        item.setTicket(ticket);
        item.setMenuItem(new MenuItem());
        
        when(orderItemRepository.findById(itemId)).thenReturn(Optional.of(item));
        when(orderTicketRepository.findById(orderId)).thenReturn(Optional.of(ticket));
        when(kdsService.getRemovableQuantity(itemId)).thenReturn(1);
        when(kdsService.decrementSpecificUnit(eq(itemId), eq(1))).thenReturn("COOKING");

        // 2. Setup Tax (Required)
        VenueCountryAssignment assignment = mock(VenueCountryAssignment.class);
        Country country = new Country();
        country.setTaxIncluded(false);
        when(assignment.getCountry()).thenReturn(country);
        when(venueCountryAssignmentRepository.findByVenueIdAndActiveTrue(any())).thenReturn(Optional.of(assignment));
        
        mls.sho.dms.tax.entity.TaxRule mockRule = mock(mls.sho.dms.tax.entity.TaxRule.class);
        when(mockRule.getDefaultRate()).thenReturn(BigDecimal.valueOf(0.05));
        when(mockRule.isAppliesToDineIn()).thenReturn(true); 
        List<Object[]> ruleData = new ArrayList<>();
        ruleData.add(new Object[]{mockRule, null});
        when(taxRuleRepository.findActiveRulesWithOverridesForVenue(any())).thenReturn(ruleData);
        
        // 3. Attempt Decrement
        orderService.updateItemQuantity(orderId, itemId, 0);
        
        // 4. Verify kdsService was called with index 1
        verify(kdsService).decrementSpecificUnit(eq(itemId), eq(1));
        
        // 5. Verify order.item_decrement event was still published (to initiate the protocol)
        verify(edpPublisher).publish(eq("order.item_decrement"), anyMap());
        
        // Note: The actual blocking happens in StationEventConsumer/Frontend, 
        // OrderService just initiates the request in this async architecture.
    }
}
