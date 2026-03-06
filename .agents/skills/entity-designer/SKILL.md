---
name: entity-designer
description: Identifies all data entities needed for the Shopro POS system by reading all requirements files. Outputs production-grade Java JPA entities in the mls.sho.dms.entity package with full PostgreSQL optimisation (partitioning, partial indexes, JSONB, generated columns, BRIN, GIN, UUID PKs).
---

# Shopro POS — Entity Designer Skill

## Purpose

This skill performs a **5-pass** extraction from all `*_REQUIREMENTS.md` files to produce PostgreSQL-optimised Java entity classes.

---

## Entity Extraction Protocol

### Pass 1 — Noun Extraction
Read every requirements file. Extract every **persistent noun** (things the system creates, stores, queries, or modifies). A noun becomes an entity candidate if it has:
- A lifecycle (created, updated, deleted)
- Attributes (at least 2 unique fields)
- One or more relationships to other nouns

### Pass 2 — Relationship Mapping
For each entity pair, classify the relationship:
- `ONE_TO_MANY` / `MANY_TO_ONE` → FK column on the "many" side
- `MANY_TO_MANY` → join table with its own PK
- `ONE_TO_ONE` → FK with unique constraint

### Pass 3 — PostgreSQL Feature Assignment
For each entity, decide which PG feature applies:
| Pattern | PG Feature |
|---|---|
| Monotonically growing, time-series | Range Partition by month/date |
| Frequently queried by a subset | Partial Index |
| Flexible / sparse metadata | JSONB column + GIN index |
| Computationally derived field | Generated Column |
| High-volume lookup by two columns | Composite B-Tree Index |
| Append-only audit/log data | BRIN Index on timestamp |
| Concurrency-sensitive rows | `@Version` optimistic lock |

### Pass 4 — Index Design
For every entity, document:
1. Primary key type (always UUID v4)
2. Unique constraints
3. Composite indexes (by query pattern from requirements)
4. Partial indexes (filtered to hot subsets)
5. GIN indexes (on JSONB columns)
6. BRIN indexes (on timestamp columns of partitioned tables)

### Pass 5 — Code Generation
Generate Java entity files that follow these standards:
- **Base class:** `BaseEntity` (abstract) with `id (UUID)`, `createdAt`, `updatedAt`, `version`
- **Enums:** Separate `*.java` enum files, `@Enumerated(EnumType.STRING)` in entities
- **Relationships:** Always define the inverse side for bidirectional relations
- **Indexes:** Annotated with `@Table(indexes = {...})` and `@Index`
- **JSONB:** Use `@JdbcTypeCode(SqlTypes.JSON)` (Hibernate 6+) with `@Column(columnDefinition = "jsonb")`
- **Partitioned tables:** Annotate with `@Table` pointing to the parent table; document partition DDL separately
- **Generated columns:** Use `@Generated(GenerationTime.ALWAYS)` + `@Column(insertable = false, updatable = false)`
- **Naming:** `snake_case` for DB columns, `camelCase` for Java fields (`@Column(name = "...")`)
- **Numeric precision:** Use `BigDecimal` for all money and quantity fields; never `double` or `float`
- **Security:** Never store raw PINs; annotate PIN field with a comment noting hashing requirement

---

## Slash Command

Invoked via `/design-entities`.

```
/design-entities [module|all]
```

Examples:
```
/design-entities all        ← full entity generation across all modules
/design-entities inventory  ← only Inventory module entities
```
