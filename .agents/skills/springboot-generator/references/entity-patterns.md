# Entity Relationship Patterns
## Reference for the springboot-generator skill

---

## 1. Detection from React mock data

### Pattern → Relationship mapping

| React mock shape | JPA mapping | Notes |
|---|---|---|
| `{ userId: 1 }` flat FK field | `@ManyToOne User user` + FK column | Most common — flat FK |
| `{ user: { id:1, name:"..." } }` nested object | `@ManyToOne User user` | Same mapping — nested or flat, result is identical |
| `{ tags: ["a","b"] }` string array | `@ElementCollection List<String> tags` | Stored in a separate `entity_tags` table |
| `{ items: [{id,name},...] }` object array | `@OneToMany` — promote to child entity | Each item becomes its own entity row |
| Same object shape referenced from 2+ parent types | `@ManyToMany` with explicit join table | e.g., Product ↔ Tag |
| `{ createdBy: "john" }` string | Map to `@ManyToOne User createdBy` | String username → FK to User |
| `{ status: "DRAFT" }` fixed string options | Java `enum` + `@Enumerated(EnumType.STRING)` | Never use ORDINAL — breaks on reorder |
| `{ address: { line1, city, state, pincode } }` | `@Embeddable Address` value object | Not a separate entity — no own ID |
| `{ lat: 12.34, lng: 56.78 }` coordinate pair | `@Embeddable GeoPoint` | Value object pattern |
| `{ price: 9.99 }` money field | `BigDecimal` — not `Double` | Double has floating-point precision issues |

---

## 2. Relationship rules (ownership, cascade, direction)

### Which side owns the FK?

The side with `@JoinColumn` is the **owner** — it holds the foreign key column in the database.

| Relationship | FK owner (has `@JoinColumn`) | Non-owner (has `mappedBy`) |
|---|---|---|
| `ManyToOne` | The "many" side (child) | N/A — always unidirectional |
| `OneToMany` (bidirectional) | The "many" child side | Parent has `mappedBy` |
| `OneToOne` | Either side — put FK on the "dependent" side | Other side has `mappedBy` |
| `ManyToMany` | Pick one side to own the join table | Other side has `mappedBy` |

### Cascade type guide

| When to use | Cascade |
|---|---|
| Child cannot exist without parent (e.g., `OrderItem` ← `Order`) | `CascadeType.ALL` + `orphanRemoval = true` |
| Child can exist independently (e.g., `Product` ← `Category`) | No cascade on child. Parent may cascade `PERSIST` only |
| Parent should persist its new children on save | `CascadeType.PERSIST` |
| Updating parent should update owned children | `CascadeType.MERGE` |
| **Never** cascade DELETE upward (child deleted → parent deleted) | Don't cascade on `@ManyToOne` |
| ManyToMany | Usually no cascade — each entity has independent lifecycle |

### Bidirectional vs unidirectional

**Prefer unidirectional unless you need to navigate the association from both sides in code.**

| Scenario | Recommendation |
|---|---|
| You only traverse parent → children | Bidirectional `@OneToMany` (parent has the collection) |
| You only traverse child → parent | Unidirectional `@ManyToOne` (no collection on parent) |
| You need both directions | Bidirectional with `mappedBy` on the non-owner |
| `@ManyToMany` | Always bidirectional with explicit join entity (see Section 4) |

---

## 3. Common app archetypes and entity sets

### E-Commerce / Procurement
```
User → Order (OneToMany, cascade=PERSIST)
Order → OrderItem (OneToMany, cascade=ALL, orphanRemoval=true)
OrderItem → Product (ManyToOne, no cascade)
Product → Category (ManyToOne, no cascade)
Product ← ProductImage (OneToMany, cascade=ALL, orphanRemoval=true)
Order has: status enum (DRAFT/PLACED/ACCEPTED/DELIVERED/CANCELLED)
OrderItem has: BigDecimal agreedUnitPrice (snapshot at order time — not live product price)
```

### Project Management
```
User ← Project (ManyToMany via ProjectMember join entity — not @ManyToMany annotation)
  ProjectMember: { user, project, role (enum: OWNER/MEMBER/VIEWER), joinedAt }
Project → Task (OneToMany, cascade=ALL, orphanRemoval=true)
Task → User (ManyToOne, assignee, nullable=true)
Task ← Comment (OneToMany, cascade=ALL, orphanRemoval=true)
Task ← Attachment (OneToMany, cascade=ALL, orphanRemoval=true)
Task has: status enum (TODO/IN_PROGRESS/DONE/CANCELLED)
```

