---
name: Full-Stack UI + Backend Implementation Skill
description: >
  Implement user stories end-to-end: React 18 + shadcn + Tailwind (dark, responsive, skeleton-loading)
  on the frontend; Java 21 Records + Spring Boot 3 on the backend; comprehensive unit, integration,
  and contract tests at every layer.
tags: >
  ui, react, shadcn, tailwind, dark-mode, responsive, skeleton-loading,
  java21, records, spring-boot, jpa, hibernate, rest, testing, separation-of-concerns
---

# Goal

Given a **user story**, this skill produces a complete, production-grade implementation across:

1. **Backend** — Java 21 + Spring Boot 3 + JPA entities + Records as DTOs + comprehensive tests.
2. **Frontend** — React 18 + shadcn/ui + Tailwind CSS; dark, responsive, skeleton-aware, error-mapped.
3. **Contract** — OpenAPI spec that is the single source of truth between layers.
4. **Tests** — Unit → Service → Integration → Repository → Frontend per layer.

---

# Tech-Stack Assumptions

| Layer | Technology |
|---|---|
| Language | Java 21 (LTS) |
| Framework | Spring Boot 3.3+ |
| Persistence | Spring Data JPA + Hibernate 6 + PostgreSQL |
| Migration | Flyway |
| Validation | Jakarta Validation 3 (`@Valid`, `@NotBlank`, `@DecimalMin`, etc.) |
| Build | Maven 3.9+ (or Gradle 8+) |
| Test — unit | JUnit 5 + Mockito 5 |
| Test — slice | `@DataJpaTest`, `@WebMvcTest` |
| Test — integration | `@SpringBootTest` + Testcontainers (PostgreSQL) |
| API contract | springdoc-openapi 2 |
| Frontend | React 18 + TypeScript 5 + Vite |
| UI primitives | shadcn/ui + Radix UI |
| Styling | Tailwind CSS v3 |
| State | React Query (TanStack Query v5) + Zustand |
| Forms | React Hook Form + Zod |
| HTTP | Axios |

---

# Part A — Backend

## A.1 Project Structure

```
src/
├── main/
│   └── java/mls/sho/dms/
│       ├── entity/          ← JPA @Entity classes (e.g., core, menu, staff)
│       ├── repository/      ← Spring Data JPA repositories
│       ├── application/
│       │   ├── dto/             ← Java 21 Records (request / response)
│       │   ├── service/         ← Business logic interfaces + impls
│       │   ├── mapper/          ← Entity ↔ Record mappers (MapStruct or manual)
│       │   └── exception/       ← Custom exceptions + GlobalExceptionHandler
│       ├── infrastructure/
│       │   ├── config/          ← Spring config (CORS, Security, Jackson, OpenAPI)
│       │   └── persistence/     ← Custom JPQL / Criteria queries if needed
│       └── web/
│           └── controller/      ← @RestController classes
└── test/
    └── java/mls/sho/dms/
        ├── repository/          ← @DataJpaTest slice tests
        ├── application/service/ ← Unit tests (Mockito)
        ├── web/controller/      ← @WebMvcTest slice tests
        └── integration/         ← @SpringBootTest + Testcontainers
```

---

## A.2 Java 21 Entity Design

### Rules for Entities

- Annotate with `@Entity`, `@Table(name = "snake_case_table_name")`.
- Always define `@Id @GeneratedValue(strategy = GenerationType.UUID)` or rely on `BaseEntity`.
- Use `@CreationTimestamp` / `@UpdateTimestamp` from Hibernate for audit fields (if not in `BaseEntity`).
- Use enums for status fields; store as `@Enumerated(EnumType.STRING)`.
- Use `@Column(nullable = false, length = N)` to mirror DB constraints.
- Implement `equals` / `hashCode` on the natural key (not on `id` alone for new entities).
- Keep entities free of business logic; delegate to services.
- Add `@Version` for optimistic locking on frequently updated entities.

---

## A.3 Java 21 Records as DTOs

### Rules for Records

