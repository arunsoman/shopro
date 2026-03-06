---
description: Reads all Shopro POS requirements files and generates PostgreSQL-optimised Java JPA entity classes in the mls.sho.dms.entity package.
---

# /design-entities Workflow

1. Read the skill file at `/home/arun/IdeaProjects/shopro-pos/.agents/skills/entity-designer/SKILL.md`.
2. Read all `*_REQUIREMENTS.md` files in `/home/arun/IdeaProjects/shopro-pos/`.
3. Run all 5 passes (Noun Extraction → Relationship Mapping → PG Feature Assignment → Index Design → Code Generation).
4. Output all entity files to `src/main/java/mls/sho/dms/entity/` grouped into sub-packages:
   - `core/` — BaseEntity, enums
   - `staff/` — StaffMember, POSTerminal, AuditLog
   - `menu/` — MenuCategory, MenuItem, ModifierGroup, ModifierOption, MenuItemModifierGroup
   - `floor/` — Section, TableShape, Reservation, WaitlistEntry
   - `order/` — OrderTicket, OrderItem, OrderItemModifier, Payment
   - `kds/` — KDSStation, KDSRoutingRule, KDSTicket, KDSTicketItem
   - `inventory/` — RawIngredient, Supplier, Recipe, RecipeIngredient, InventoryTransaction, PurchaseOrder, PurchaseOrderLine, PhysicalCount, PhysicalCountLine
   - `tableside/` — TablesideSession, GuestCart, GuestCartItem
   - `analytics/` — DailySalesSnapshot, AIInsight, EODRecord
5. After generating, offer to produce a Liquibase/Flyway migration script.
