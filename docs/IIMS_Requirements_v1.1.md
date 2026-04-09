# Ingredient Inventory Management System
## Requirements Specification
**Version 1.2 | April 2026 | Status: DRAFT**

---

## Table of Contents

1. [Overview](#1-overview)
2. [Glossary](#2-glossary)
3. [System Architecture](#3-system-architecture)
4. [Unit Hierarchy Specification](#4-unit-hierarchy-specification)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Error Catalogue](#7-error-catalogue)
8. [Data Flow](#8-data-flow)
9. [Configuration Reference](#9-configuration-reference)
10. [Memory-Mapped File Implementation](#10-memory-mapped-file-implementation)
11. [Spring Boot Integration](#11-spring-boot-integration)
12. [Out of Scope](#12-out-of-scope)
13. [Open Questions](#13-open-questions)

---

## 1. Overview

This document specifies the requirements for an Ingredient Inventory Management System (IIMS) designed for restaurant and food-service operations. The system maintains a real-time, memory-mapped store of ingredient quantities, expressed in their canonical base unit — the smallest unit **actually used** for that ingredient across both the on-hand stock table (T1) and the recipe consumption table (T2). It accepts on-hand stock data and recipe-consumption data, resolves unit mismatches automatically, quantizes floating-point quantities into the appropriate fixed-width integer representation, and exposes a thread-safe API for atomic deduction operations.

Key capabilities addressed by this specification:

- Automatic unit-hierarchy resolution driven by the smallest unit observed in T1 and T2 (not the smallest unit in the registry), e.g. tonne → kg → g for dry goods if `mg` is never referenced.
- Float-to-integer quantization with type selection (`short` / `int` / `long`) based on the range of scaled values.
- Memory-mapped fixed-size integer arrays for O(1) indexed access with persistence across process restarts.
- Thread-safe, atomic batch deduction with full rollback if any ingredient quantity would go negative.
- SIMD-accelerated pre-flight negative check using the Java Vector API for high-throughput order processing.

---

## 2. Glossary

| Term | Definition |
|------|------------|
| **Base Unit** | The smallest unit **actually referenced** in T1 or T2 for a given ingredient (e.g. `g` if no row ever uses `mg`). Not necessarily the smallest unit in the registered hierarchy. |
| **Canonical Quantity** | An ingredient quantity expressed in its resolved base unit as a whole integer, after unit conversion and quantization. |
| **Quantization** | The process of converting a floating-point measurement to a fixed-width integer by multiplying by a scale factor (10^n) and rounding. |
| **Scale Factor** | The power-of-ten multiplier applied to float values before integer storage, determined automatically from the decimal precision of input data. |
| **MappedIntArray / MappedLongArray** | A memory-mapped file-backed fixed-size integer array supporting atomic batch updates with rollback. |
| **Negative Mask** | A compact bitmask (`long[]`) where each set bit indicates an ingredient index that would go negative under a proposed deduction. |
| **Ingredient Table (T1)** | Input table of current on-hand stock: ingredient ID, quantity, and unit. |
| **Recipe Table (T2)** | Input table of recipe consumption amounts: ingredient ID, required quantity, and unit. A single ingredient ID may appear in multiple T2 rows with different units. |
| **Unit Hierarchy** | A directed graph of measurement units, each with a conversion factor to its parent and to the hierarchy root. |
| **Batch Deduction** | Applying multiple ingredient subtractions atomically — all succeed or all roll back. |
| **Re-quantization** | The process of rescaling and rewriting a stored ingredient value when a finer base unit is discovered in a new T2 row after initial ingestion. |

---

## 3. System Architecture

The system is composed of the following layers:

### 3.1 Input Layer

Accepts two tables as input. Both may originate from a database, CSV, REST API, or in-process data structures.

**Table T1 — On-hand stock:**

| Column | Type | Description |
|--------|------|-------------|
| `ingredient_id` | String | Unique identifier for the ingredient (e.g. `"sugar"`, `"beer_lager"`). |
| `quantity` | float | Current quantity on hand. |
| `unit` | String | Unit of the quantity (e.g. `"tonne"`, `"case"`, `"kg"`). |

**Table T2 — Recipe consumption:**

| Column | Type | Description |
|--------|------|-------------|
| `ingredient_id` | String | Must match an entry in T1. |
| `required_quantity` | float | Amount consumed per recipe unit. |
| `unit` | String | Unit of the required quantity. May differ from T1 and may differ across multiple T2 rows for the same ingredient. |

> **Note:** T2 may contain multiple rows with the same `ingredient_id` but different units (e.g. one recipe uses `kg`, another uses `g`). The unit resolution engine handles this by scanning all rows and selecting the finest unit actually used.

---

### 3.2 Unit Resolution Engine

Responsible for determining the base unit for each ingredient and converting all quantities to that unit before quantization and storage. The engine maintains a **unit registry** — a directed graph where each node is a unit and each edge carries a multiplication factor to reach the hierarchy root.

**Base unit selection rule (revised):**

> The base unit for an ingredient is the unit with the **smallest conversion factor** among all units actually referenced for that ingredient across T1 and T2 — not the smallest unit in the registry.

This ensures the system does not over-quantize (e.g. storing in `mg` when the finest reference is `g`) which would unnecessarily inflate stored values and force wider integer types.

**Design rules:**

- The system scans all T1 and T2 rows for each `ingredient_id`, collects every distinct unit referenced, and selects the one with the smallest factor-to-hierarchy-root value.
- All T1 and T2 values are converted to the resolved base unit before any further processing.
- Conversion is lossless at float precision; rounding to integer occurs only during quantization.
- If an unrecognised unit is encountered, the system throws `UnknownUnitException`.
- If T1 and T2 reference units from incompatible hierarchy branches (e.g. mass vs. volume for the same ingredient), the system throws `UnitCategoryMismatchException`.

**Algorithm:**

```
function resolveBaseUnit(ingredientId, T1, T2, unitRegistry):

    // 1. collect every unit used for this ingredient across both tables
    usedUnits = {}
    for each row in T1 where ingredient_id == ingredientId:
        usedUnits.add(row.unit)
    for each row in T2 where ingredient_id == ingredientId:
        usedUnits.add(row.unit)

    // 2. resolve each used unit to its absolute factor
    candidates = []
    for each unit in usedUnits:
        factor = unitRegistry.factorToAbsoluteBase(unit)  // e.g. mg=1, g=1000, kg=1e6
        candidates.add({ unit, factor })

    // 3. smallest factor = finest granularity actually used
    baseUnit = candidates.min(by: factor)

    return baseUnit.unit
```

**Complexity:** O(R) where R = number of T1 + T2 rows for the ingredient — single pass per ingredient.

**Examples:**

*Sugar — T1 has `tonne`, T2 has `kg` and `g`:*

| Source | Unit | Factor (mg) |
|--------|------|-------------|
| T1 | `tonne` | 1,000,000,000 |
| T2 recipe A | `kg` | 1,000,000 |
| T2 recipe B | `g` | 1,000 |

Resolved base unit → **`g`** (factor 1,000). `mg` is registered but never referenced — ignored.

*Beer — T1 has `case_24_330`, T2 has `bottle_330` and `pint`:*

| Source | Unit | Factor (mL) |
|--------|------|-------------|
| T1 | `case_24_330` | 7,920 |
| T2 recipe A | `bottle_330` | 330 |
| T2 recipe B | `pint` | 568 |

Resolved base unit → **`bottle_330`** (factor 330). `mL` is registered but never referenced — ignored.

---

### 3.3 Quantization Engine

Converts `float[]` base-unit quantities to `integer[]` for storage. For each ingredient:

1. Scan all values for maximum absolute value and finest decimal precision (up to a configurable cap, default 6 decimal places).
2. Compute `scaleFactor = 10^(maxDecimalPlaces)`.
3. Compute `scaledMax = maxAbsValue * scaleFactor`.
4. Select the narrowest integer type that can hold `scaledMax`:
   - `SHORT` if scaledMax ≤ 32,767
   - `INT` if scaledMax ≤ 2,147,483,647
   - `LONG` if scaledMax ≤ 9,223,372,036,854,775,807
5. Store each value as `Math.round(floatValue * scaleFactor)`.

The `scaleFactor` and `targetType` are persisted in metadata so deduction inputs can be scaled identically.

---

### 3.4 Memory-Mapped Store

Each ingredient is assigned a fixed slot index in a memory-mapped integer (or long) array, backed by a file on disk and mapped directly into the JVM process address space via `java.nio.MappedByteBuffer`.

**Store metadata (persisted in a companion JSON file):**

| Field | Type | Description |
|-------|------|-------------|
| `capacity` | int | Fixed number of ingredient slots (e.g. 500). |
| `scaleFactor` | double | The 10^n multiplier used during quantization. |
| `targetType` | enum | `SHORT`, `INT`, or `LONG` — determines which `MappedXxxArray` is used. |
| `baseUnit` | String[] | The resolved base unit string for each slot index. |
| `ingredientId` | String[] | The ingredient ID mapped to each slot index. |

---

### 3.5 Thread-Safe Deduction API

All mutating operations acquire an exclusive `ReentrantLock` before touching the buffer.

| Method | Description |
|--------|-------------|
| `deduct(int[] indices, float[] amounts, String[] units)` | Convert amounts to base units, scale, then atomically subtract. Throws `InsufficientStockException` and rolls back if any slot would go negative. |
| `preCheck(int[] indices, float[] amounts, String[] units) : int[]` | Returns indices that would go negative — zero-allocation hot path using SIMD negative mask + bitmask drain. Does not modify the store. |
| `restock(int index, float amount, String unit)` | Add stock to a single slot. Always safe. |
| `getQuantity(int index) : long` | Read the raw stored value at a slot. |
| `getQuantityInUnit(int index, String unit) : float` | Read and convert back to a requested unit. |
| `snapshot() : long[]` | Return a point-in-time copy of the entire array under lock. |

---

## 4. Unit Hierarchy Specification

The system ships with the following built-in unit hierarchies. Custom hierarchies can be registered at startup via JSON.

### 4.1 Dry / Solid Goods — Base unit: `mg`

| Unit | Symbol | Factor to base (mg) |
|------|--------|---------------------|
| milligram | `mg` | 1 |
| gram | `g` | 1,000 |
| kilogram | `kg` | 1,000,000 |
| tonne | `t` | 1,000,000,000 |
| ounce | `oz` | 28,349.5 |
| pound | `lb` | 453,592 |
| US ton | `ton` | 907,184,740 |

### 4.2 Liquid Goods — Base unit: `mL`

| Unit | Symbol | Factor to base (mL) |
|------|--------|---------------------|
| millilitre | `mL` | 1 |
| centilitre | `cL` | 10 |
| decilitre | `dL` | 100 |
| litre | `L` | 1,000 |
| kilolitre | `kL` | 1,000,000 |
| fluid ounce (US) | `fl oz` | 29.5735 |
| pint (US) | `pt` | 473.176 |
| pint (UK) | `pt_uk` | 568.261 |
| quart (US) | `qt` | 946.353 |
| gallon (US) | `gal` | 3,785.41 |

### 4.3 Beverage Packaging — Base unit: `mL`

Beverages are ultimately liquid volume. Packaging units are convenience aliases.

| Unit | Symbol | Factor to base (mL) | Notes |
|------|--------|---------------------|-------|
| millilitre | `mL` | 1 | |
| bottle 330 mL | `bottle_330` | 330 | Standard lager bottle |
| bottle 500 mL | `bottle_500` | 500 | Pint bottle |
| pint draught | `pint` | 568 | UK imperial pint |
| can 330 mL | `can_330` | 330 | |
| can 440 mL | `can_440` | 440 | |
| 6-pack 330 mL | `sixpack_330` | 1,980 | 6 × 330 mL |
| case 24×330 mL | `case_24_330` | 7,920 | Standard case |
| case 12×500 mL | `case_12_500` | 6,000 | |
| keg 30 L | `keg_30` | 30,000 | Half barrel |
| keg 50 L | `keg_50` | 50,000 | Full barrel |

> Operators must be able to define custom bottle/can/case sizes at startup. Custom units are stored in the unit registry and serialised to disk.

### 4.4 Count-Based Items — Base unit: `ea`

| Unit | Symbol | Factor to base |
|------|--------|----------------|
| each | `ea` | 1 |
| half-dozen | `halfdoz` | 6 |
| dozen | `doz` | 12 |
| gross | `gross` | 144 |

---

## 5. Functional Requirements

### FR-01: Ingest On-Hand Stock (T1)

- The system SHALL accept T1 as an ordered collection of `(ingredient_id, quantity: float, unit: String)` records.
- For each record the system SHALL: resolve the unit to the ingredient's base unit, apply the scale factor, round to the nearest integer, and write the result to the ingredient's assigned slot in the memory-mapped store.
- If an `ingredient_id` in T1 has no slot assigned, the system SHALL allocate the next available slot and record the mapping in metadata.
- If capacity is exhausted, the system SHALL throw `CapacityExceededException`.

### FR-02: Ingest Recipe Consumption (T2)

- The system SHALL accept T2 as an ordered collection of `(ingredient_id, required_quantity: float, unit: String)` records.
- A single `ingredient_id` MAY appear in multiple T2 rows with **different units**. All such rows are valid inputs; the unit resolution engine handles them transparently.
- The system SHALL convert each T2 record's quantity to the same base unit and scale factor used for T1 before any comparison or deduction.

### FR-03: Unit Auto-Resolution *(revised)*

- The system SHALL determine the base unit for each ingredient by scanning **all T1 and T2 rows** for that `ingredient_id` and selecting the unit with the **smallest conversion factor among those actually used** — not the smallest unit in the registered hierarchy.
- If an unrecognised unit is encountered, the system SHALL throw `UnknownUnitException` with the offending unit string and ingredient ID.
- If T1 and T2 reference units from incompatible hierarchy branches (e.g. mass vs. volume) for the same ingredient, the system SHALL throw `UnitCategoryMismatchException`.
- The system SHALL support registering custom units with an explicit factor-to-base-unit value at startup.
- The resolved base unit SHALL be persisted in the companion metadata file and reused for all future operations without re-scanning T1/T2.

**Edge cases:**

| Case | Behaviour |
|------|-----------|
| EC-01: New T2 row arrives with a finer unit than stored base unit | Re-resolve base unit, re-quantize all stored values for that ingredient, re-select integer type, rewrite slot and metadata. Direction is always toward finer granularity — coarser new units never change the base unit. |
| EC-02: T1 and T2 use incompatible unit categories (e.g. mass vs. volume) | Throw `UnitCategoryMismatchException`. |
| EC-03: Only one unit ever used (T2 has no rows yet) | Base unit = the single T1 unit. Re-evaluated when T2 rows arrive per EC-01. |
| EC-04: All T2 units are coarser than T1 | Base unit = T1 unit (finer). T2 values are multiplied up before storage. No re-quantization needed. |

### FR-04: Quantization

- The system SHALL scan all float values for an ingredient to determine (a) the maximum absolute value and (b) the maximum number of significant decimal places up to the configured cap (default 6).
- The system SHALL select the narrowest integer type (`SHORT`, `INT`, `LONG`) that can hold `maxAbsValue * scaleFactor` without overflow.
- The system SHALL persist `scaleFactor` and `targetType` per ingredient in metadata.
- The system SHALL throw `QuantizationOverflowException` if even `LONG` overflows.

### FR-05: Atomic Batch Deduction

- The system SHALL implement `deduct(indices[], amounts[], units[])`.
- The operation SHALL be atomic: either all subtractions are applied, or none (full rollback on failure).
- The operation SHALL be thread-safe: a `ReentrantLock` SHALL be held for the entire two-phase commit.
- **Phase 1 (validate):** For each `(index, amount, unit)`, convert to canonical units, compute `newValue = storedValue - scaledAmount`. If any `newValue < 0`, throw `InsufficientStockException` before writing anything.
- **Phase 2 (commit):** Write all new values to the buffer. Call `buffer.force()`.
- `InsufficientStockException` SHALL carry: ingredient ID, slot index, current stored quantity (in base units), and requested deduction amount (in base units).

### FR-06: Pre-flight Negative Check (SIMD)

- The system SHALL expose `preCheck()` returning `int[]` of ingredient indices that would go negative — without modifying the store.
- **Aligned path (index-aligned delta array, length == capacity):** Load store values from `MappedByteBuffer` into `IntVector`/`LongVector` chunks, subtract the delta vector, extract sign bits via `VectorMask`, pack into a `long[]` bitmask, drain into `int[]` in a single pass using a caller-provided scratch buffer (zero allocation in the hot path).
- **Sparse path (index-delta pairs):** Fall back to scalar loop.

### FR-07: Restock

- The system SHALL provide `restock(index, amount, unit)` that adds stock to a slot.
- Restock SHALL be thread-safe and SHALL NOT require a pre-flight check.

### FR-08: Persistence

- The store SHALL be backed by a file on disk and SHALL reload from that file on JVM restart without re-ingesting T1.
- The system SHALL validate a magic number on file open; if invalid it SHALL throw `CorruptStoreException`.
- Metadata (ingredient-ID-to-slot mapping, scale factors, resolved base units) SHALL be serialised to a companion JSON file.
- If EC-01 (re-quantization) occurs, both the binary store file and the metadata JSON SHALL be updated atomically.

### FR-09: Snapshot and Read

- The system SHALL provide `snapshot() : long[]` returning a point-in-time copy of all slot values under lock.
- The system SHALL provide `getQuantityInUnit(index, unit) : float` that reads a slot, reverses quantization, and converts from the stored base unit to the requested unit.

---

## 6. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Performance | `preCheck()` on 500 ingredients SHALL complete in under 50 microseconds on a modern x86-64 CPU with AVX2 support. |
| NFR-02 | Performance | `deduct()` on a 500-element batch SHALL complete in under 200 microseconds under a single thread. |
| NFR-03 | Concurrency | The store SHALL support at least 32 concurrent threads without deadlock or data corruption. |
| NFR-04 | Precision | Unit conversion SHALL preserve at least 6 significant decimal places before quantization. |
| NFR-05 | Durability | All committed writes SHALL be flushed to the OS page cache via `buffer.force()` before the lock is released. |
| NFR-06 | Portability | The system SHALL run on Java 17+ with `--add-modules jdk.incubator.vector` for SIMD support. |
| NFR-07 | Capacity | The default store size is 500 ingredient slots. This SHALL be configurable at construction time. |
| NFR-08 | Recoverability | A corrupted or incomplete write SHALL be detectable via the magic number check; the system SHALL not silently serve corrupted data. |

---

## 7. Error Catalogue

| Exception | Trigger | Recovery |
|-----------|---------|----------|
| `InsufficientStockException` | `deduct()` would set any slot below zero. | Full rollback — store unchanged. Caller receives affected index + quantities. |
| `UnknownUnitException` | A unit string is not in the registry. | Operation aborted. Caller must register the unit or correct the input. |
| `UnitCategoryMismatchException` | T1 and T2 use incompatible unit categories (e.g. mass vs. volume) for the same ingredient. | Operation aborted. Operator must correct the input schema. |
| `QuantizationOverflowException` | `scaledMax` exceeds `Long.MAX_VALUE`. | Operator must reduce the scale factor cap or split the ingredient. |
| `CapacityExceededException` | All 500 slots are allocated and a new ingredient arrives. | Operator must create a larger store and migrate. |
| `CorruptStoreException` | Magic number mismatch on file open. | Restore from backup or re-ingest T1. |
| `IndexOutOfBoundsException` | Caller passes an index outside `[0, capacity)`. | Programming error — fix call site. |

---

## 8. Data Flow

The end-to-end flow for a recipe order deduction:

1. Receive order: list of `(ingredient_id, required_quantity, unit)` from T2.
2. Resolve indices: look up each `ingredient_id` in metadata to get `slot index[]`.
3. Convert units: for each entry, convert `required_quantity` from input unit to the ingredient's stored base unit using the unit hierarchy.
4. Scale: multiply each base-unit float by the ingredient's stored `scaleFactor`. Round to `long`.
5. Pre-flight check: call `preCheck(indices, scaledAmounts)`. If result is non-empty, abort and return the list of insufficient ingredients to the caller.
6. Deduct: call `deduct(indices, scaledAmounts)`. Acquires the lock, re-validates (guard against TOCTOU), applies all writes, forces the buffer, releases the lock.
7. Return: success or `InsufficientStockException` to the order management layer.

---

## 9. Configuration Reference

### 9.1 File Location and Naming Policy

File location and naming are **fully configurable**. The system does not enforce any fixed path or filename. The operator chooses a strategy at startup by supplying the relevant properties; the system honours that choice and never overrides it.

**Naming strategies:**

| Strategy | Description | Example result |
|----------|-------------|----------------|
| Fully explicit | Operator supplies the exact path for both files. | `store.filePath=/data/iims/inventory.dat` |
| Directory + auto-name | Operator supplies a base directory; the system derives filenames from `store.name`. | `store.dir=/data/iims`, `store.name=main` → `/data/iims/main.dat` + `/data/iims/main-meta.json` |
| System-controlled default | Neither path nor directory is set; the system writes to the JVM working directory using the default names. | `./inventory.dat` + `./inventory-meta.json` |

**Priority rule:** `store.filePath` / `store.metaPath` take precedence over `store.dir` + `store.name`. If none are set, the system falls back to the working directory with default names.

**Rationale for full configurability:**

- Production deployments typically place binary stores on a dedicated fast-storage volume (e.g. `/mnt/nvme/iims/`) separate from application logs and config.
- Container environments (Docker / Kubernetes) map volumes at well-known paths that differ between environments.
- Multi-tenant deployments (one store per restaurant) need programmatically generated paths such as `/data/stores/{tenantId}/inventory.dat`.
- Operators should never need to recompile or patch the binary to change a file path.

### 9.2 All Configuration Properties

| Property | Default | Description |
|----------|---------|-------------|
| `iims.store.name` | `inventory` | Logical store name. Used to derive filenames when explicit paths are not set. |
| `iims.store.dir` | *(working dir)* | Base directory for store files when explicit paths are not set. |
| `iims.store.filePath` | *(derived)* | Absolute or relative path to the binary store file. Overrides `store.dir` + `store.name`. |
| `iims.store.metaPath` | *(derived)* | Absolute or relative path to the companion metadata JSON file. Overrides `store.dir` + `store.name`. |
| `iims.store.capacity` | `500` | Number of ingredient slots in the memory-mapped array. |
| `iims.quantizer.maxDecimalPlaces` | `6` | Cap on decimal-place detection during quantization. |
| `iims.units.customRegistryPath` | *(none)* | Optional path to a JSON file of custom unit definitions. |
| `iims.simd.enabled` | `true` | Enable Java Vector API SIMD path for `preCheck()`. |
| `iims.simd.species` | `PREFERRED` | Vector species: `PREFERRED`, `128`, `256`, or `512` (bit width). |
| `iims.lock.fairness` | `false` | Whether the `ReentrantLock` uses fair ordering. |

---

## 10. Memory-Mapped File Implementation

This section specifies the exact binary layout and Java construction pattern for each of the three store types. All three share the same header format and differ only in the number of bytes per slot and the `MappedByteBuffer` read/write methods used.

### 10.1 File Layout (all types)

```
Offset 0                    Offset 16
┌──────────┬──────────┬──────────┬──────────┬─────────────────────────────┐
│  magic   │ capacity │   size   │ slot_bytes│         DATA REGION         │
│ 4 bytes  │ 4 bytes  │ 4 bytes  │  4 bytes  │  capacity × slot_bytes      │
└──────────┴──────────┴──────────┴──────────┴─────────────────────────────┘
```

| Header field | Offset | Size | Value |
|---|---|---|---|
| Magic number | 0 | 4 bytes | `0xDEADBEEF` — integrity check |
| Capacity | 4 | 4 bytes | Max number of slots |
| Size | 8 | 4 bytes | Currently occupied slots |
| Slot bytes | 12 | 4 bytes | Bytes per slot: 2 (short), 4 (int), 8 (long) |

The data region starts at byte offset 16. Slot `i` starts at offset `16 + i * slotBytes`.

### 10.2 MappedShortArray

Each slot holds one 16-bit signed integer (`short`). Capacity 500 → file size = 16 + 500 × 2 = **1,016 bytes**.

```java
public class MappedShortArray implements AutoCloseable {

    private static final int MAGIC       = 0xDEADBEEF;
    private static final int HEADER_SIZE = 16;
    private static final int SLOT_BYTES  = Short.BYTES;   // 2

    private final int              capacity;
    private final MappedByteBuffer buffer;
    private final RandomAccessFile raf;
    private final FileChannel      channel;
    private final ReentrantLock    lock = new ReentrantLock();

    public MappedShortArray(String filePath, int capacity) throws IOException {
        this.capacity = capacity;
        long fileSize = (long) HEADER_SIZE + (long) capacity * SLOT_BYTES;

        raf     = new RandomAccessFile(filePath, "rw");
        channel = raf.getChannel();

        boolean isNew = raf.length() == 0;
        if (isNew) raf.setLength(fileSize);

        buffer = channel.map(FileChannel.MapMode.READ_WRITE, 0, fileSize);
        buffer.order(ByteOrder.nativeOrder());

        if (isNew) {
            buffer.putInt(0,  MAGIC);
            buffer.putInt(4,  capacity);
            buffer.putInt(8,  0);
            buffer.putInt(12, SLOT_BYTES);
            buffer.force();
        } else {
            if (buffer.getInt(0) != MAGIC)
                throw new IOException("Bad magic — file corrupt");
        }
    }

    private int offset(int index) { return HEADER_SIZE + index * SLOT_BYTES; }

    public short get(int index) {
        lock.lock();
        try   { return buffer.getShort(offset(index)); }
        finally { lock.unlock(); }
    }

    /** Atomic batch update — rolls back if any result < 0. */
    public void update(int[][] updates) throws NegativeValueException {
        lock.lock();
        try {
            short[] next = new short[updates.length];
            for (int i = 0; i < updates.length; i++) {
                short cur    = buffer.getShort(offset(updates[i][0]));
                short result = (short)(cur + updates[i][1]);
                if (result < 0) throw new NegativeValueException(updates[i][0], result);
                next[i] = result;
            }
            for (int i = 0; i < updates.length; i++)
                buffer.putShort(offset(updates[i][0]), next[i]);
            buffer.force();
        } finally { lock.unlock(); }
    }

    @Override public void close() throws IOException {
        lock.lock();
        try { buffer.force(); channel.close(); raf.close(); }
        finally { lock.unlock(); }
    }
}
```

**Range:** −32,768 to 32,767. Suitable for ingredients whose scaled value stays below 32,767 (e.g. a restaurant that stocks at most 327 kg of sugar stored in units of 10 g).

---

### 10.3 MappedIntArray

Each slot holds one 32-bit signed integer (`int`). Capacity 500 → file size = 16 + 500 × 4 = **2,016 bytes**.

```java
public class MappedIntArray implements AutoCloseable {

    private static final int MAGIC       = 0xDEADBEEF;
    private static final int HEADER_SIZE = 16;
    private static final int SLOT_BYTES  = Integer.BYTES;  // 4

    private final int              capacity;
    private final MappedByteBuffer buffer;
    private final RandomAccessFile raf;
    private final FileChannel      channel;
    private final ReentrantLock    lock = new ReentrantLock();

    public MappedIntArray(String filePath, int capacity) throws IOException {
        this.capacity = capacity;
        long fileSize = (long) HEADER_SIZE + (long) capacity * SLOT_BYTES;

        raf     = new RandomAccessFile(filePath, "rw");
        channel = raf.getChannel();

        boolean isNew = raf.length() == 0;
        if (isNew) raf.setLength(fileSize);

        buffer = channel.map(FileChannel.MapMode.READ_WRITE, 0, fileSize);
        buffer.order(ByteOrder.nativeOrder());

        if (isNew) {
            buffer.putInt(0,  MAGIC);
            buffer.putInt(4,  capacity);
            buffer.putInt(8,  0);
            buffer.putInt(12, SLOT_BYTES);
            buffer.force();
        } else {
            if (buffer.getInt(0) != MAGIC)
                throw new IOException("Bad magic — file corrupt");
        }
    }

    private int offset(int index) { return HEADER_SIZE + index * SLOT_BYTES; }

    public int get(int index) {
        lock.lock();
        try   { return buffer.getInt(offset(index)); }
        finally { lock.unlock(); }
    }

    /** Atomic batch update — rolls back if any result < 0. */
    public void update(int[][] updates) throws NegativeValueException {
        lock.lock();
        try {
            int[] next = new int[updates.length];
            for (int i = 0; i < updates.length; i++) {
                int result = buffer.getInt(offset(updates[i][0])) + updates[i][1];
                if (result < 0) throw new NegativeValueException(updates[i][0], result);
                next[i] = result;
            }
            for (int i = 0; i < updates.length; i++)
                buffer.putInt(offset(updates[i][0]), next[i]);
            buffer.force();
        } finally { lock.unlock(); }
    }

    /**
     * SIMD-aligned pre-check (index-aligned delta array).
     * Returns long[] bitmask — bit i set means slot i would go negative.
     */
    public long[] preCheckNegativeMaskAligned(int[] deltas) {
        long[] mask = new long[(capacity + 63) / 64];
        lock.lock();
        try {
            int i = 0;
            for (; i < SPECIES.loopBound(capacity); i += SPECIES.length()) {
                IntVector va = IntVector.fromByteBuffer(SPECIES, buffer,
                        HEADER_SIZE + i * SLOT_BYTES, ByteOrder.nativeOrder());
                IntVector vb = IntVector.fromArray(SPECIES, deltas, i);
                VectorMask<Integer> neg = va.add(vb).compare(VectorOperators.LT, 0);
                long bits = neg.toLong();
                int  w    = i >> 6;
                int  bit  = i & 63;
                mask[w] |= bits << bit;
                if (bit + SPECIES.length() > 64)
                    mask[w + 1] |= bits >>> (64 - bit);
            }
            for (; i < capacity; i++) {
                if (buffer.getInt(HEADER_SIZE + i * SLOT_BYTES) + deltas[i] < 0)
                    mask[i >> 6] |= 1L << (i & 63);
            }
        } finally { lock.unlock(); }
        return mask;
    }

    /** Drain bitmask into int[] — single pass, zero allocation (caller owns scratch). */
    public static int negativeIndices(long[] mask, int[] scratch) {
        int pos = 0;
        for (int w = 0; w < mask.length; w++)
            for (long bits = mask[w]; bits != 0; bits &= bits - 1)
                scratch[pos++] = w * 64 + Long.numberOfTrailingZeros(bits);
        return pos;
    }

    private static final VectorSpecies<Integer> SPECIES = IntVector.SPECIES_PREFERRED;

    @Override public void close() throws IOException {
        lock.lock();
        try { buffer.force(); channel.close(); raf.close(); }
        finally { lock.unlock(); }
    }
}
```

**Range:** −2,147,483,648 to 2,147,483,647. Suitable for most restaurant-scale ingredients (e.g. sugar stored in grams: a tonne = 1,000,000 g, well within INT range).

---

### 10.4 MappedLongArray

Each slot holds one 64-bit signed integer (`long`). Capacity 500 → file size = 16 + 500 × 8 = **4,016 bytes**.

```java
public class MappedLongArray implements AutoCloseable {

    private static final int MAGIC       = 0xDEADBEEF;
    private static final int HEADER_SIZE = 16;
    private static final int SLOT_BYTES  = Long.BYTES;    // 8

    private final int              capacity;
    private final MappedByteBuffer buffer;
    private final RandomAccessFile raf;
    private final FileChannel      channel;
    private final ReentrantLock    lock = new ReentrantLock();

    public MappedLongArray(String filePath, int capacity) throws IOException {
        this.capacity = capacity;
        long fileSize = (long) HEADER_SIZE + (long) capacity * SLOT_BYTES;

        raf     = new RandomAccessFile(filePath, "rw");
        channel = raf.getChannel();

        boolean isNew = raf.length() == 0;
        if (isNew) raf.setLength(fileSize);

        buffer = channel.map(FileChannel.MapMode.READ_WRITE, 0, fileSize);
        buffer.order(ByteOrder.nativeOrder());

        if (isNew) {
            buffer.putInt(0,  MAGIC);
            buffer.putInt(4,  capacity);
            buffer.putInt(8,  0);
            buffer.putInt(12, SLOT_BYTES);
            buffer.force();
        } else {
            if (buffer.getInt(0) != MAGIC)
                throw new IOException("Bad magic — file corrupt");
        }
    }

    private int offset(int index) { return HEADER_SIZE + index * SLOT_BYTES; }

    public long get(int index) {
        lock.lock();
        try   { return buffer.getLong(offset(index)); }
        finally { lock.unlock(); }
    }

    /** Atomic batch update — rolls back if any result < 0. */
    public void update(long[][] updates) throws NegativeValueException {
        lock.lock();
        try {
            long[] next = new long[updates.length];
            for (int i = 0; i < updates.length; i++) {
                long result = buffer.getLong(offset((int)updates[i][0])) + updates[i][1];
                if (result < 0) throw new NegativeValueException((int)updates[i][0], result);
                next[i] = result;
            }
            for (int i = 0; i < updates.length; i++)
                buffer.putLong(offset((int)updates[i][0]), next[i]);
            buffer.force();
        } finally { lock.unlock(); }
    }

    @Override public void close() throws IOException {
        lock.lock();
        try { buffer.force(); channel.close(); raf.close(); }
        finally { lock.unlock(); }
    }
}
```

**Range:** up to 9.2 × 10^18. Required for ingredients stored in milligrams at tonne scale (1 tonne = 10^9 mg) or for high-precision financial-style quantities.

---

### 10.5 Type Selection Decision Tree

```
scaledMax = maxAbsValue × scaleFactor

scaledMax ≤ 32,767
    → MappedShortArray  (2 bytes/slot, 1,016 bytes total for 500 slots)

scaledMax ≤ 2,147,483,647
    → MappedIntArray    (4 bytes/slot, 2,016 bytes total for 500 slots)

scaledMax ≤ 9,223,372,036,854,775,807
    → MappedLongArray   (8 bytes/slot, 4,016 bytes total for 500 slots)

else
    → QuantizationOverflowException
```

`FloatQuantizer.analyse()` performs this selection automatically and returns a `ScaleResult` containing `targetType` and `multiplier`. The IIMS uses this result to instantiate the correct array class.

---

## 11. Spring Boot Integration

### 11.1 Overview

The IIMS module is packaged as a self-contained Spring Boot auto-configuration library. Consuming applications add a single dependency; the store is created, configured, and lifecycle-managed automatically by Spring. No boilerplate wiring is required in the application.

### 11.2 Dependency

```xml
<!-- pom.xml -->
<dependency>
    <groupId>com.restaurant</groupId>
    <artifactId>iims-spring-boot-starter</artifactId>
    <version>1.0.0</version>
</dependency>
```

Add the Vector API JVM argument to `spring-boot-maven-plugin` (or your container's `JAVA_OPTS`):

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <jvmArguments>--add-modules jdk.incubator.vector</jvmArguments>
    </configuration>
</plugin>
```

### 11.3 application.yml Configuration

```yaml
iims:
  store:
    # Option A — fully explicit paths (recommended for production)
    filePath: /mnt/nvme/iims/inventory.dat
    metaPath: /mnt/nvme/iims/inventory-meta.json

    # Option B — directory + auto-name (comment out Option A to use)
    # dir: /mnt/nvme/iims
    # name: main          # → main.dat + main-meta.json

    # Option C — neither set → writes to JVM working directory
    #            using inventory.dat + inventory-meta.json

    capacity: 500

  quantizer:
    maxDecimalPlaces: 6

  units:
    customRegistryPath: /etc/iims/custom-units.json   # optional

  simd:
    enabled: true
    species: PREFERRED

  lock:
    fairness: false
```

**Multi-tenant example** — one store per restaurant, paths derived at runtime:

```yaml
iims:
  store:
    dir: /mnt/nvme/iims/${tenant.id}
    name: inventory
    capacity: 500
```

### 11.4 Auto-Configuration Class

```java
@Configuration
@EnableConfigurationProperties(IimsProperties.class)
@ConditionalOnClass(MappedIntArray.class)
public class IimsAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public StorePathResolver storePathResolver(IimsProperties props) {
        // Resolves the three strategies from Section 9.1:
        // 1. explicit filePath/metaPath
        // 2. dir + name
        // 3. working directory fallback
        return new StorePathResolver(props);
    }

    @Bean
    @ConditionalOnMissingBean
    public IngredientStore ingredientStore(IimsProperties props,
                                           StorePathResolver resolver) throws IOException {
        return new IngredientStore(
            resolver.resolveStorePath(),
            resolver.resolveMetaPath(),
            props.getStore().getCapacity(),
            props
        );
        // IngredientStore selects MappedShortArray / MappedIntArray / MappedLongArray
        // based on the quantization result of the first T1 ingestion.
    }

    @Bean
    @ConditionalOnMissingBean
    public IngredientService ingredientService(IngredientStore store,
                                               UnitRegistry unitRegistry) {
        return new IngredientService(store, unitRegistry);
    }

    @Bean
    @ConditionalOnMissingBean
    public UnitRegistry unitRegistry(IimsProperties props) {
        UnitRegistry registry = new UnitRegistry();
        registry.registerBuiltins();
        if (props.getUnits().getCustomRegistryPath() != null)
            registry.loadFromJson(props.getUnits().getCustomRegistryPath());
        return registry;
    }
}
```

### 11.5 Properties Binding Class

```java
@ConfigurationProperties(prefix = "iims")
@Data   // Lombok
public class IimsProperties {

    private Store      store      = new Store();
    private Quantizer  quantizer  = new Quantizer();
    private Units      units      = new Units();
    private Simd       simd       = new Simd();
    private Lock       lock       = new Lock();

    @Data public static class Store {
        private String  name      = "inventory";
        private String  dir;          // null → working directory
        private String  filePath;     // null → derived from dir + name
        private String  metaPath;     // null → derived from dir + name
        private int     capacity  = 500;
    }

    @Data public static class Quantizer {
        private int maxDecimalPlaces = 6;
    }

    @Data public static class Units {
        private String customRegistryPath;
    }

    @Data public static class Simd {
        private boolean enabled = true;
        private String  species = "PREFERRED";
    }

    @Data public static class Lock {
        private boolean fairness = false;
    }
}
```

### 11.6 Injecting and Using the Service

```java
@Service
@RequiredArgsConstructor
public class OrderFulfillmentService {

    private final IngredientService ingredientService;

    /**
     * Attempt to fulfil an order — deducts all required ingredients atomically.
     * Returns the list of ingredient IDs that are insufficient, or empty on success.
     */
    public List<String> fulfil(List<OrderLine> lines) {

        String[] ids     = lines.stream().map(OrderLine::ingredientId).toArray(String[]::new);
        float[]  amounts = new float[lines.size()];
        String[] units   = new String[lines.size()];
        for (int i = 0; i < lines.size(); i++) {
            amounts[i] = lines.get(i).quantity();
            units[i]   = lines.get(i).unit();
        }

        // pre-flight check — zero allocation, SIMD-accelerated
        List<String> insufficient = ingredientService.preCheck(ids, amounts, units);
        if (!insufficient.isEmpty()) return insufficient;

        // atomic deduction
        try {
            ingredientService.deduct(ids, amounts, units);
            return List.of();
        } catch (InsufficientStockException e) {
            // TOCTOU guard fired — another thread won the race
            return List.of(e.getIngredientId());
        }
    }
}
```

### 11.7 REST Controller Example

```java
@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final IngredientService      ingredientService;
    private final OrderFulfillmentService fulfillmentService;

    /** Ingest on-hand stock (T1). */
    @PostMapping("/stock")
    public ResponseEntity<Void> ingestStock(@RequestBody List<StockRecord> records) {
        ingredientService.ingestT1(records);
        return ResponseEntity.ok().build();
    }

    /** Query current quantity for one ingredient. */
    @GetMapping("/{ingredientId}")
    public ResponseEntity<QuantityResponse> getQuantity(
            @PathVariable String ingredientId,
            @RequestParam(defaultValue = "base") String unit) {
        float qty = ingredientService.getQuantityInUnit(ingredientId, unit);
        return ResponseEntity.ok(new QuantityResponse(ingredientId, qty, unit));
    }

    /** Pre-flight check for an order without committing. */
    @PostMapping("/check")
    public ResponseEntity<CheckResponse> check(@RequestBody List<OrderLine> lines) {
        List<String> insufficient = fulfillmentService.preCheck(lines);
        return ResponseEntity.ok(new CheckResponse(insufficient.isEmpty(), insufficient));
    }

    /** Deduct ingredients for a fulfilled order. */
    @PostMapping("/deduct")
    public ResponseEntity<DeductResponse> deduct(@RequestBody List<OrderLine> lines) {
        List<String> failed = fulfillmentService.fulfil(lines);
        if (failed.isEmpty())
            return ResponseEntity.ok(new DeductResponse(true, List.of()));
        return ResponseEntity.status(HttpStatus.CONFLICT)
                             .body(new DeductResponse(false, failed));
    }

    /** Restock a single ingredient. */
    @PostMapping("/restock")
    public ResponseEntity<Void> restock(@RequestBody RestockRequest req) {
        ingredientService.restock(req.ingredientId(), req.quantity(), req.unit());
        return ResponseEntity.ok().build();
    }
}
```

### 11.8 Lifecycle Management

`IngredientStore` implements `DisposableBean` so Spring calls `destroy()` on context shutdown, which flushes the buffer and releases the `FileChannel` cleanly:

```java
@Component
public class IngredientStore implements DisposableBean {

    private final MappedIntArray intStore; // or Short/Long depending on quantization

    @Override
    public void destroy() throws Exception {
        intStore.close(); // buffer.force() → channel.close() → raf.close()
    }
}
```

This handles graceful shutdown via `SIGTERM`. It does **not** protect against `SIGKILL` — for that, `buffer.force()` is called after every committed write (FR-05).

### 11.9 Health Indicator

The starter auto-registers a Spring Boot Actuator health indicator accessible at `GET /actuator/health/iims`:

```java
@Component
public class IimsHealthIndicator implements HealthIndicator {

    private final IngredientStore store;

    @Override
    public Health health() {
        try {
            int size     = store.occupiedSlots();
            int capacity = store.capacity();
            return Health.up()
                    .withDetail("occupiedSlots", size)
                    .withDetail("capacity",      capacity)
                    .withDetail("fillPercent",   String.format("%.1f%%", 100.0 * size / capacity))
                    .withDetail("storeFile",     store.filePath())
                    .withDetail("storeType",     store.targetType())   // SHORT / INT / LONG
                    .build();
        } catch (Exception e) {
            return Health.down(e).build();
        }
    }
}
```

---

## 12. Out of Scope

- User interface (this specification covers the storage and computation engine only).
- Multi-node distributed inventory (the store is single-process; distributed coordination is a future concern).
- Ingredient expiry tracking.
- Supplier ordering / purchase-order generation.
- Cost / pricing calculations.
- Authentication and authorisation.

---

## 13. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| OQ-01 | Should the store support resizing (growing capacity) in-place, or require a migration to a new file? | Arch | Open |
| OQ-02 | For beverages with variable bottle sizes (e.g. craft beer in 355 mL vs 500 mL), should the base unit always be `mL`, or should the system support SKU-level overrides? | Domain | Open |
| OQ-03 | What is the maximum acceptable staleness for `snapshot()` reads — should readers also acquire the lock? | Eng | Open |
| OQ-04 | Should `preCheck()` and `deduct()` accept a timeout parameter to avoid indefinite lock contention? | Eng | Open |
| OQ-05 | Does the scale factor need to be updatable after initial ingestion? | Domain | **Resolved — Yes.** EC-01 (FR-03) defines the trigger and procedure. |
| OQ-06 | What is the maximum number of re-quantization events acceptable per ingredient per day? Should re-quantization be deferred and batched (e.g. at the start of each shift) rather than applied inline? | Eng | Open |
| OQ-07 | Should the system warn operators when a newly introduced fine-grained unit would promote the integer type from `INT` to `LONG`, increasing memory footprint? | Domain | Open |

---

*— End of Document —*

- User interface or REST API layer (this specification covers the storage and computation engine only).
- Multi-node distributed inventory (the store is single-process; distributed coordination is a future concern).
- Ingredient expiry tracking.
- Supplier ordering / purchase-order generation.
- Cost / pricing calculations.
- Authentication and authorisation.

---

## 11. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| OQ-01 | Should the store support resizing (growing capacity) in-place, or require a migration to a new file? | Arch | Open |
| OQ-02 | For beverages with variable bottle sizes (e.g. craft beer in 355 mL vs 500 mL), should the base unit always be `mL`, or should the system support SKU-level overrides? | Domain | Open |
| OQ-03 | What is the maximum acceptable staleness for `snapshot()` reads — should readers also acquire the lock? | Eng | Open |
| OQ-04 | Should `preCheck()` and `deduct()` accept a timeout parameter to avoid indefinite lock contention? | Eng | Open |
| OQ-05 | Does the scale factor need to be updatable after initial ingestion? | Domain | **Resolved — Yes.** EC-01 (FR-03) defines the trigger and procedure. |
| OQ-06 | What is the maximum number of re-quantization events acceptable per ingredient per day? Should re-quantization be deferred and batched (e.g. at the start of each shift) rather than applied inline? | Eng | Open |
| OQ-07 | Should the system warn operators when a newly introduced fine-grained unit would promote the integer type from `INT` to `LONG`, increasing memory footprint? | Domain | Open |

---

*— End of Document —*
