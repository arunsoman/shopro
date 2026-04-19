# DB Reset Skill

Resets the Shopro POS PostgreSQL database by terminating all connections, dropping, and recreating it.

## Trigger
- "reset db"
- "reset database"
- "clear db"
- "wipe db"
- "fresh db"
- "clean db"
- "recreate db"

## Steps

1. Run the following command to reset the database:

```bash
docker exec shopro-postgres psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'shopro_pos' AND pid <> pg_backend_pid();" && \
docker exec shopro-postgres psql -U postgres -c "DROP DATABASE shopro_pos;" && \
docker exec shopro-postgres psql -U postgres -c "CREATE DATABASE shopro_pos;"
```

2. Restart the backend so Flyway re-runs migrations and seed data:

```bash
lsof -ti :8080 | xargs kill -9 2>/dev/null; sleep 1
cd /home/arun/IdeaProjects/shopro-pos && ./gradlew :shopro-res:bootRun &>/tmp/shopro-res-bootrun.log &
```

3. Wait for the backend to be ready:

```bash
for i in $(seq 1 20); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/auth/staff?restaurantId=3 2>/dev/null | grep -q "200"; then
    echo "Backend UP!"
    break
  fi
  echo "Waiting... ($i/20)"
  sleep 2
done
```

4. Confirm the database is fresh by checking a key table:

```bash
curl -s http://localhost:8080/api/v1/restaurants/3/ingredients 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Ingredients: {len(d)}')" 2>/dev/null || echo "Backend not ready yet"
```