- Use `record` for all request and response DTOs — they are immutable value objects.
- Put Jakarta Validation annotations directly on record components.
- Use `@JsonProperty` only when the field name must differ from the JSON key.
- Name clearly: `CreateMenuItemRequest`, `MenuItemResponse`, `PagedResponse<T>`.
- Never expose entities directly; always map through records.

```java
// application/dto/CreateMenuItemRequest.java
package mls.sho.dms.application.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record CreateMenuItemRequest(

    @NotBlank(message = "Name is required.")
    @Size(max = 60, message = "Name must be 60 characters or fewer.")
    String name,

    @NotNull(message = "Base price is required.")
    @DecimalMin(value = "0.00", message = "Base price must be $0.00 or greater.")
    @Digits(integer = 8, fraction = 2, message = "Price format invalid.")
    BigDecimal basePrice,

    @NotNull(message = "Category is required.")
    java.util.UUID categoryId,

    // optional: null means no photo
    String photoUrl
) {}
```

```java
// application/dto/MenuItemResponse.java
package mls.sho.dms.application.dto;

import java.math.BigDecimal;

public record MenuItemResponse(
    java.util.UUID id,
    String         name,
    BigDecimal     basePrice,
    java.util.UUID categoryId,
    String         categoryName,
    String         status,        // "DRAFT" | "PUBLISHED" | "ARCHIVED"
    String         photoUrl,
    String         createdAt,
    String         updatedAt
) {}
```

```java
// application/dto/DuplicateCheckResponse.java
package mls.sho.dms.application.dto;

public record DuplicateCheckResponse(
    boolean        exists,
    String         categoryName   // populated when exists == true
) {}
```

```java
// application/dto/ValidationErrorResponse.java
package mls.sho.dms.application.dto;

import java.util.List;
import java.util.Map;

// Returned by GlobalExceptionHandler for 422 responses.
public record ValidationErrorResponse(
    int                          status,
    String                       message,
    Map<String, List<String>>    details    // field → list of messages
) {}
```

```java
// application/dto/ApiErrorResponse.java
package mls.sho.dms.application.dto;

// Returned for all other non-2xx responses.
public record ApiErrorResponse(
    int    status,
    String message,
    String timestamp
) {}
```

---

## A.4 Repository Layer

```java
// repository/MenuItemRepository.java
package mls.sho.dms.repository;

import mls.sho.dms.entity.menu.MenuItem;
import mls.sho.dms.entity.menu.MenuCategory;
import mls.sho.dms.entity.menu.MenuItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {

    boolean existsByNameIgnoreCaseAndCategory(String name, MenuCategory category);

    List<MenuItem> findByCategoryAndStatus(MenuCategory category, MenuItemStatus status);

    @Query("SELECT m FROM MenuItem m JOIN FETCH m.category WHERE m.status = :status ORDER BY m.name")
    List<MenuItem> findAllPublishedWithCategory(MenuItemStatus status);

    Optional<MenuItem> findByIdAndStatus(UUID id, MenuItemStatus status);
}
```

---

## A.5 Service Layer

### Interface

```java
// application/service/MenuItemService.java
package mls.sho.dms.application.service;

import mls.sho.dms.application.dto.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface MenuItemService {
    MenuItemResponse         create(CreateMenuItemRequest request, String performedBy);
    MenuItemResponse         findById(UUID id);
    List<MenuItemResponse>   findAll();
    DuplicateCheckResponse   checkDuplicate(String name, UUID categoryId);
    MenuItemResponse         publish(UUID id, String performedBy);
    void                     uploadPhoto(UUID id, MultipartFile file);
}
```

### Implementation

