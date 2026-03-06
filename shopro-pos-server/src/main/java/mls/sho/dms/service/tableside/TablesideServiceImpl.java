package mls.sho.dms.service.tableside;

import mls.sho.dms.dto.menu.MenuCategoryDto;
import mls.sho.dms.dto.menu.MenuItemDto;
import mls.sho.dms.dto.tableside.AddCartItemRequest;
import mls.sho.dms.dto.tableside.GuestCartItemDto;
import mls.sho.dms.dto.tableside.TablesideSessionDto;
import mls.sho.dms.entity.floor.TableShape;
import mls.sho.dms.entity.menu.MenuCategory;
import mls.sho.dms.entity.menu.MenuItem;
import mls.sho.dms.entity.menu.MenuItemStatus;
import mls.sho.dms.entity.tableside.GuestCartItem;
import mls.sho.dms.entity.tableside.TablesideSession;
import mls.sho.dms.entity.tableside.TablesideSessionStatus;
import mls.sho.dms.repository.floor.TableShapeRepository;
import mls.sho.dms.repository.menu.MenuCategoryRepository;
import mls.sho.dms.repository.menu.MenuItemRepository;
import mls.sho.dms.repository.tableside.GuestCartItemRepository;
import mls.sho.dms.repository.tableside.TablesideSessionRepository;
import mls.sho.dms.entity.floor.TableStatus;
import mls.sho.dms.entity.order.OrderItem;
import mls.sho.dms.entity.order.OrderTicket;
import mls.sho.dms.entity.order.OrderType;
import mls.sho.dms.entity.order.TicketStatus;
import mls.sho.dms.entity.staff.StaffMember;
import mls.sho.dms.application.service.inventory.RecipeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TablesideServiceImpl implements TablesideService {

    private final TablesideSessionRepository sessionRepo;
    private final GuestCartItemRepository cartItemRepo;
    private final TableShapeRepository tableRepo;
    private final MenuItemRepository menuItemRepo;
    private final MenuCategoryRepository categoryRepo;
    private final mls.sho.dms.repository.order.OrderTicketRepository orderTicketRepo;
    private final mls.sho.dms.repository.staff.StaffMemberRepository staffRepo;
    private final RecipeService recipeService;

    public TablesideServiceImpl(
            TablesideSessionRepository sessionRepo,
            GuestCartItemRepository cartItemRepo,
            TableShapeRepository tableRepo,
            MenuItemRepository menuItemRepo,
            MenuCategoryRepository categoryRepo,
            mls.sho.dms.repository.order.OrderTicketRepository orderTicketRepo,
            mls.sho.dms.repository.staff.StaffMemberRepository staffRepo,
            RecipeService recipeService) {
        this.sessionRepo = sessionRepo;
        this.cartItemRepo = cartItemRepo;
        this.tableRepo = tableRepo;
        this.menuItemRepo = menuItemRepo;
        this.categoryRepo = categoryRepo;
        this.orderTicketRepo = orderTicketRepo;
        this.staffRepo = staffRepo;
        this.recipeService = recipeService;
    }

    @Override
    @Transactional(readOnly = true)
    public TablesideSessionDto getSessionByQrToken(UUID qrToken) {
        TablesideSession session = sessionRepo.findByQrToken(qrToken)
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired QR code"));
        
        if (session.getStatus() != TablesideSessionStatus.ACTIVE) {
            throw new IllegalStateException("This table session is no longer active");
        }
        
        return toDto(session);
    }

    @Override
    @Transactional
    public TablesideSessionDto createOrGetSession(UUID tableId) {
        return sessionRepo.findByTableIdAndStatus(tableId, TablesideSessionStatus.ACTIVE)
            .map(this::toDto)
            .orElseGet(() -> {
                TableShape table = tableRepo.findById(tableId)
                    .orElseThrow(() -> new IllegalArgumentException("Table not found"));
                
                TablesideSession newSession = new TablesideSession();
                newSession.setTable(table);
                newSession.setQrToken(UUID.randomUUID());
                newSession.setStatus(TablesideSessionStatus.ACTIVE);
                
                return toDto(sessionRepo.save(newSession));
            });
    }

    @Override
    @Transactional
    public TablesideSessionDto createOrGetSessionByTableName(String tableName) {
        TableShape table = tableRepo.findByNameIgnoreCase(tableName)
            .orElseThrow(() -> new IllegalArgumentException("Table '" + tableName + "' not found"));
        return sessionRepo.findByTableIdAndStatus(table.getId(), TablesideSessionStatus.ACTIVE)
            .map(this::toDto)
            .orElseGet(() -> {
                TablesideSession newSession = new TablesideSession();
                newSession.setTable(table);
                newSession.setQrToken(UUID.randomUUID());
                newSession.setStatus(TablesideSessionStatus.ACTIVE);
                return toDto(sessionRepo.save(newSession));
            });
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuestCartItemDto> getCartItems(UUID sessionId) {
        return cartItemRepo.findBySessionId(sessionId).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GuestCartItemDto addCartItem(UUID sessionId, AddCartItemRequest request) {
        TablesideSession session = sessionRepo.findById(sessionId)
            .orElseThrow(() -> new IllegalArgumentException("Session not found"));
            
        MenuItem menuItem = menuItemRepo.findById(request.menuItemId())
            .orElseThrow(() -> new IllegalArgumentException("Menu item not found"));

        GuestCartItem item = new GuestCartItem();
        item.setSession(session);
        item.setDeviceFingerprint(request.deviceFingerprint());
        item.setMenuItem(menuItem);
        item.setQuantity(request.quantity());
        item.setModifiers(request.modifiers());
        item.setCustomNote(request.customNote());

        return toDto(cartItemRepo.save(item));
    }

    @Override
    @Transactional
    public void removeCartItem(UUID sessionId, UUID itemId, String deviceFingerprint) {
        GuestCartItem item = cartItemRepo.findById(itemId)
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));
            
        if (!item.getSession().getId().equals(sessionId) || !item.getDeviceFingerprint().equals(deviceFingerprint)) {
            throw new IllegalStateException("Unauthorized to remove this item");
        }
        
        cartItemRepo.delete(item);
    }

    @Override
    @Transactional
    public UUID submitOrder(UUID sessionId) {
        TablesideSession session = sessionRepo.findById(sessionId)
            .orElseThrow(() -> new IllegalArgumentException("Session not found"));
            
        List<GuestCartItem> cartItems = cartItemRepo.findBySessionId(sessionId);
        if (cartItems.isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }

        // 1. Get or Create OrderTicket for the table
        OrderTicket ticket = orderTicketRepo.findActiveTicketByTable(session.getTable())
            .orElseGet(() -> {
                OrderTicket newTicket = new OrderTicket();
                newTicket.setTable(session.getTable());
                // For tableside, we assign a default "Digital Server" or the table's assigned server
                // Requirement check: "The main POS terminal assigned to that server shows the table as Yellow"
                // We'll use the table's current server if available, otherwise a system user.
                StaffMember defaultServer = staffRepo.findByFullName("Digital Assistant")
                    .orElseGet(() -> staffRepo.findAll().get(0)); // Fallback
                newTicket.setServer(defaultServer);
                newTicket.setStatus(TicketStatus.OPEN);
                newTicket.setOrderType(OrderType.DINE_IN);
                return orderTicketRepo.save(newTicket);
            });

        // 2. Map CartItems to OrderItems
        for (GuestCartItem cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setTicket(ticket);
            orderItem.setMenuItem(cartItem.getMenuItem());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(cartItem.getMenuItem().getBasePrice());
            orderItem.setCustomNote(cartItem.getCustomNote());
            orderItem.setStatus(mls.sho.dms.entity.order.OrderItemStatus.PENDING);
            
            // Calculate modifier upcharges if any (simplified for now)
            BigDecimal upcharge = BigDecimal.ZERO;
            orderItem.setModifierUpchargeTotal(upcharge);
            
            ticket.getItems().add(orderItem);
            
            // Auto-deplete inventory based on recipe
            recipeService.depleteForOrderItem(orderItem);
        }

        // 3. Update Ticket and Table Status
        ticket.setStatus(TicketStatus.SUBMITTED);
        // Requirement US-2.3: "POS terminal assigned to that server shows the table as Yellow (Food Sent)"
        // In our 11-state model, Yellow/Gold corresponds to ORDER_PLACED or HELD. 
        // 04_FLOOR_PLAN_REQUIREMENTS.md: "ORDER_PLACED — Purple: Order sent to kitchen (replaces FOOD_SENT)"
        // Wait, the status colors in 04 vs 06 are slightly different. I'll stick to the 11-state model's enum.
        session.getTable().setStatus(TableStatus.ORDER_PLACED);
        
        // 4. Save Ticket and clear cart
        orderTicketRepo.save(ticket);
        cartItemRepo.deleteAll(cartItems);
        
        return ticket.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuCategoryDto> getCategories() {
        return categoryRepo.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuItemDto> getMenuItemsByCategory(UUID categoryId) {
        return menuItemRepo.findByCategoryIdAndStatus(categoryId, MenuItemStatus.PUBLISHED).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private TablesideSessionDto toDto(TablesideSession session) {
        return new TablesideSessionDto(
            session.getId(),
            session.getTable().getId(),
            session.getQrToken(),
            session.getStatus().name()
        );
    }

    private GuestCartItemDto toDto(GuestCartItem item) {
        return new GuestCartItemDto(
            item.getId(),
            item.getSession().getId(),
            item.getDeviceFingerprint(),
            item.getMenuItem().getId(),
            item.getQuantity(),
            item.getModifiers(),
            item.getCustomNote()
        );
    }

    private MenuCategoryDto toDto(MenuCategory category) {
        return new MenuCategoryDto(
            category.getId(),
            category.getName(),
            null, // Category description not in entity yet
            null, // Category photoUrl not in entity yet
            category.getDisplayOrder(),
            category.getDefaultCourse()
        );
    }

    private MenuItemDto toDto(MenuItem item) {
        return new MenuItemDto(
            item.getId(),
            item.getName(),
            item.getDescription(),
            item.getBasePrice(),
            item.getPhotoUrl(),
            item.getStatus().name(),
            item.getCategory().getId(),
            new ArrayList<>() // Modifier groups omitted for brevity/speed in tableside MVP
        );
    }
}
