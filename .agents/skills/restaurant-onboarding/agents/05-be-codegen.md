# Agent 05 — Backend Codegen

Read `scratch/entity-map.json` and `scratch/progress.md` (Phase 4 summary only). Generate all missing backend endpoints, models, and migrations. If an endpoint already exists, skip it — never duplicate.

---

## Step 1 — Load context

Read:
- `scratch/entity-map.json` — `missingEndpoints`, `missingModels`, all step endpoint definitions
- `scratch/progress.md` — Phase 1 discovery summary for API pattern and existing routes

Do not read frontend files.

## Step 2 — Identify the stack

From discovery summary in progress.md, determine the backend stack:

| Pattern found | Approach |
|---|---|
| `express` + `prisma` | Generate express Router files + Prisma schema additions |
| `next.js` API routes | Generate `app/api/.../route.ts` files |
| `fastify` | Generate fastify plugin files |
| No backend found | Generate a full Express + Prisma backend from scratch |

If building from scratch, run:
```bash
cd onboarding/backend
npm init -y
npm install express cors helmet zod @prisma/client
npm install -D typescript @types/node @types/express ts-node prisma
npx tsc --init
```

## Step 3 — Generate/update DB schema

If using Prisma, add missing models to `prisma/schema.prisma`:

```prisma
model Restaurant {
  id            String   @id @default(cuid())
  name          String
  cuisineType   String
  description   String?
  logoUrl       String?
  status        RestaurantStatus @default(DRAFT)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  location      RestaurantLocation?
  operatingHours OperatingHours[]
  documents     RestaurantDocument[]
  owner         User     @relation(fields: [ownerId], references: [id])
  ownerId       String
}

// Add all missing models from entity-map.json missingModels list
```

Only add models that are in `missingModels` — never touch existing models.

Run migration after writing schema:
```bash
npx prisma migrate dev --name add_onboarding_models
```

## Step 4 — Generate each missing endpoint

For every endpoint in `missingEndpoints`, generate the route file. Use this pattern:

```ts
// onboarding/backend/routes/restaurants.ts
import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const router = Router()

const createRestaurantSchema = z.object({
  name: z.string().min(2).max(100),
  cuisineType: z.string(),
  description: z.string().max(500).optional(),
  ownerId: z.string(),
})

// POST /api/restaurants
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = createRestaurantSchema.parse(req.body)
    const restaurant = await prisma.restaurant.create({
      data: { ...body, status: 'DRAFT' },
    })
    res.status(201).json({ id: restaurant.id, ...restaurant })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ errors: err.errors })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/restaurants/:id/location
router.patch('/:id/location', async (req: Request, res: Response) => {
  // same pattern — Zod parse → prisma upsert → 200 JSON
})

export default router
```

Rules:
- Zod validation on every route — never trust `req.body` directly
- Return `{ id, ...data }` on POST, `{ updated: true, ...data }` on PATCH
- Return `{ errors: ZodError.errors }` on 400, `{ error: string }` on 500
- Auth middleware: add `requireAuth` middleware to all routes (implement as JWT verify)

Generate one route file per entity group. After each file, confirm write.

## Step 5 — Generate app entry point (if building from scratch)

`onboarding/backend/src/app.ts`:

```ts
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import restaurantRouter from './routes/restaurants'

const app = express()
app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' }))
app.use(express.json({ limit: '10mb' }))

app.use('/api/restaurants', restaurantRouter)

app.get('/health', (_, res) => res.json({ ok: true, ts: Date.now() }))

export default app
```

`onboarding/backend/src/index.ts`:
```ts
import app from './app'
const PORT = process.env.PORT ?? 4000
app.listen(PORT, () => console.log(`Shopro API running on :${PORT}`))
```

## Step 6 — Write curl test plan to scratch

```bash
cat > scratch/curl-plan.md << 'EOF'
# Curl Test Plan

## Health check
curl -s http://localhost:4000/health

## POST /api/restaurants
curl -s -X POST http://localhost:4000/api/restaurants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TEST_TOKEN" \
  -d '{"name":"Test Restaurant","cuisineType":"indian","ownerId":"test-owner-1"}'

## PATCH /api/restaurants/:id/location  (replace RESTAURANT_ID after POST succeeds)
curl -s -X PATCH http://localhost:4000/api/restaurants/RESTAURANT_ID/location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TEST_TOKEN" \
  -d '{"addressLine1":"123 Test St","city":"Mumbai","pincode":"400001","state":"Maharashtra","serviceRadiusKm":5}'

# ... one curl per endpoint generated
EOF
```

## Step 7 — Append to progress.md

```
## Phase 5 — Backend Codegen ✓
- Stack: Express/Next.js/Fastify
- Models added: N (list)
- Endpoints generated: N (list paths)
- Migration run: yes/no
- Server entry: onboarding/backend/src/index.ts
- Port: 4000
→ Curl plan: scratch/curl-plan.md
```
