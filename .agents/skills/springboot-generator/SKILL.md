---
name: springboot-generator
description: >
  Generates a complete, production-ready Spring Boot backend from React frontend code that contains
  hardcoded mock data. Use this skill whenever a user wants to replace mock/hardcoded data in their
  React app with real APIs, build a backend for an existing React frontend, generate Spring Boot
  controllers/services/repositories from React state shapes, or scaffold JPA entities from UI data
  structures. Trigger on phrases like "generate backend", "create APIs from my React code",
  "replace mock data with real APIs", "Spring Boot from React", "scaffold JPA entities", or
  "build backend for my frontend". Always use this skill for Spring Boot + React backend generation
  tasks — do not attempt this freehand.
---

# Spring Boot Backend Generator

Generates production-ready Spring Boot Java files from React frontend code with hardcoded mock data,
plus a complete React API utility layer that replaces every raw `fetch()` call.

**Stack:** Spring Boot 3.x · PostgreSQL · JPA/Hibernate · JWT Auth · DTOs · Layered Architecture ·
Gzip Compression (bidirectional) · Swagger/OpenAPI · React `apiClient` + hooks (TypeScript)

---

## What this skill produces

Given React components with hardcoded data arrays, this skill outputs:

**Java (Spring Boot)**
```
src/main/java/{basePackage}/
├── config/
│   ├── SecurityConfig.java          ← JWT filter chain + CORS + public endpoints
│   ├── JwtConfig.java
│   ├── CompressionConfig.java       ← Gzip filter bean for incoming requests
│   ├── ModelMapperConfig.java       ← ModelMapper bean
│   └── OpenApiConfig.java           ← Swagger/OpenAPI 3 config
├── security/
│   ├── JwtUtil.java
│   ├── JwtAuthFilter.java
│   └── UserDetailsServiceImpl.java
├── entity/                          ← JPA entities + enums
├── dto/                             ← Request DTOs + Response DTOs
├── repository/                      ← JpaRepository interfaces
├── service/                         ← Business logic + ownership guards
├── controller/                      ← REST controllers (DTOs only — never entities)
└── exception/
    ├── GlobalExceptionHandler.java
    ├── ResourceNotFoundException.java
    └── AccessDeniedException.java
src/main/resources/
├── application.yml                  ← DB, JPA, JWT, server config
└── db/migration/V1__init.sql        ← Flyway baseline schema (optional)
build.gradle.kts                     ← All required dependencies (Kotlin DSL)
settings.gradle.kts                  ← Project name
```

**React (TypeScript)**
```
src/
├── api/
│   └── apiClient.ts        ← Single fetch wrapper (gzip + auth + blur + toast + error modal)
├── hooks/
│   └── useApi.ts           ← useQuery / useMutation hooks with dedup + cache
└── components/ui/
    ├── Toast.tsx            ← Success toast (2xx)
    └── ErrorModal.tsx       ← Error popup (non-2xx): status + message + details
```

---

## Execution phases

---

### Phase 1 — Scan and extract

Read ALL provided React files. For each file:

**1a. Find all hardcoded data sources:**
- `const data = [...]` or `const data = {...}`
- `useState([...])` or `useState({...})` with inline literal values
- Inline object literals in JSX (e.g., `items.map(...)` where `items` is hardcoded)
- Hardcoded `options` arrays in dropdowns/selects → these become enum candidates

**1b. Infer Java types from each field:**

| JS value | Java type |
|---|---|
| `"some string"` | `String` |
| `1`, `2`, `100` (whole) | `Long` (IDs) or `Integer` (counts/quantities) |
| `9.99`, `0.15` (decimal) | `BigDecimal` (money/rates) or `Double` (scores) |
| `true` / `false` | `Boolean` |
| `"2024-01-15T10:30:00Z"` ISO string | `LocalDateTime` |
| `"2024-01-15"` date-only string | `LocalDate` |
| `{ id, name, ... }` nested object | New Entity or `@Embedded` value object |
| `[{id, name, ...}, ...]` object array | Child entity with `@OneToMany` |
| `["DRAFT","ACTIVE","CLOSED"]` string options | Java `enum` |
| `{ line1, city, state, pincode }` address shape | `@Embedded` `Address` value object |