```java
// application/service/impl/MenuItemServiceImpl.java
package mls.sho.dms.application.service.impl;

import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.*;
import mls.sho.dms.application.exception.*;
import mls.sho.dms.application.service.MenuItemService;
import mls.sho.dms.entity.menu.MenuItem;
import mls.sho.dms.entity.menu.MenuCategory;
import mls.sho.dms.entity.menu.MenuItemStatus;
import mls.sho.dms.entity.staff.AuditLog;
import mls.sho.dms.repository.MenuItemRepository;
import mls.sho.dms.repository.MenuCategoryRepository;
import mls.sho.dms.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class MenuItemServiceImpl implements MenuItemService {

    private static final long MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png");

    private final MenuItemRepository     menuItemRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final AuditLogRepository     auditLogRepository;
    private final MenuItemMapper         mapper;
    private final PhotoStorageService    photoStorageService;  // abstraction over S3/local

    @Override
    public MenuItemResponse create(CreateMenuItemRequest request, String performedBy) {
        // Business logic inside the service
        // Throw resource not found or duplicate exception
        // Output audit log using `auditLogRepository`
        // ...
        return null;
    }
    
    // implement remaining methods...
}
```

---

## A.6 Controller Layer

```java
// web/controller/MenuItemController.java
package mls.sho.dms.web.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mls.sho.dms.application.dto.*;
import mls.sho.dms.application.service.MenuItemService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/menu-items")
@RequiredArgsConstructor
@Tag(name = "Menu Items", description = "CRUD and lifecycle management for menu items")
public class MenuItemController {

    private final MenuItemService menuItemService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MenuItemResponse create(
        @Valid @RequestBody CreateMenuItemRequest request,
        @AuthenticationPrincipal String username
    ) {
        return menuItemService.create(request, username);
    }

    @GetMapping("/duplicate-check")
    public DuplicateCheckResponse checkDuplicate(
        @RequestParam String name,
        @RequestParam UUID categoryId
    ) {
        return menuItemService.checkDuplicate(name, categoryId);
    }

    // other endpoints...
}
```

---

## A.7 Global Exception Handler

```java
// application/exception/GlobalExceptionHandler.java
package mls.sho.dms.application.exception;

import mls.sho.dms.application.dto.ApiErrorResponse;
import mls.sho.dms.application.dto.ValidationErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final DateTimeFormatter FMT =
        DateTimeFormatter.ISO_INSTANT.withZone(ZoneOffset.UTC);

    // Jakarta Validation failures → 422
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public ValidationErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        Map<String, List<String>> details = ex.getBindingResult()
            .getFieldErrors().stream()
            .collect(Collectors.groupingBy(
                FieldError::getField,
                Collectors.mapping(FieldError::getDefaultMessage, Collectors.toList())
            ));
        return new ValidationErrorResponse(422, "Validation failed.", details);
    }

    // Capture BusinessRuleException, PhotoValidationException, ResourceNotFoundException here.
    // ...
}
```

---

## A.8 Custom Exceptions

```java
// application/exception/ResourceNotFoundException.java
package mls.sho.dms.application.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
}
```

---

# Part B — Testing Strategy

## B.1 Testing Pyramid

```text
                        ┌──────────────┐
                        │  E2E / API   │  ← Testcontainers @SpringBootTest
                        │  Contract    │    (few, slow, high confidence)
                       ┌┴──────────────┴┐
                       │  Integration   │  ← @DataJpaTest repo tests
                      ┌┴────────────────┴┐
                      │  Service Unit    │  ← Mockito, fast, full coverage
                     ┌┴──────────────────┴┐
                     │  Controller Slice  │  ← @WebMvcTest, MockMvc
                    ┌┴────────────────────┴┐
                    │  Frontend Unit/Hook  │  ← Vitest + React Testing Library
                    └──────────────────────┘
```

---

## B.2 Repository Slice Tests (`@DataJpaTest`)

Test using `@DataJpaTest` with Testcontainers.

## B.3 Service Unit Tests (Mockito)

Test business flow, status updates, and audit log generation using Mockito `@InjectMocks` and `@Mock`.

## B.4 Controller Slice Tests (`@WebMvcTest`)

Check `@Valid` mapping to `422`, and correct HTTP response codes.

## B.5 Integration Tests (`@SpringBootTest` + Testcontainers)

Verify the REST API end to end via `TestRestTemplate`.

---

# Part C — Frontend

## C.1 Tech Stack (React)

