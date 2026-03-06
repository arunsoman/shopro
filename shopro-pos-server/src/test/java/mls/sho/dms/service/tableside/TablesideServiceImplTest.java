package mls.sho.dms.service.tableside;

import mls.sho.dms.dto.tableside.AddCartItemRequest;
import mls.sho.dms.dto.tableside.GuestCartItemDto;
import mls.sho.dms.dto.tableside.TablesideSessionDto;
import mls.sho.dms.entity.floor.TableShape;
import mls.sho.dms.entity.menu.MenuItem;
import mls.sho.dms.entity.tableside.GuestCartItem;
import mls.sho.dms.entity.tableside.TablesideSession;
import mls.sho.dms.entity.tableside.TablesideSessionStatus;
import mls.sho.dms.repository.floor.TableShapeRepository;
import mls.sho.dms.repository.menu.MenuItemRepository;
import mls.sho.dms.repository.tableside.GuestCartItemRepository;
import mls.sho.dms.repository.tableside.TablesideSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TablesideServiceImplTest {

    @Mock
    private TablesideSessionRepository sessionRepo;

    @Mock
    private GuestCartItemRepository cartItemRepo;

    @Mock
    private TableShapeRepository tableRepo;

    @Mock
    private MenuItemRepository menuItemRepo;

    @InjectMocks
    private TablesideServiceImpl tablesideService;

    private TablesideSession activeSession;
    private TableShape table;
    private UUID sessionId;
    private UUID tableId;
    private UUID qrToken;

    @BeforeEach
    void setUp() {
        tableId = UUID.randomUUID();
        sessionId = UUID.randomUUID();
        qrToken = UUID.randomUUID();

        table = new TableShape();
        ReflectionTestUtils.setField(table, "id", tableId);

        activeSession = new TablesideSession();
        ReflectionTestUtils.setField(activeSession, "id", sessionId);
        activeSession.setTable(table);
        activeSession.setQrToken(qrToken);
        activeSession.setStatus(TablesideSessionStatus.ACTIVE);
    }

    @Test
    void getSessionByQrToken_Success() {
        when(sessionRepo.findByQrToken(qrToken)).thenReturn(Optional.of(activeSession));

        TablesideSessionDto dto = tablesideService.getSessionByQrToken(qrToken);

        assertThat(dto.qrToken()).isEqualTo(qrToken);
        assertThat(dto.status()).isEqualTo("ACTIVE");
    }

    @Test
    void getSessionByQrToken_Expired_ThrowsException() {
        activeSession.setStatus(TablesideSessionStatus.EXPIRED);
        when(sessionRepo.findByQrToken(qrToken)).thenReturn(Optional.of(activeSession));

        assertThrows(IllegalStateException.class, () -> tablesideService.getSessionByQrToken(qrToken));
    }

    @Test
    void addCartItem_Success() {
        UUID menuItemId = UUID.randomUUID();
        MenuItem menuItem = new MenuItem();
        ReflectionTestUtils.setField(menuItem, "id", menuItemId);
        menuItem.setBasePrice(new BigDecimal("12.50"));

        AddCartItemRequest request = new AddCartItemRequest(
                "John",
                "device-123",
                menuItemId,
                2,
                List.of(Map.of("name", "Extra Cheese")),
                "No onions"
        );

        when(sessionRepo.findById(sessionId)).thenReturn(Optional.of(activeSession));
        when(menuItemRepo.findById(menuItemId)).thenReturn(Optional.of(menuItem));
        when(cartItemRepo.save(any(GuestCartItem.class))).thenAnswer(invocation -> {
            GuestCartItem item = invocation.getArgument(0);
            ReflectionTestUtils.setField(item, "id", UUID.randomUUID());
            return item;
        });

        GuestCartItemDto result = tablesideService.addCartItem(sessionId, request);

        assertThat(result.quantity()).isEqualTo(2);
        assertThat(result.deviceFingerprint()).isEqualTo("device-123");
        verify(cartItemRepo, times(1)).save(any(GuestCartItem.class));
    }
}