**1c. Identify screen purpose (drives endpoint design):**
- List screen → `GET /api/v1/entity` (paginated)
- Detail screen → `GET /api/v1/entity/{id}`
- Create form → `POST /api/v1/entity`
- Edit form → `PUT /api/v1/entity/{id}`
- Delete action → `DELETE /api/v1/entity/{id}` (soft delete by default)
- Dashboard → read-only aggregated GETs, no mutations
- Auth screen → `POST /api/v1/auth/register` + `POST /api/v1/auth/login`

**1d. Build the Entity Map:**
```
EntityName → {
  fields: { fieldName: javaType, ... },
  relationships: [ ... ],
  status_enum?: [ "DRAFT", "ACTIVE", ... ],
  screens: [ "ScreenA", "ScreenB" ],
  is_user_owned: boolean
}
```

Consult `references/entity-patterns.md` for common relationship patterns and cascade rules.

---

### Phase 2 — Plan architecture (WAIT for confirmation)

Before writing a single line of code, print the full plan and wait for the user to confirm or correct it.

**2a. Deduplicate entities** — if two screens show objects with identical shape, it is one entity.

**2b. Resolve all relationships** using `references/entity-patterns.md`. For each relationship state:
- Which side owns the FK
- Whether it is bidirectional or unidirectional
- Cascade type (see patterns file)
- Whether orphanRemoval applies

**2c. Identify enums** — any field whose values in the mock data form a closed set (status, type, role, mode).

**2d. Identify embedded value objects** — address shapes, money shapes, coordinate shapes → `@Embeddable`.

**2e. Auth scope:**
- If any screen shows user-specific data → add `@ManyToOne User owner` to that entity
- Always generate `User` entity + JWT classes

**2f. Pagination scope** — every list screen gets a paginated endpoint. Identify default sort field per entity.

**Print this exact plan format:**
```
═══════════════════════════════════════════════════════
ARCHITECTURE PLAN — awaiting your confirmation
═══════════════════════════════════════════════════════
Entities     : User, Product, Order, OrderItem, Category
Enums        : OrderStatus (DRAFT/PLACED/DELIVERED/CANCELLED), ProductCategory
Embedded     : Address (line1, city, state, pincode)
Relationships:
  Order      →(ManyToOne)→   User (owner, nullable=false)
  OrderItem  →(ManyToOne)→   Order (cascade=ALL, orphanRemoval=true)
  OrderItem  →(ManyToOne)→   Product
  Product    →(ManyToOne)→   Category
Auth         : JWT — /api/v1/auth/register + /api/v1/auth/login
Endpoints    : 28 REST endpoints across 6 controllers
Pagination   : All list endpoints paginated (Page<T>, default size=20)
Soft delete  : YES — all entities get isDeleted + deletedAt fields
═══════════════════════════════════════════════════════
Reply "ok" to generate, or describe corrections.
```

**Do not write any code until the user confirms.**

---

### Phase 3 — Generate code (in this exact order)

#### 3a. `build.gradle.kts` + `settings.gradle.kts`

Always generate both. Use Kotlin DSL (`.kts`) — the modern Gradle default.

**`settings.gradle.kts`:**
```kotlin
rootProject.name = "backend"   // replace with user's project name
```

**`build.gradle.kts`:**
```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile  // only if user wants Kotlin source; remove for pure Java

plugins {
    id("org.springframework.boot") version "3.2.4"
    id("io.spring.dependency-management") version "1.1.4"
    java
}

group = "com.app"
version = "0.0.1-SNAPSHOT"

java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    mavenCentral()
}

dependencies {
    // ── Core ─────────────────────────────────────────────────────────────────
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-validation")

    // ── Database ──────────────────────────────────────────────────────────────
    runtimeOnly("org.postgresql:postgresql")

    // ── Flyway — schema migrations ────────────────────────────────────────────
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")  // Flyway 10+ needs the dialect module

    // ── JWT (JJWT 0.12.x) ────────────────────────────────────────────────────
    implementation("io.jsonwebtoken:jjwt-api:0.12.3")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.3")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.3")

    // ── Utilities ─────────────────────────────────────────────────────────────
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    implementation("org.modelmapper:modelmapper:3.2.0")

    // ── OpenAPI / Swagger UI ──────────────────────────────────────────────────
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0")

    // ── Test ──────────────────────────────────────────────────────────────────
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
```

