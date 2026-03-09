# Full-Stack UI + Backend Skill
Follow all diagrams exactly. Input: a user story. Output: complete implementation across all layers.

---

## PIPELINE OVERVIEW

```mermaid
flowchart LR
    A[User Story] --> B[Backend]
    B --> C[Tests]
    C --> D[Frontend]
    D --> E[Frontend Tests]
    E --> F[Output All Files]
```

---

## PART A — BACKEND PIPELINE

```mermaid
flowchart TD
    A[User Story] --> B[A1: Project Structure]
    B --> C[A2: JPA Entity]
    C --> D[A3: Records as DTOs]
    D --> E[A4: Repository]
    E --> F[A5: Service Interface + Impl]
    F --> G[A6: Controller]
    G --> H[A7: GlobalExceptionHandler]
    H --> I[A8: Custom Exceptions]
    I --> J[Flyway SQL Migration]
```

---

## A1 — PROJECT STRUCTURE

```mermaid
flowchart TD
    ROOT[src/main/java/mls/sho/dms/] --> ENT[entity/\nJPA @Entity classes]
    ROOT --> REPO[repository/\nSpring Data JPA]
    ROOT --> APP[application/]
    APP --> DTO[dto/ — Java 21 Records]
    APP --> SVC[service/ — interfaces + impls]
    APP --> MAP[mapper/ — Entity↔Record]
    APP --> EXC[exception/ — custom + GlobalHandler]
    ROOT --> INF[infrastructure/\nconfig/ persistence/]
    ROOT --> WEB[web/controller/\n@RestController]
    ROOT2[src/test/java/mls/sho/dms/] --> TR[repository/ @DataJpaTest]
    ROOT2 --> TS[application/service/ Mockito]
    ROOT2 --> TC[web/controller/ @WebMvcTest]
    ROOT2 --> TI[integration/ @SpringBootTest+TC]
```

---

## A2 — ENTITY RULES

```mermaid
flowchart TD
    A[Define Entity] --> B[@Entity @Table snake_case]
    B --> C[@Id @GeneratedValue UUID]
    C --> D[Audit: @CreationTimestamp\n@UpdateTimestamp]
    D --> E[Enums: @Enumerated STRING]
    E --> F[@Column nullable=false length=N]
    F --> G[equals/hashCode\non natural key NOT id]
    G --> H[@Version for optimistic lock\non hot entities]
    H --> I[Zero business logic\ndelegate to service]
```

---

## A3 — RECORDS AS DTOs

```mermaid
flowchart TD
    A[Need DTO?] --> B[Use Java 21 record]
    B --> C{Type?}
    C -->|Request| D[Add Jakarta Validation\n@NotBlank @NotNull\n@DecimalMin @Size etc]
    C -->|Response| E[Plain fields only\nno validation needed]
    C -->|Error| F[ValidationErrorResponse\nstatus+message+Map details\nor ApiErrorResponse\nstatus+message+timestamp]
    D --> G[Name: CreateXxxRequest]
    E --> H[Name: XxxResponse]
    F --> I[Returned by GlobalExceptionHandler]
    G & H & I --> J[NEVER expose\nentities directly]
```

---

## A4 — REPOSITORY RULES

```mermaid
flowchart TD
    A[Repository] --> B[extends JpaRepository Entity UUID]
    B --> C{Query type?}
    C -->|Simple| D[Spring derived method\nexistsByNameIgnoreCaseAndCategory]
    C -->|Complex| E[@Query JPQL with\nJOIN FETCH to avoid N+1]
    C -->|Filter| F[findByXxxAndStatus\nfindByIdAndStatus]
    D & E & F --> G[Return Optional or List\nnever null]
```

---

## A5 — SERVICE RULES

```mermaid
flowchart TD
    A[Service] --> B[Define Interface\nall public methods]
    B --> C[Impl: @Service @Transactional\n@RequiredArgsConstructor]
    C --> D{Business Rule Check}
    D -->|Resource missing| E[throw ResourceNotFoundException]
    D -->|Duplicate| F[throw BusinessRuleException]
    D -->|Photo invalid| G[throw PhotoValidationException\nmax 5MB jpeg/png only]
    D -->|OK| H[Execute logic\nmap entity↔record via mapper]
    H --> I[Write AuditLog\nvia auditLogRepository]
    I --> J[Return Response Record]
    E & F & G --> K[Bubble to\nGlobalExceptionHandler]
```

---

## A6 — CONTROLLER RULES

```mermaid
flowchart TD
    A[Controller] --> B[@RestController\n@RequestMapping /api/v1/xxx\n@RequiredArgsConstructor]
    B --> C[Inject Service only\nnot repository]
    C --> D{Method type?}
    D -->|POST| E[@PostMapping\n@ResponseStatus CREATED 201\n@Valid @RequestBody]
    D -->|GET| F[@GetMapping\n@ResponseStatus OK 200]
    D -->|PUT/PATCH| G[@PutMapping\n@ResponseStatus OK 200\n@Valid @RequestBody]
    D -->|DELETE| H[@DeleteMapping\n@ResponseStatus NO_CONTENT 204]
    E & F & G & H --> I[Delegate to service\nReturn DTO only — thin controller]
    I --> J[@AuthenticationPrincipal String username\nfor audit trail]
```

---

## A7 — EXCEPTION HANDLER

