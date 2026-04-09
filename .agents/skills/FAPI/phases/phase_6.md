## PHASE 5 — Nginx Configuration

### 5.1 Generate Nginx config (`nginx/fapi-gateway.conf`)

Populate from ProjectProfile:

```nginx
upstream fapi_gateway {
    server 127.0.0.1:{{profile.gatewayPort}};
    keepalive 64;
}

limit_req_zone  $binary_remote_addr zone=fapi_global:20m rate=50r/s;
limit_req_zone  $binary_remote_addr zone=fapi_auth:10m   rate=5r/s;
limit_conn_zone $binary_remote_addr zone=fapi_conn:10m;

server {
    listen 443 ssl http2;
    server_name {{NGINX_SERVER_NAME}};    # ask user if not derivable from redirectUri

    ssl_certificate     /etc/ssl/app/fullchain.pem;
    ssl_certificate_key /etc/ssl/app/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_tickets off;
    ssl_stapling        on;
    ssl_stapling_verify on;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options          "DENY"       always;
    add_header X-Content-Type-Options   "nosniff"    always;
    add_header Referrer-Policy          "no-referrer" always;
    add_header Cache-Control            "no-store"   always;

    limit_conn fapi_conn 20;
    client_max_body_size 1m;

    # ── PAR ──────────────────────────────────────────────────────────────
    location = /par {
        limit_req zone=fapi_auth burst=10 nodelay;
        proxy_pass         http://fapi_gateway;
        proxy_http_version 1.1;
        proxy_set_header   Connection           "";
        proxy_set_header   Host                 $host;
        proxy_set_header   X-Real-IP            $remote_addr;
        proxy_set_header   X-Forwarded-For      $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto    $scheme;
        # STRIP — prevent header injection
        proxy_set_header   X-Fapi-Internal-Token    "";
        proxy_set_header   X-Fapi-Verified           "";
        proxy_set_header   X-Fapi-Subject             "";
        proxy_set_header   X-Fapi-Client-Id           "";
    }

    # ── Callback ─────────────────────────────────────────────────────────
    location = /callback {
        limit_req zone=fapi_auth burst=5 nodelay;
        proxy_pass         http://fapi_gateway;
        proxy_http_version 1.1;
        proxy_set_header   Connection           "";
        proxy_set_header   Host                 $host;
        proxy_set_header   X-Real-IP            $remote_addr;
        proxy_set_header   X-Forwarded-For      $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto    $scheme;
        proxy_set_header   X-Fapi-Internal-Token    "";
        proxy_set_header   X-Fapi-Verified           "";
        proxy_set_header   X-Fapi-Subject             "";
    }

    # ── API ───────────────────────────────────────────────────────────────
    location /api/ {
        limit_req zone=fapi_global burst=30 nodelay;
        proxy_pass         http://fapi_gateway;
        proxy_http_version 1.1;
        proxy_set_header   Connection           "";
        proxy_set_header   Host                 $host;
        proxy_set_header   X-Real-IP            $remote_addr;
        proxy_set_header   X-Forwarded-For      $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto    $scheme;
        proxy_read_timeout 30s;
        # STRIP ALL — no client can inject trusted gateway headers
        proxy_set_header   X-Fapi-Internal-Token     "";
        proxy_set_header   X-Fapi-Verified            "";
        proxy_set_header   X-Fapi-Subject              "";
        proxy_set_header   X-Fapi-Client-Id            "";
        proxy_set_header   X-Fapi-Scope                "";
        proxy_set_header   X-Fapi-Dpop-Verified        "";
        proxy_set_header   X-Fapi-Dpop-Key-Thumbprint  "";
        proxy_set_header   X-Fapi-Interaction-Id       "";
    }

    location = /health { proxy_pass http://fapi_gateway; access_log off; }
    location / { return 404; }
    location ~* \.(php|env|git|svn)$ { return 444; }
}

server {
    listen 80;
    server_name {{NGINX_SERVER_NAME}};
    return 301 https://$host$request_uri;
}
```

### 5.2 Deployment output

**Docker Compose** — generate / append `docker-compose.yml`:
```yaml
version: '3.9'
services:
  nginx:
    image: nginx:alpine
    ports: ["443:443", "80:80"]
    volumes:
      - ./nginx/fapi-gateway.conf:/etc/nginx/conf.d/default.conf:ro
      - ./ssl:/etc/ssl/app:ro
    depends_on: [fapi-gateway]
    restart: unless-stopped

  fapi-gateway:
    build:     ./fapi-gateway
    env_file:  ./fapi-gateway/.env
    environment:
      REDIS_URL: redis://redis:6379
    depends_on:
      redis: { condition: service_healthy }
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --save 60 1 --loglevel warning
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s; retries: 5
```

**VPS** — generate:
- `nginx/fapi-gateway.conf`
- `systemd/fapi-gateway.service`
- `scripts/install-vps.sh` (installs Node, Redis, copies config, enables systemd)

**Kubernetes** — generate:
- `helm/fapi-gateway/Chart.yaml`
- `helm/fapi-gateway/values.yaml` (populated from ProjectProfile)
- `helm/fapi-gateway/templates/` (deployment, service, configmap, secret, ingress)

### PHASE 5 PASS CONDITIONS
- [ ] `nginx/fapi-gateway.conf` has zero `{{...}}` placeholders
- [ ] `nginx -t` exits 0 (if Nginx available in environment)
- [ ] All 7 X-Fapi-* strip headers present in `/api/` location block
- [ ] Deployment files generated for the detected/chosen target

---