> **Note on Lombok + Gradle:** Lombok requires both `compileOnly` and `annotationProcessor`
> declarations. The `configurations { compileOnly { extendsFrom(annotationProcessor) } }` block
> ensures the annotation processor runs during compilation. Without this Lombok annotations
> (`@Data`, `@Builder`, etc.) will produce compile errors.

#### 3b. `application.yml`

Always generate with all required config:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/${DB_NAME:appdb}
    username: ${DB_USER:postgres}
    password: ${DB_PASS:postgres}
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2

  jpa:
    hibernate:
      ddl-auto: validate          # Flyway owns schema — never "create" in production
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        default_batch_fetch_size: 16  # N+1 protection for lazy collections

  flyway:
    enabled: true
    locations: classpath:db/migration

server:
  compression:
    enabled: true
    mime-types: application/json,application/xml,text/html,text/plain
    min-response-size: 1024
  port: 8080

app:
  jwt:
    secret: ${JWT_SECRET:change-me-in-production-must-be-at-least-32-chars}
    expiration-ms: 86400000        # 24h
    refresh-expiration-ms: 604800000  # 7d

springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
```

#### 3c. Enums (`entity/` package)

For every closed-set status field detected, generate a Java enum:

```java
public enum OrderStatus {
    DRAFT,
    PLACED,
    ACCEPTED,
    IN_FULFILLMENT,
    DELIVERED,
    CANCELLED;

