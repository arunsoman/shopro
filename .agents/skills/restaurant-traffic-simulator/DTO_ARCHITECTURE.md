# DTO Architecture - Clean REST API Layer

## Problem Solved
Previously, we were adding `@JsonIgnore` to entity relationships to prevent infinite JSON recursion. This caused deserialization issues because the API couldn't accept relationship IDs.

## Solution: DTO Pattern
Created a clean separation between:
- **Entities**: Pure JPA entities with full relationships (no JSON annotations)
- **DTOs**: Data Transfer Objects for REST API serialization/deserialization
- **Controllers**: Convert DTOs ↔ Entities

## DTOs Created

### Request DTOs
- `OrderCreateDto` - Create orders with `sessionId` and `lines`
- `OrderLineDto` - Order line items with `menuItemId`

### Response DTOs  
- `OrderResponseDto` - Safe order responses (no lazy relationships)
- `OrderLineResponseDto` - Line item responses
- `MenuItemDto` - Menu item responses
- `TableSessionDto` - Session responses
- `DiningTableDto` - Table responses

## API Changes

### Before (Entity-based)
```json
POST /api/v1/restaurants/3/pos/orders
{
  "session": {"id": 123},  // ❌ Deserialization fails
  "lines": [{"menuItem": {"id": 456}, ...}]  // ❌ Infinite recursion
}
```

### After (DTO-based)
```json
POST /api/v1/restaurants/3/pos/orders
{
  "sessionId": 123,  // ✅ Simple ID
  "lines": [{"menuItemId": 456, "quantity": 1, "unitPrice": 10.00}]  // ✅ Flat structure
}
```

## Files Modified

### Backend (shopro-res)
- ✅ All entity files reverted to clean state (no @JsonIgnore)
- ✅ Created `/dto` package with 7 DTO classes
- ✅ `PosController.java` - Uses DTOs for request/response
- ✅ `MenuItemController.java` - Returns MenuItemDto
- ✅ `TableSessionController.java` - Returns TableSessionDto
- ✅ `OrderService.java` - Works with entities internally

### Python Simulator
- ✅ `traffic_simulator.py` - Sends `sessionId` instead of `session` object
- ✅ Lines already use `menuItemId` format (correct)

## Benefits
1. **No more infinite recursion** - DTOs don't have circular references
2. **Clean deserialization** - Simple ID fields instead of nested objects
3. **Entities stay pure** - No JSON pollution in JPA entities
4. **API versioning ready** - Can evolve DTOs independently
5. **Validation ready** - Can add @Valid annotations to DTOs

## Next Steps
1. Restart server
2. Run 5-day simulation test
3. Verify all orders complete successfully