### Blog / CMS
```
User → Post (OneToMany, cascade=PERSIST)
Post ← Comment (OneToMany, cascade=ALL, orphanRemoval=true)
Post ↔ Tag (ManyToMany via post_tags join table)
Post → Category (ManyToOne, no cascade)
Post has: status enum (DRAFT/PUBLISHED/ARCHIVED)
```

### B2B Marketplace (Shopro pattern)
```
Restaurant → PurchaseOrder (OneToMany)         -- buyer raises PO to platform
PurchaseOrder → SubPurchaseOrder (OneToMany, cascade=ALL, orphanRemoval=true)
SubPurchaseOrder → Supplier (ManyToOne)        -- platform assigns to supplier
PurchaseOrder → OrderLineItem (OneToMany, cascade=ALL, orphanRemoval=true)
PurchaseOrder has: status enum (DRAFT/RAISED/ACCEPTED/SPLITTING/IN_FULFILLMENT/DELIVERED/CLOSED)
SubPurchaseOrder has: status enum (CREATED/ACKNOWLEDGED/PREPARING/DISPATCHED/DELIVERED/PAID)
BidEvent → BidEvent_Supplier (join entity for invited suppliers)
BidEvent → SupplierQuote (OneToMany, cascade=ALL)
PlatformTransaction: { id, subPO, capturedAmount, payoutAmount, fee, status enum }
```

### Dashboard / Analytics
```
User → Report (OneToMany, cascade=ALL, orphanRemoval=true)
Report → DataPoint (OneToMany, cascade=ALL, orphanRemoval=true)
User → Notification (OneToMany, cascade=ALL, orphanRemoval=true)
Notification has: type enum (ORDER/PAYMENT/BID/SHIPMENT/SYSTEM)
Notification: read boolean, readAt LocalDateTime
```

---

## 4. ManyToMany — always use an explicit join entity

**Never use `@ManyToMany` annotation directly.** It creates a join table you can't add fields to later. Always create an explicit join entity.

```java
// BAD — can never add fields like joinedAt, role, etc.
@ManyToMany
@JoinTable(name = "project_members", ...)
private List<User> members;

// GOOD — explicit join entity
@Entity
@Table(name = "project_members")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProjectMember {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnore
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MemberRole role;    // OWNER, MEMBER, VIEWER

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime joinedAt;
}
```

---

## 5. Enums — always STRING storage

```java
// In entity:
@Enumerated(EnumType.STRING)
@Column(nullable = false, length = 30)
private OrderStatus status;

// Enum definition:
public enum OrderStatus {
    DRAFT,
    RAISED,
    ACCEPTED,
    IN_FULFILLMENT,
    PARTIALLY_DELIVERED,
    DELIVERED,
    CLOSED,
    REJECTED,
    CANCELLED;
}
```

Rules:
- **Always** `EnumType.STRING` — `ORDINAL` breaks silently if you ever reorder values
- `length = 30` is sufficient for most enum names
- If the React mock shows a string dropdown (`["DRAFT","ACTIVE","CLOSED"]`) → create an enum

---

## 6. Embedded value objects

Use `@Embeddable` when an object:
- Has no identity of its own (no `id` field needed)
- Always belongs to exactly one parent
- Would produce an over-normalised table if made into its own entity

```java
// Good candidates: Address, Money, GeoPoint, DateRange, ContactInfo

@Embeddable
@Data @NoArgsConstructor @AllArgsConstructor
public class Address {
    @Column(name = "addr_line1", nullable = false, length = 200)
    private String line1;

    @Column(name = "addr_line2", length = 200)
    private String line2;

    @Column(name = "addr_city", nullable = false, length = 100)
    private String city;

    @Column(name = "addr_state", nullable = false, length = 100)
    private String state;

    @Column(name = "addr_pincode", nullable = false, length = 10)
    private String pincode;

    @Column(name = "addr_lat")
    private Double lat;

    @Column(name = "addr_lng")
    private Double lng;
}

// In parent entity:
@Embedded
private Address deliveryAddress;   // columns: addr_line1, addr_city, etc.

// Multiple embedded instances of the same type:
@Embedded
@AttributeOverrides({
    @AttributeOverride(name = "line1",   column = @Column(name = "bill_line1")),
    @AttributeOverride(name = "city",    column = @Column(name = "bill_city")),
    // ... override all columns
})
private Address billingAddress;
```

---

## 7. Soft delete pattern