- **React 18+** with functional components and hooks.
- **shadcn/ui** — Button, Card, Form, Input, Toast, Dialog, Badge, Skeleton.
- **Tailwind CSS v3** — dark-mode by default (`class` strategy).
- **TypeScript 5**.
- **React Query v5** (TanStack) for server-state (loading, error, refetch).
- **React Hook Form + Zod** for form state and validation.
- **Axios** for HTTP; thin `apiClient` wrapper.

---

## C.2 Theme & Design System

Use dark theme tokens for Tailwind. Example base definitions in index.css.
Use the `skeleton-shimmer` animation with gradient.

---

## C.3 Layout Shell

Follow `sticky Header + responsive main + Footer + ErrorToast` pattern.

---

## C.4 Skeleton & Image Components

Handle `loaded`, `error` behaviors tightly with graceful fallback representations.
Build domain-specific skeletons inside `src/components/ui/` or `src/features/...`

---

## C.5 API Layer

`src/lib/api/client.ts` centralizes Axios wrapper, unifying success and mapped error responses (`ApiResult<T>`, `ApiError`).

---

## C.6 Error Context & Toast

Surface all network/HTTP mapping errors across the application properly via toast context.

---

## C.7 Feature Modules

Features live inside `src/features/{feature-name}/`. Includes schema (Zod), hooks (React Query), components (pure logic/forms), and pages (containers).

---

## C.8 Frontend Tests
Use Vitest + React Testing Library for verifying component bindings, Zod forms, and hook interactions via `renderHook`.

---

# Part D — Separation of Concerns Summary

| Concern | Location | Rule |
|---|---|---|
| DB schema | `db/migration/*.sql` | Flyway only. No schema.create in prod. |
| JPA entities | `mls/sho/dms/entity/` | State + relationships only. Zero business logic. |
| Records (DTOs) | `mls/sho/dms/application/dto/` | Immutable request/response objects. Validation annotations here. |
| Business logic | `mls/sho/dms/application/service/impl/` | All rules live here. Call repo, not controller. |
| HTTP plumbing | `mls/sho/dms/web/controller/` | Thin. `@Valid`, delegate to service, return DTO. |
| Error mapping | `mls/sho/dms/application/exception/` | One place. Returns `ApiErrorResponse` / `ValidationErrorResponse`. |
| Frontend API | `src/lib/api/` | Typed wrappers. Returns `ApiResult<T>`. No UI logic. |
| Frontend state | `src/features/*/hooks/` | React Query + custom hooks. No fetch calls in components. |
| Frontend UI | `src/features/*/components/` | Props + callbacks only. No `fetch`/`axios` calls. |
| Validation | Both layers | Zod (client, instant) + Jakarta Validation (server, authoritative). |
| Audit | `AuditLog` entity + service writes | All audit writes happen inside service transactions. |

---

# Part E — Output Format (per user story)

Return all of these sections:

1. **Entities** — Annotated Java 21 JPA classes with all fields, constraints, and relationships.
2. **Records (DTOs)** — Request + Response records with Jakarta Validation annotations.
3. **Repository** — Spring Data JPA interface with custom query methods.
4. **Service** — Interface + `Impl` class; business rules clearly commented.
5. **Controller** — `@RestController` with correct HTTP verbs, status codes, and `@Valid`.
6. **Exception Handler** — `@RestControllerAdvice` mapping all relevant exceptions.
7. **Flyway Migration** — SQL creating tables, constraints, and indexes.
8. **Tests**:
   - `@DataJpaTest` — repository correctness.
   - Mockito unit — service rule coverage.
   - `@WebMvcTest` — HTTP contract + validation rejection.
   - `@SpringBootTest` + Testcontainers — end-to-end happy + sad paths.
9. **Frontend Theme** — `tokens.ts`, `tailwind.config.js`, `index.css`.
10. **Frontend Layout** — `Layout.tsx`, `Header.tsx`, `Footer.tsx`.
11. **Frontend Skeletons** — `Skeleton.tsx`, `ImageWithSkeleton.tsx`, domain skeleton.
12. **Frontend API** — `client.ts` + feature API module.
13. **Frontend Feature** — Zod schema, hook, pure form UI, container page.
14. **Frontend Tests** — RTL component tests + hook tests via `renderHook`.