    // Optional: add display label for API responses
    public String getDisplayName() {
        return name().replace('_', ' ');
    }
}
```

Rules:
- Store as `String` in DB: `@Enumerated(EnumType.STRING)` — never `ORDINAL` (breaks on reorder)
- Annotate column: `@Column(nullable = false, length = 30)`

#### 3d. Embedded value objects (`entity/` package)

For address-shaped or money-shaped fields:

```java
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Address {
    @Column(name = "addr_line1", nullable = false)
    private String line1;

    @Column(name = "addr_line2")
    private String line2;

    @Column(name = "addr_city", nullable = false)
    private String city;

    @Column(name = "addr_state", nullable = false)
    private String state;

    @Column(name = "addr_pincode", nullable = false, length = 10)
    private String pincode;
}
```

Use in entity: `@Embedded private Address deliveryAddress;`

#### 3e. Entities (`entity/` package)

For each entity:

```java
@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLRestriction("is_deleted = false")   // global soft-delete filter
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- Business fields ---
    @Column(nullable = false)
    private String referenceNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OrderStatus status;

    @Embedded
    private Address deliveryAddress;

    // --- Relationships ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore                    // prevent circular serialisation
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    // --- Soft delete ---
    @Column(nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    private LocalDateTime deletedAt;

    // --- Audit ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

Rules:
- Use Lombok (`@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`)
- `FetchType.LAZY` on ALL relationships — no exceptions
- `@JsonIgnore` on every back-reference (child → parent)
- `@Builder.Default` on all collections and boolean fields with defaults
- `@SQLRestriction("is_deleted = false")` for soft delete (Spring Boot 3.x replacement for `@Where`)
- `@Column(nullable = false)` on all required business fields
- Add `@NotBlank`, `@NotNull`, `@Size`, `@Min`, `@Max` from `jakarta.validation` on entity fields
- Always include `createdAt`, `updatedAt`, `isDeleted`, `deletedAt`

#### 3f. Repositories (`repository/` package)

```java
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Ownership-scoped queries — always filter by userId
    Page<Order> findByUserId(Long userId, Pageable pageable);
    Optional<Order> findByIdAndUserId(Long id, Long userId);

    // Status queries
    Page<Order> findByUserIdAndStatus(Long userId, OrderStatus status, Pageable pageable);

    // Custom aggregation example
    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId AND o.status = :status")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") OrderStatus status);
}
```

Rules:
- All queries on user-owned entities must include `userId` parameter
- Use `Page<T>` return type on all list queries
- Add `@Query` for aggregations/complex joins — never rely on N+1 default loading
- The `@SQLRestriction` on the entity automatically excludes soft-deleted rows

#### 3g. DTOs (`dto/` package)

**Request DTO** — no `id`, no audit fields, all validation annotations:

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {

    @NotBlank(message = "Reference number is required")
    @Size(max = 50, message = "Reference number must not exceed 50 characters")
    private String referenceNumber;

    @NotNull(message = "Status is required")
    private OrderStatus status;

    @NotNull(message = "Delivery address is required")
    @Valid                         // triggers nested validation on Address fields
    private Address deliveryAddress;

    private List<@Valid OrderItemRequest> items;
}
```

**Response DTO** — flat, safe, no circular refs, nested entities as their own Response DTOs:

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String referenceNumber;
    private OrderStatus status;
    private Address deliveryAddress;
    private List<OrderItemResponse> items;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

Rules:
- Never return a JPA entity from any controller — always a Response DTO
- Never include `isDeleted`, `deletedAt`, `password`, or internal audit metadata in Response DTOs
- Nested entities → use their Response DTO type (e.g., `OrderItemResponse`, not `OrderItem`)

#### 3h. Services (`service/` package)

```java
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ModelMapper modelMapper;

    @Transactional(readOnly = true)
    public Page<OrderResponse> findAll(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable)
                .map(order -> modelMapper.map(order, OrderResponse.class));
    }

    @Transactional(readOnly = true)
    public OrderResponse findById(Long id, Long userId) {
        Order order = orderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        return modelMapper.map(order, OrderResponse.class);
    }

    @Transactional
    public OrderResponse create(OrderRequest request, Long userId) {
        Order order = modelMapper.map(request, Order.class);
        order.setUser(userRepository.getReferenceById(userId));
        Order saved = orderRepository.save(order);
        return modelMapper.map(saved, OrderResponse.class);
    }

    @Transactional
    public OrderResponse update(Long id, OrderRequest request, Long userId) {
        Order order = orderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        modelMapper.map(request, order);   // update in-place
        return modelMapper.map(order, OrderResponse.class);
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Order order = orderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        // Soft delete — never hard delete
        order.setIsDeleted(true);
        order.setDeletedAt(LocalDateTime.now());
    }
}
```

Rules:
- `@Transactional(readOnly = true)` on ALL read methods — critical for performance
- `@Transactional` (read-write) on ALL write methods
- All user-owned resource methods take and validate `Long userId`
- Soft delete: set `isDeleted = true` + `deletedAt = now()` — never call `repository.delete()`
- For complex multi-entity operations (e.g., PO splitting → creates multiple sub-POs): wrap the entire operation in one `@Transactional` method — it is atomic or it fully rolls back
- Use `userRepository.getReferenceById(userId)` (not `findById`) when you only need the FK — avoids a round trip

#### 3i. Controllers (`controller/` package)

```java
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Purchase order management")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "List all orders for current user (paginated)")
    public ResponseEntity<Page<OrderResponse>> getAll(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(orderService.findAll(extractUserId(userDetails), pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(orderService.findById(id, extractUserId(userDetails)));
    }

    @PostMapping
    public ResponseEntity<OrderResponse> create(
            @Valid @RequestBody OrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        OrderResponse created = orderService.create(request, extractUserId(userDetails));
        URI location = URI.create("/api/v1/orders/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody OrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(orderService.update(id, request, extractUserId(userDetails)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        orderService.delete(id, extractUserId(userDetails));
        return ResponseEntity.noContent().build();
    }

    // ── Helper ──────────────────────────────────────────────────────────────
    private Long extractUserId(UserDetails userDetails) {
        // UserDetailsServiceImpl must load a User that implements UserDetails
        // and exposes getId(). Cast here or use a custom UserPrincipal wrapper.
        if (userDetails instanceof UserPrincipal principal) {
            return principal.getId();
        }
        throw new IllegalStateException("UserDetails is not a UserPrincipal instance");
    }
}
```

Rules:
- `@Valid` on every `@RequestBody` — mandatory
- Return `ResponseEntity.created(location).body(dto)` on POST (201, not 200)
- Return `ResponseEntity.noContent().build()` on DELETE (204)
- `@PageableDefault` on all list endpoints
- Swagger `@Tag` + `@Operation` on all controllers and key endpoints
- `extractUserId()` is a private helper defined once per controller — see above for pattern

#### 3j. Security classes (`security/` + `config/`)

**`JwtUtil.java`:**
```java
@Component
public class JwtUtil {
    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(signingKey())
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parser().verifyWith(signingKey()).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean isValid(String token, UserDetails userDetails) {
        try {
            String username = extractUsername(token);
            return username.equals(userDetails.getUsername()) &&
                   !Jwts.parser().verifyWith(signingKey()).build()
                        .parseSignedClaims(token).getPayload().getExpiration().before(new Date());
        } catch (JwtException e) {
            return false;
        }
    }
}
```

**`SecurityConfig.java`:**
```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/api-docs/**").permitAll()
                // Add per-app public endpoints here (e.g., public catalog browse)
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
            "http://localhost:5173",    // Vite dev
            "http://localhost:3000",    // CRA dev
            "${FRONTEND_URL:http://localhost:5173}"  // production override via env
        ));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}
```

**`AuthController.java`** — always generate with both endpoints:
```java
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
```

---

### Phase 4 — Exception handling

**`GlobalExceptionHandler.java`:**
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(404, ex.getMessage(), null));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(403, "Access denied", null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<String> details = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .toList();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(400, "Validation failed", details));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        // Log internally but never expose stack trace to client
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(500, "An unexpected error occurred", null));
    }
}
```

**`ResourceNotFoundException.java`:**
```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String entity, Long id) {
        super(entity + " with id " + id + " not found");
    }
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

**`ErrorResponse.java`:**
```java
@Data
@AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String message;
    private List<String> details;   // null for non-validation errors
    private LocalDateTime timestamp = LocalDateTime.now();

    public ErrorResponse(int status, String message, List<String> details) {
        this.status = status;
        this.message = message;
        this.details = details;
    }
}
```

---

### Phase 5 — Gzip compression (bidirectional)

**Outgoing responses** — Spring Boot handles automatically via `application.yml`:
```yaml
server.compression.enabled: true
```

**Incoming requests** — custom filter decompresses `Content-Encoding: gzip` bodies before they reach controllers.

**`GzipRequestWrapper.java`** — full implementation:
```java
public class GzipRequestWrapper extends HttpServletRequestWrapper {

    public GzipRequestWrapper(HttpServletRequest request) {
        super(request);
    }

    @Override
    public ServletInputStream getInputStream() throws IOException {
        GZIPInputStream gzipStream = new GZIPInputStream(super.getInputStream());
        return new ServletInputStream() {
            @Override public int read() throws IOException { return gzipStream.read(); }
            @Override public int read(byte[] b, int off, int len) throws IOException { return gzipStream.read(b, off, len); }
            @Override public boolean isFinished() { try { return gzipStream.available() == 0; } catch (IOException e) { return true; } }
            @Override public boolean isReady() { return true; }
            @Override public void setReadListener(ReadListener listener) { throw new UnsupportedOperationException(); }
        };
    }

    @Override
    public BufferedReader getReader() throws IOException {
        return new BufferedReader(new InputStreamReader(getInputStream(), getCharacterEncoding()));
    }
}
```

**`GzipRequestFilter.java`:**
```java
@Component
public class GzipRequestFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        if ("gzip".equalsIgnoreCase(request.getHeader("Content-Encoding"))) {
            chain.doFilter(new GzipRequestWrapper(request), response);
        } else {
            chain.doFilter(request, response);
        }
    }
}
```

**`CompressionConfig.java`:**
```java
@Configuration
public class CompressionConfig {
    @Bean
    public FilterRegistrationBean<GzipRequestFilter> gzipRequestFilter() {
        FilterRegistrationBean<GzipRequestFilter> bean =
                new FilterRegistrationBean<>(new GzipRequestFilter());
        bean.addUrlPatterns("/api/*");
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
}
```

---

### Phase 6 — React API layer (TypeScript)

> **Rule:** `apiClient.ts` is the ONLY place in the entire React app that calls `fetch()`.  
> Components never call `fetch()` directly. They use `useQuery` or `useMutation` only.

#### 6a. `src/api/apiClient.ts`

```typescript
// src/api/apiClient.ts

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

type ApiCallOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  compress?: boolean;                          // default true for POST/PUT/PATCH
  onBlur?: (blurred: boolean) => void;         // scoped to calling component only
  onToast?: (payload: { message: string }) => void;
  onError?: (err: ApiError) => void;
  headers?: Record<string, string>;
};

export type ApiError = {
  status: number;
  message: string;
  details?: string[];
};

async function gzipBody(data: unknown): Promise<ArrayBuffer> {
  const json = JSON.stringify(data);
  // CompressionStream is supported in all modern browsers.
  // For environments that don't support it, fall back to plain JSON.
  if (typeof CompressionStream === 'undefined') {
    return new TextEncoder().encode(json).buffer;
  }
  const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Response(stream).arrayBuffer();
}

export async function apiCall<T>(url: string, options: ApiCallOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    compress,
    onBlur,
    onToast,
    onError,
    headers: extraHeaders = {},
  } = options;

  const shouldCompress = compress ?? ['POST', 'PUT', 'PATCH'].includes(method);
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Accept-Encoding': 'gzip',
    ...extraHeaders,
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  let fetchBody: BodyInit | undefined;
  if (body !== undefined) {
    if (shouldCompress) {
      const buffer = await gzipBody(body);
      // If gzip wasn't available, don't claim it is
      if (typeof CompressionStream !== 'undefined') {
        headers['Content-Encoding'] = 'gzip';
      }
      headers['Content-Type'] = 'application/json';
      fetchBody = buffer;
    } else {
      headers['Content-Type'] = 'application/json';
      fetchBody = JSON.stringify(body);
    }
  }

  onBlur?.(true);
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${url}`, { method, headers, body: fetchBody });
  } catch (networkErr) {
    onBlur?.(false);
    const err: ApiError = { status: 0, message: 'Network error — server unreachable' };
    onError?.(err);
    throw err;
  }

  onBlur?.(false);

  if (response.ok) {
    const data = response.status === 204 ? null : await response.json();
    onToast?.({ message: 'Saved successfully' });
    return data as T;
  }

  // Parse server error body
  let apiErr: ApiError = { status: response.status, message: response.statusText };
  try {
    const errBody = await response.json();
    apiErr = {
      status: response.status,
      message: errBody.message ?? errBody.error ?? response.statusText,
      details: errBody.details,
    };
  } catch (_) { /* non-JSON error body — keep statusText */ }

  onError?.(apiErr);
  throw apiErr;
}
```

#### 6b. `src/hooks/useApi.ts`

```typescript
// src/hooks/useApi.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { apiCall, type ApiError } from '../api/apiClient';
import { useToast } from '../components/ui/Toast';
import { useErrorModal } from '../components/ui/ErrorModal';