```mermaid
flowchart TD
    A[@RestControllerAdvice] --> B{Exception type?}
    B -->|MethodArgumentNotValidException| C[422 Unprocessable\nValidationErrorResponse\nfield→messages map]
    B -->|ResourceNotFoundException| D[404 Not Found\nApiErrorResponse]
    B -->|BusinessRuleException| E[409 Conflict\nApiErrorResponse]
    B -->|PhotoValidationException| F[400 Bad Request\nApiErrorResponse]
    B -->|Exception generic| G[500 Internal\nApiErrorResponse\nhide stack trace]
    C & D & E & F & G --> H[Timestamp: ISO-8601 UTC]
```

---

## PART B — TESTING PYRAMID

```mermaid
flowchart TD
    A[Tests] --> B[B2: @DataJpaTest\nRepository slice\n+Testcontainers PG]
    A --> C[B3: Mockito Unit\nService business rules\n@InjectMocks @Mock]
    A --> D[B4: @WebMvcTest\nController slice\nMockMvc + @Valid → 422]
    A --> E[B5: @SpringBootTest\n+Testcontainers\nE2E happy+sad paths\nTestRestTemplate]
    A --> F[B6: Vitest+RTL\nFrontend components\n+renderHook]

    B --> G{Pass?}
    C --> G
    D --> G
    E --> G
    F --> G
    G -->|No| H[Fix and re-run]
    G -->|Yes| I[Proceed to next layer]
```

---

## PART C — FRONTEND PIPELINE

```mermaid
flowchart TD
    A[Frontend] --> B[C2: Theme tokens\ntailwind.config + index.css\ndark mode class strategy]
    B --> C[C3: Layout Shell\nsticky Header + main\n+ Footer + ErrorToast]
    C --> D[C4: Skeletons\nshimmer animation\nImageWithSkeleton\ndomain skeletons]
    D --> E[C5: API Layer\nsrc/lib/api/client.ts\nAxios wrapper\nApiResult T + ApiError]
    E --> F[C6: Error Context\nToast provider\nmap all HTTP errors]
    F --> G[C7: Feature Modules\nsrc/features/feature-name/]
    G --> H[C8: Frontend Tests\nVitest + RTL]
```

---

## C7 — FEATURE MODULE STRUCTURE

```mermaid
flowchart TD
    A[src/features/feature-name/] --> B[schema.ts\nZod validation schema]
    A --> C[hooks/useXxx.ts\nReact Query v5\nno fetch in components]
    A --> D[components/XxxForm.tsx\nReact Hook Form + Zod\nprops+callbacks only\nno axios calls]
    A --> E[pages/XxxPage.tsx\nContainer\norchestrates hooks+components]

    B --> F{Validation layer?}
    F -->|Client instant| G[Zod schema]
    F -->|Server authoritative| H[Jakarta Validation]
```

---

## C5 — API LAYER RULES

```mermaid
flowchart TD
    A[client.ts] --> B[Axios instance\nbaseURL from env\nContent-Type JSON]
    B --> C[Request interceptor\nattach Bearer token]
    C --> D[Response interceptor]
    D --> E{Status?}
    E -->|2xx| F[Return ApiResult T\nsuccess:true data:T]
    E -->|422| G[Parse ValidationErrorResponse\nmap field errors to form]
    E -->|4xx/5xx| H[Parse ApiErrorResponse\nshow toast]
    F & G & H --> I[Feature API module\nsrc/features/xxx/api.ts\ntyped wrappers over client]
```

---

## SEPARATION OF CONCERNS — HARD RULES

```mermaid
flowchart LR
    DB[Flyway SQL\nschema only] --> ENT
    ENT[entity/\nstate+relations\nzero logic] --> SVC
    DTO[dto/ Records\nvalidation here] --> SVC
    SVC[service/impl/\nALL business rules\naudit writes here] --> CTRL
    CTRL[controller/\nthin @Valid\ndelegate only] --> EXC
    EXC[exception/\none place\nApiError+ValidationError]

    FAPI[src/lib/api/\ntyped wrappers\nno UI logic] --> FHOOK
    FHOOK[features/hooks/\nReact Query\nno fetch in components] --> FCOMP
    FCOMP[features/components/\nprops+callbacks only] --> FPAGE
    FPAGE[features/pages/\ncontainer orchestration]
```

---

## OUTPUT CHECKLIST

```mermaid
flowchart TD
    OUT[Output per user story] --> E1[Entities — JPA annotated]
    OUT --> E2[Records — Request+Response DTOs]
    OUT --> E3[Repository — derived+@Query methods]
    OUT --> E4[Service — Interface + Impl + comments]
    OUT --> E5[Controller — verbs+status codes+@Valid]
    OUT --> E6[GlobalExceptionHandler]
    OUT --> E7[Flyway SQL migration]
    OUT --> E8[Tests — DataJpa+Mockito+WebMvc+SpringBoot]
    OUT --> E9[Frontend Theme — tokens+tailwind+css]
    OUT --> E10[Frontend Layout — Layout+Header+Footer]
    OUT --> E11[Skeletons — shimmer+ImageWithSkeleton]
    OUT --> E12[Frontend API — client.ts+feature module]
    OUT --> E13[Frontend Feature — schema+hook+form+page]
    OUT --> E14[Frontend Tests — RTL+renderHook]
    E1 & E2 & E3 & E4 & E5 & E6 & E7 & E8 & E9 & E10 & E11 & E12 & E13 & E14 --> DONE[✅ Complete]
```

---

## TECH STACK
`Java 21 · Spring Boot 3.3 · JPA/Hibernate 6 · PostgreSQL · Flyway · JUnit5 · Mockito 5 · Testcontainers · springdoc-openapi 2 · React 18 · TypeScript 5 · Vite · shadcn/ui · Tailwind v3 · TanStack Query v5 · Zustand · React Hook Form · Zod · Axios`