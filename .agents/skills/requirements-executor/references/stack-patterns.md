# Stack Detection & Patterns Reference

## Detecting the Stack

### By config file presence
| File | Stack |
|------|-------|
| `package.json` + `next.config.*` | Next.js |
| `package.json` + `vite.config.*` | Vite / React / Vue |
| `package.json` + `angular.json` | Angular |
| `package.json` (no framework config) | Node.js / Express |
| `requirements.txt` or `pyproject.toml` + `manage.py` | Django |
| `requirements.txt` + `app.py` or `main.py` + Flask in deps | Flask |
| `requirements.txt` + FastAPI in deps | FastAPI |
| `Cargo.toml` | Rust |
| `go.mod` | Go |
| `pom.xml` or `build.gradle` | Java / Spring |
| `*.csproj` or `*.sln` | .NET / C# |

### Determine test framework
```bash
# JS/TS
cat package.json | grep -E '"test"|jest|vitest|mocha|playwright'

# Python
cat pyproject.toml requirements.txt 2>/dev/null | grep -E 'pytest|unittest|nose'

# Rust
grep '\[dev-dependencies\]' Cargo.toml

# Go — built-in testing
ls *_test.go 2>/dev/null
```

---

## Test Commands by Stack

| Stack | Run all tests | Run single file/module |
|-------|---------------|----------------------|
| Jest | `npx jest` | `npx jest path/to/file` |
| Vitest | `npx vitest run` | `npx vitest run path/to/file` |
| Pytest | `pytest` | `pytest path/to/test_file.py -v` |
| Go | `go test ./...` | `go test ./pkg/module/...` |
| Rust | `cargo test` | `cargo test module_name` |
| Django | `python manage.py test` | `python manage.py test app.tests.TestClass` |
| .NET | `dotnet test` | `dotnet test --filter TestName` |

---

## Entry Points by Framework

| Framework | Entry point(s) |
|-----------|---------------|
| Next.js | `pages/` or `app/` directory |
| Express | `index.js`, `app.js`, `server.js` |
| FastAPI | `main.py` — look for `app = FastAPI()` |
| Flask | `app.py` — look for `app = Flask()` |
| Django | `urls.py` (routing), `views.py` (logic), `models.py` (data) |
| Go | `main.go`, then `cmd/` or `internal/` |
| Rust | `src/main.rs` or `src/lib.rs` |

---

## Key Files to Read Per Framework

### Next.js / React
- `package.json` — dependencies, scripts
- `next.config.*` — routing, env vars
- `app/layout.tsx` or `pages/_app.tsx` — root
- `lib/` or `utils/` — shared utilities
- `.env.example` — required env vars

### Django
- `settings.py` — installed apps, middleware, DB config
- `urls.py` — routing
- `models.py` — data models
- `serializers.py` (if DRF) — API shapes
- `requirements.txt` — dependencies

### FastAPI / Flask
- `main.py` or `app.py` — routes and setup
- `models.py` or `schemas.py` — data shapes
- `database.py` — DB connection
- `routers/` or `blueprints/` — route modules

### Express / Node
- `package.json` — scripts and deps
- `src/routes/` or `routes/` — routing
- `src/models/` or `models/` — data models
- `src/middleware/` — middleware
- `.env.example` — required env vars

---

## Common Patterns to Match

### Auth patterns
- JWT: look for `jsonwebtoken`, `PyJWT`, `jose`
- Session: look for `express-session`, `django.contrib.sessions`
- OAuth: look for `passport`, `authlib`, `nextauth`

### Database patterns
- ORM (JS): `prisma`, `typeorm`, `sequelize`, `drizzle`
- ORM (Python): `sqlalchemy`, `django.db.models`, `tortoise`
- Direct: `pg`, `mysql2`, `sqlite3`, `psycopg2`

### Validation patterns
- JS: `zod`, `yup`, `joi`, `class-validator`
- Python: `pydantic`, `marshmallow`, `cerberus`

When implementing new code, match whichever library is already in use.