// ── useQuery ─────────────────────────────────────────────────────────────────

export function useQuery<T>(url: string) {
  const [data, setData]       = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<ApiError | null>(null);
  const [blurred, setBlurred] = useState(false);
  const { showToast }         = useToast();
  const { showError }         = useErrorModal();

  // Stable ref so refetch doesn't recreate on every render
  const urlRef = useRef(url);
  useEffect(() => { urlRef.current = url; }, [url]);

  // Dedup guard — prevents simultaneous duplicate fetches
  const inflightRef = useRef(false);

  const fetch_ = useCallback(async () => {
    if (inflightRef.current) return;
    inflightRef.current = true;
    setError(null);

    try {
      const result = await apiCall<T>(urlRef.current, {
        method: 'GET',
        onBlur: setBlurred,
        onError: (err) => { setError(err); showError(err); },
        // GET requests don't show a success toast — too noisy
      });
      setData(result);
    } catch (_) {
      // error already handled by onError callback
    } finally {
      setLoading(false);
      inflightRef.current = false;
    }
  }, []); // stable — no deps that would cause re-creation

  useEffect(() => { fetch_(); }, [fetch_]);

  return { data, loading, error, blurred, refetch: fetch_ };
}

// ── useMutation ──────────────────────────────────────────────────────────────

type MutationMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export function useMutation<TBody = unknown, TResponse = unknown>(
  url: string,
  method: MutationMethod = 'POST'
) {
  const [loading, setLoading] = useState(false);
  const [blurred, setBlurred] = useState(false);
  const { showToast }         = useToast();
  const { showError }         = useErrorModal();

  const mutate = useCallback(async (body?: TBody): Promise<TResponse | null> => {
    setLoading(true);
    try {
      const result = await apiCall<TResponse>(url, {
        method,
        body,
        onBlur:  setBlurred,
        onToast: showToast,
        onError: showError,
      });
      return result;
    } catch (_) {
      return null;
    } finally {
      setLoading(false);
    }
  }, [url, method]);

  return { mutate, loading, blurred };
}
```

#### 6c. `src/components/ui/Toast.tsx`

```tsx
// src/components/ui/Toast.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type ToastPayload = { message: string };
type ToastContextType = { showToast: (payload: ToastPayload) => void };

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastPayload | null>(null);

  const showToast = useCallback((payload: ToastPayload) => {
    setToast(payload);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);   // cleaned up on unmount — no memory leak
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: '#16a34a', color: '#fff',
          padding: '12px 20px', borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: 14, fontWeight: 500,
          animation: 'slideIn 0.2s ease-out',
        }}>
          ✓ {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}
