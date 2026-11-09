# Proyecto TPI115 2026 — Aplicación web

Aplicación web según la guía TPI115: **PWA instalable**, **3 nodos de
aplicación** detrás de un balanceador con TLS, **sesiones centralizadas en
Redis**, **PostgreSQL centralizado** y **un solo código con dos despliegues**
(internet / intranet, cambiando solo la configuración).

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite + vite-plugin-pwa + Bootstrap |
| Backend | Python + FastAPI (`/api/v1`, OpenAPI en `/api/docs`) |
| Frontal | Nginx (TLS, least_conn → app1/app2/app3, estáticos PWA) |
| Sesiones | Redis |
| Datos | PostgreSQL + SQLAlchemy + Alembic |
| Identidad | OIDC — issuer configurable (externo / Keycloak intranet) |

## Levantar la PoC (local)

```sh
cp deploy/env/.env.intranet deploy/env/.env    # o .env.internet
docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.intranet.yml up -d --build
```

Abrir `https://localhost` (aceptar el cert autofirmado o generar uno con
mkcert — ver `deploy/certs/README.md`).

Verificar:

```sh
curl -k https://localhost/api/v1/info      # repetir: node_id rota app1/app2/app3
curl -k https://localhost/api/v1/health    # redis + postgres
```

Migraciones:

```sh
docker compose -f deploy/docker-compose.yml exec app1 alembic upgrade head
```

## Cambio de entorno

El mismo código cambia de despliegue copiando el `.env` correspondiente y el
override de compose. Nada en el código fuente depende del entorno.

| Variable | Qué controla |
|---|---|
| `OIDC_ISSUER` | Proveedor de identidad (Google/Auth0 ↔ Keycloak) |
| `DATABASE_URL` / `REDIS_URL` | Servidores de datos |
| `CDN_BASE_URL` | URL base de fuentes/íconos/imágenes |
| `CORS_ORIGINS` | Orígenes permitidos (otros equipos) |

## Desarrollo local sin Docker

```sh
# backend (requiere Redis y Postgres accesibles; ver env vars)
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload

# frontend
cd frontend && npm install && npm run dev
```

## Estructura

```
backend/    FastAPI — app/api/v1 (info, session, health), core/config, db, models, alembic
frontend/   React+Vite PWA — manifest, Service Worker, IndexedDB sync queue
deploy/     nginx.conf, Dockerfile multi-stage, docker-compose + overrides, envs, certs
docs/       fase0/ (selección, herramientas, arquitectura) + etapas/ (plantillas 1-5)
tests/load/ k6 — distribución del balanceo
```

## Documentos

- Guía: `2026_Guía del proyecto_ desarrollo de una aplicación web.md`
- Fase 0: `docs/fase0/` — selección tecnológica, herramientas, arquitectura
- Etapas 1–5: `docs/etapas/` — plantillas listas para el problema asignado
