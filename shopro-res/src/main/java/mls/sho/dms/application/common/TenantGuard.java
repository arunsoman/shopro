package mls.sho.dms.application.common;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.inventory.entity.Ingredient;
import mls.sho.dms.application.inventory.repository.IngredientRepository;
import mls.sho.dms.application.pos.entity.DiningTable;
import mls.sho.dms.application.pos.entity.MenuItem;
import mls.sho.dms.application.pos.entity.Order;
import mls.sho.dms.application.pos.entity.TableSession;
import mls.sho.dms.application.pos.repository.DiningTableRepository;
import mls.sho.dms.application.pos.repository.MenuItemRepository;
import mls.sho.dms.application.pos.repository.OrderRepository;
import mls.sho.dms.application.pos.repository.TableSessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/**
 * Centralised multi-tenant ownership guard.
 *
 * <p>Every method loads the entity by its ID, verifies that it belongs to
 * the given {@code restaurantId}, and returns it.  On mismatch the method
 * throws {@code 404 Not Found} (not 403) so that the caller cannot infer
 * whether the entity exists in another tenant.</p>
 */
@Component
@RequiredArgsConstructor
public class TenantGuard {

    private final OrderRepository orderRepository;
    private final IngredientRepository ingredientRepository;
    private final DiningTableRepository tableRepository;
    private final TableSessionRepository sessionRepository;
    private final MenuItemRepository menuItemRepository;

    public Order order(Long restaurantId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> notFound("Order", orderId));
        if (!restaurantId.equals(order.getRestaurantId())) {
            throw notFound("Order", orderId);
        }
        return order;
    }

    public Ingredient ingredient(Long restaurantId, Long ingredientId) {
        Ingredient ingredient = ingredientRepository.findById(ingredientId)
                .orElseThrow(() -> notFound("Ingredient", ingredientId));
        if (!restaurantId.equals(ingredient.getRestaurant().getId())) {
            throw notFound("Ingredient", ingredientId);
        }
        return ingredient;
    }

    public DiningTable table(Long restaurantId, Long tableId) {
        DiningTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> notFound("Table", tableId));
        if (!restaurantId.equals(table.getRestaurant().getId())) {
            throw notFound("Table", tableId);
        }
        return table;
    }

    public TableSession session(Long restaurantId, Long sessionId) {
        TableSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> notFound("Session", sessionId));
        if (session.getTable() == null || !restaurantId.equals(session.getTable().getRestaurant().getId())) {
            throw notFound("Session", sessionId);
        }
        return session;
    }

    public MenuItem menuItem(Long restaurantId, Long menuItemId) {
        MenuItem item = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> notFound("MenuItem", menuItemId));
        if (!restaurantId.equals(item.getRestaurant().getId())) {
            throw notFound("MenuItem", menuItemId);
        }
        return item;
    }

    private ResponseStatusException notFound(String entity, Long id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, entity + " not found: " + id);
    }
}