Every entity gets these fields and the `@SQLRestriction` annotation:

```java
@Entity
@SQLRestriction("is_deleted = false")   // Spring Boot 3.x — replaces @Where
public class Order {
    // ... other fields

    @Column(nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    private LocalDateTime deletedAt;
}
```

Service layer delete — never call `repository.delete()`:
```java
@Transactional
public void delete(Long id, Long userId) {
    Order order = repository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", id));
    order.setIsDeleted(true);
    order.setDeletedAt(LocalDateTime.now());
    // No explicit save needed — @Transactional + dirty checking handles it
}
```

Admin "hard delete" (only if needed):
```java
// Use @Query with @Modifying to bypass the @SQLRestriction filter
@Modifying
@Query(value = "DELETE FROM orders WHERE id = :id", nativeQuery = true)
void hardDelete(@Param("id") Long id);
```

---

## 8. Pagination pattern

Every list endpoint returns `Page<ResponseDTO>`. Never return a `List<T>` from a list endpoint.

```java
// Repository
Page<Order> findByUserId(Long userId, Pageable pageable);

// Service
@Transactional(readOnly = true)
public Page<OrderResponse> findAll(Long userId, Pageable pageable) {
    return repository.findByUserId(userId, pageable)
            .map(o -> modelMapper.map(o, OrderResponse.class));
}

// Controller
@GetMapping
public ResponseEntity<Page<OrderResponse>> getAll(
        @AuthenticationPrincipal UserDetails userDetails,
        @PageableDefault(size = 20, sort = "createdAt",
                         direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(service.findAll(extractUserId(userDetails), pageable));
}
```

React — consume paginated response:
```typescript
// The Spring Page<T> response shape:
type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;       // current page (0-indexed)
  size: number;
  first: boolean;
  last: boolean;
};

const { data } = useQuery<PageResponse<Order>>('/api/v1/orders?page=0&size=20&sort=createdAt,desc');
const orders = data?.content ?? [];
const totalPages = data?.totalPages ?? 0;
```

---

## 9. Naming conventions

| What | Convention | Example |
|---|---|---|
| Table names | `snake_case` plural | `order_items` |
| FK columns | `{entity}_id` | `user_id`, `order_id` |
| Join table | `{parent}_{child}` alphabetically | `post_tags`, `project_members` |
| Enum column | same as field | `status VARCHAR(30)` |
| Embedded column prefix | `{field_name}_{column}` | `delivery_addr_line1` |
| Audit fields | `created_at`, `updated_at`, `is_deleted`, `deleted_at` | universal |
| Boolean fields | `is_` prefix | `is_deleted`, `is_active`, `is_verified` |

---

## 10. N+1 protection checklist

The most common JPA performance problem is the N+1 query. Apply these to every entity:

```yaml
# application.yml — batch fetches for lazy collections
spring.jpa.properties.hibernate.default_batch_fetch_size: 16
```

```java
// Use JOIN FETCH in @Query when you know you'll always need the association:
@Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.user.id = :userId")
List<Order> findWithItemsByUserId(@Param("userId") Long userId);

// For paginated queries — DON'T use JOIN FETCH (causes incorrect count query).
// Use batch fetch size instead and let Hibernate batch the secondary queries.
```

```java
// In service — use Hibernate.initialize() only if you absolutely need a collection
// outside a @Transactional context (usually a smell — fix the transaction boundary instead).
```

---

## 11. Atomic multi-entity operations

For workflows that touch multiple entities (e.g., PO splitting creates parent PO + multiple sub-POs + updates inventory), wrap the entire operation in a single `@Transactional` method:

```java
@Transactional   // one transaction — all succeed or all roll back
public SplitResult splitPurchaseOrder(Long poId, List<POSplitGroup> groups, Long userId) {
    PurchaseOrder po = poRepository.findByIdAndUserId(poId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", poId));

    List<SubPurchaseOrder> subPOs = groups.stream()
            .map(group -> {
                SubPurchaseOrder sub = SubPurchaseOrder.builder()
                        .parentPo(po)
                        .supplier(supplierRepository.getReferenceById(group.getSupplierId()))
                        .lineItems(group.getLineItems())
                        .status(SubPOStatus.CREATED)
                        .build();
                return subPoRepository.save(sub);
            })
            .toList();

    po.setStatus(POStatus.SPLIT_COMPLETE);
    // No explicit save for po — dirty checking handles it within the transaction

    return new SplitResult(po, subPOs);
}
// If ANY save fails → entire transaction rolls back → database stays consistent
```