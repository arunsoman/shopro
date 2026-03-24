# Open Questions — Phase 2 Entity Map (Bidding Engine)

## EQ1 [RESOLVED — Inferred]
**Resolution:** Treat `restaurantId` and `supplierId` as raw `java.util.UUID` fields in the JPA entities. This maintains decoupling between the separate databases (`shopro_marketplace_db` and `shopro_pos`).

## EQ2 [RESOLVED — Schema Fix]
**Resolution:** Add `@OneToMany(mappedBy = "quote", cascade = CascadeType.ALL)` to the `Quote` entity to correctly persist line-item pricing from the `QuoteItem` entity.

## EQ3 [RESOLVED — Inferred]
**Resolution:** Use `EnumType.STRING` for `operationMode` and `repeatFrequency` for better readability and persistence safety.