```

#### 6d. `src/components/ui/ErrorModal.tsx`

```tsx
// src/components/ui/ErrorModal.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ApiError } from '../../api/apiClient';

type ErrorModalContextType = { showError: (err: ApiError) => void };

const ErrorModalContext = createContext<ErrorModalContextType>({ showError: () => {} });
export const useErrorModal = () => useContext(ErrorModalContext);

export function ErrorModalProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<ApiError | null>(null);

  const showError = useCallback((err: ApiError) => setError(err), []);

  // Dismiss on Escape key
  useEffect(() => {
    if (!error) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setError(null); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [error]);

  return (
    <ErrorModalContext.Provider value={{ showError }}>
      {children}
      {error && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
          onClick={() => setError(null)}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: 32,
            maxWidth: 480, width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
            onClick={e => e.stopPropagation()}>
            {/* HTTP status code — large and prominent */}
            <div style={{ fontSize: 48, fontWeight: 800, color: '#dc2626', lineHeight: 1 }}>
              {error.status || 'Error'}
            </div>
            <p style={{ marginTop: 12, fontSize: 16, fontWeight: 600, color: '#111' }}>
              {error.message}
            </p>
            {/* Field-level validation errors */}
            {error.details && error.details.length > 0 && (
              <ul style={{ marginTop: 12, paddingLeft: 20, fontSize: 13, color: '#555' }}>
                {error.details.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            )}
            <button
              style={{
                marginTop: 20, padding: '8px 20px', background: '#dc2626',
                color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14,
              }}
              onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </ErrorModalContext.Provider>
  );
}
```

#### 6e. Blur overlay pattern (component usage)

Every component that calls `useQuery` or `useMutation` wraps its content with a scoped blur — never a global full-screen loader.

```tsx
// Example component showing blur pattern
function OrderList() {
  const { data: orders = [], blurred: loadingBlur } = useQuery<Order[]>('/api/v1/orders');
  const { mutate: deleteOrder, blurred: deletingBlur } = useMutation(`/api/v1/orders`, 'DELETE');

  const isBlurred = loadingBlur || deletingBlur;

  return (
    <div style={{ position: 'relative' }}>
      {isBlurred && (
        <div style={{
          position: 'absolute', inset: 0,
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 'inherit',
        }}>
          <span style={{ fontSize: 14, color: '#666' }}>Loading…</span>
        </div>
      )}
      {/* rest of component */}
    </div>
  );
}
```

---

### Phase 7 — React migration guide

After generating all files, print a concise migration guide in chat showing before/after for every screen.

```tsx
// ── BEFORE: hardcoded mock ────────────────────────────────────────────────────
const orders = [{ id: 1, status: 'PLACED', total: 450 }];

// ── AFTER: GET (list, paginated) ──────────────────────────────────────────────
const { data, blurred } = useQuery<PageResponse<Order>>('/api/v1/orders?page=0&size=20');
const orders = data?.content ?? [];

// ── AFTER: GET (single) ───────────────────────────────────────────────────────
const { data: order } = useQuery<Order>(`/api/v1/orders/${id}`);

// ── AFTER: POST ───────────────────────────────────────────────────────────────
const { mutate: createOrder, loading } = useMutation<OrderRequest, OrderResponse>('/api/v1/orders', 'POST');
const created = await createOrder({ referenceNumber, status, deliveryAddress }); // toast auto-shown

// ── AFTER: PUT ────────────────────────────────────────────────────────────────
const { mutate: updateOrder } = useMutation<OrderRequest, OrderResponse>(`/api/v1/orders/${id}`, 'PUT');

// ── AFTER: DELETE ─────────────────────────────────────────────────────────────
const { mutate: deleteOrder } = useMutation(`/api/v1/orders/${id}`, 'DELETE');
await deleteOrder(); // no body needed for DELETE
```

App root setup (print once, clearly):
```tsx
// main.tsx
<ToastProvider>
  <ErrorModalProvider>
    <App />
  </ErrorModalProvider>
</ToastProvider>
```

---

## File delivery

```
Java   → /mnt/user-data/outputs/src/main/java/{basePackage}/
Config → /mnt/user-data/outputs/src/main/resources/
React  → /mnt/user-data/outputs/react-utils/
```

Default package: `com.app.backend` (override with user's preference).

After writing all files, call `present_files` grouped by layer:
1. `build.gradle.kts` + `settings.gradle.kts` + `application.yml`
2. Entities + Enums + Embeddables
3. Repositories
4. DTOs
5. Services
6. Controllers
7. Security + Config
8. Exception handling
9. React utilities

Print final summary:
```
═══════════════════════════════════════
Generated: 12 entities · 38 endpoints · 24 Java files · 4 React files
Flyway migration: V1__init.sql
Swagger UI: http://localhost:8080/swagger-ui.html
═══════════════════════════════════════
```

---

## Quality checklist (verify before delivering)

**Backend**
- [ ] `build.gradle.kts` includes all required starters, JJWT 0.12.x, and Flyway PostgreSQL dialect module
- [ ] `application.yml` generated with all required config keys
- [ ] No JPA entity returned directly from any controller (always DTOs)
- [ ] Every user-owned resource validates `userId` ownership in service layer
- [ ] All `@ManyToOne` use `FetchType.LAZY`
- [ ] All enums stored as `@Enumerated(EnumType.STRING)` — never ORDINAL
- [ ] `@Valid` on every `@RequestBody` in controllers
- [ ] `@Transactional(readOnly = true)` on all read service methods
- [ ] `@Transactional` on all write service methods
- [ ] Complex multi-entity operations wrapped in a single `@Transactional` for atomicity
- [ ] Soft delete: `isDeleted + deletedAt` on all entities, `@SQLRestriction` applied
- [ ] `GlobalExceptionHandler` covers: not-found, forbidden, validation, generic
- [ ] JWT filter wired into `SecurityConfig` via `addFilterBefore`
- [ ] CORS configured in `SecurityConfig.corsConfigurationSource()`
- [ ] No circular JSON serialisation (`@JsonIgnore` on all back-references)
- [ ] `GzipRequestWrapper` fully implemented (overrides `getInputStream()` + `getReader()`)
- [ ] `CompressionConfig` registers `GzipRequestFilter` bean
- [ ] `server.compression.enabled: true` in `application.yml`
- [ ] `@SQLRestriction` excludes soft-deleted rows from all queries
- [ ] `extractUserId()` helper defined in every controller that needs it
- [ ] Swagger `@Tag` + `@Operation` on all controllers
- [ ] `ModelMapperConfig.java` registers `ModelMapper` as a `@Bean`

**React**
- [ ] `apiClient.ts` is the ONLY file that calls `fetch()` — verified
- [ ] `gzipBody` has fallback for environments without `CompressionStream`
- [ ] `useQuery` uses `useRef` for in-flight deduplication
- [ ] `useQuery` does not recreate `fetch_` on every render (stable `useCallback`)
- [ ] `useErrorModal` Escape key listener cleaned up on unmount
- [ ] Toast `useEffect` timer cleared on unmount
- [ ] Blur overlay scoped to calling component only — not full-screen
- [ ] `ToastProvider` and `ErrorModalProvider` wrap app root
- [ ] TypeScript generics on `useQuery<T>` and `useMutation<TBody, TResponse>`
- [ ] POST/PUT/PATCH are gzip-compressed; GET/DELETE are not
- [ ] Auth header injected once in `apiClient.ts` — not duplicated in any component