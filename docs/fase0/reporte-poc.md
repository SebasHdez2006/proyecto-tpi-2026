# Fase 0 — Reporte de la Prueba de Concepto (PoC)

**Estado:** Aprobado · **Fecha:** 2026-11-09

> Requisito de la guía: *"una PWA de ejemplo instalable, detrás del servidor
> frontal con tres nodos, que muestre qué nodo respondió, con sesión
> compartida, y que cambie de entorno modificando solo la configuración"*.
>
> Este reporte documenta, para cada condición, el artefacto que la cumple, la
> evidencia capturada y los comandos para reproducirla.
> Convenciones y simbología: `../convenciones.md`.

## 1. Alcance de la PoC

Aplicación de ejemplo que **no es el producto final**: su único propósito es
demostrar que la pila tecnológica seleccionada (ver
`seleccion-tecnologica.md`) satisface todas las restricciones obligatorias de
la guía antes de conocer el problema asignado.

Componentes desplegados (`deploy/docker-compose.yml`):

| Servicio | Rol | Imagen |
|---|---|---|
| `nginx` | Servidor frontal: TLS, balanceo round-robin, estáticos PWA | `deploy-nginx` (build multi-stage) |
| `app1`, `app2`, `app3` | Nodos de aplicación FastAPI (misma imagen, `NODE_ID` distinto) | `deploy-app*` (python:3.12-slim) |
| `redis` | Almacén central de sesiones | `redis:7-alpine` |
| `postgres` | Base de datos centralizada | `postgres:16-alpine` |

## 2. Evidencia por requisito de la guía

### 2.1 PWA instalable

**Artefactos:** `frontend/vite.config.js` (manifest + `vite-plugin-pwa`/Workbox),
`frontend/public/icons/`, Service Worker generado en `dist/sw.js`.

**Evidencia** — recursos servidos por HTTPS:

```
GET /manifest.webmanifest → 200
  {"name":"TPI115 App","display":"standalone","icons":[192px, 512px, maskable]}
GET /sw.js                  → 200 (1542 B, Workbox generado)
GET /icons/icon-192.png     → 200
```

La app muestra el botón **"Instalar app"** al cumplir los criterios de
instalabilidad (manifest válido + SW registrado + contexto seguro HTTPS).
El SW precachea el app-shell y aplica `NetworkFirst` a `/api/` con timeout de
5 s; las operaciones offline se encolan en IndexedDB (`src/syncQueue.js`) y se
sincronizan al volver la conexión (evento `online`).

### 2.2 Detrás del servidor frontal

**Artefacto:** `deploy/nginx/nginx.conf` — `upstream app_cluster` con
`proxy_pass` en `location /api/`; estáticos PWA en `location /`.

**Evidencia** — único punto de entrada; los nodos no exponen puertos al host:

```
NAME                STATUS                    PORTS
deploy-nginx-1      Up (healthy)              0.0.0.0:443->443, 0.0.0.0:8080->80
deploy-app1-1       Up                        8000/tcp      ← sin mapeo a host
deploy-app2-1       Up                        8000/tcp
deploy-app3-1       Up                        8000/tcp
deploy-postgres-1   Up (healthy)              5432/tcp
deploy-redis-1      Up (healthy)              6379/tcp
```

Además: terminación TLS en 443, redirección `HTTP :8080 → 301 HTTPS`, health
checks pasivos (`max_fails=3 fail_timeout=10s`) y failover con
`proxy_next_upstream`.

### 2.3 Tres nodos e identificación del nodo que respondió

**Artefacto:** `GET /api/v1/info` (`backend/app/api/v1/routers/info.py`)
devuelve `node_id` y `hostname` del contenedor.

**Evidencia** — rotación round-robin verificada:

```
$ for i in 1 2 3 4 5 6; do curl -sk https://localhost/api/v1/info \
    | jq -r .node_id; done
app3
app1
app2
app3
app1
app2
```

### 2.4 Sesión compartida (sin sticky sessions)

**Artefacto:** `backend/app/api/v1/routers/session.py` — cookie opaca
`tpi115_session` (`HttpOnly`, `Secure`, `SameSite=Lax`) cuyo estado vive en
**Redis** con TTL configurable. Ningún nodo guarda sesión en memoria local.

**Evidencia** — sesión creada en `app1`, atendida luego por los tres nodos con
el contador incrementando correctamente:

```
$ curl -sk -c cj -X POST .../session/login -d '{"username":"demo"}'  → app1
$ curl -sk -b cj .../session  (×5)
visits= 1 | served_by= app2 | created_on= app1
visits= 2 | served_by= app2 | created_on= app1
visits= 3 | served_by= app3 | created_on= app1
visits= 4 | served_by= app1 | created_on= app1
visits= 5 | served_by= app2 | created_on= app1
```

`created_on_node` permanece `app1` mientras `served_by` rota — la sesión es del
clúster, no del nodo.

### 2.5 Cambio de entorno modificando solo la configuración

**Artefactos:** `deploy/env/.env.internet` / `.env.intranet` +
`deploy/docker-compose.internet.yml` / `docker-compose.intranet.yml`.

**Evidencia** — la única diferencia entre despliegues:

| Variable | internet | intranet |
|---|---|---|
| `DOMAIN` | `app.ejemplo.com` | `app.intranet.local` |
| `OIDC_ISSUER` | `accounts.google.com` (externo) | Keycloak propio (`--profile idp`) |
| `CDN_BASE_URL` | CDN público | CDN propio / self-hosted |
| `CORS_ORIGINS` | `https://app.ejemplo.com` | `https://app.intranet.local` |

Mismo código, mismas imágenes: `cp env/.env.<entorno> env/.env` + el override
correspondiente. Nada en `backend/` ni `frontend/` depende del entorno.

## 3. Evidencia adicional

### 3.1 Salud del clúster

```
$ curl -sk https://localhost/api/v1/health
{"status":"ok","checks":{"redis":"ok","database":"ok"}}
```

### 3.2 Resiliencia ante caída de un nodo

```
$ docker compose stop app2
$ curl .../api/v1/info (×6) → 200 app1 | 200 app3 | 200 app3 | 200 app1 | 200 app1 | 200 app1
```

Nginx saca `app2` del upstream tras `max_fails` y el sistema sigue
respondiendo; la sesión en Redis no se pierde.

### 3.3 Distribución de carga (k6)

`tests/load/nodes.js` — 10 VUs × 30 s contra `/api/v1/info`, reporta hits por
nodo (`hits_app1/2/3`) para demostrar la repartición del balanceo.

### 3.4 Migraciones versionadas

```
$ docker compose exec app1 alembic upgrade head
INFO  [alembic.runtime.migration] Running upgrade  -> 0001, initial schema
```

## 4. Reproducción

```sh
git clone https://github.com/SebasHdez2006/proyecto-tpi-2026
cd proyecto-tpi-2026
cp deploy/env/.env.intranet deploy/env/.env
docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.intranet.yml up -d --build
# https://localhost  (cert autofirmado o mkcert — ver deploy/certs/README.md)
```

## 5. Limitaciones declaradas

| Limitación | Justificación / plan |
|---|---|
| Certificado local autofirmado | En producción: Let's Encrypt (internet) o CA interna (intranet); mkcert para desarrollo de confianza |
| Redis y PostgreSQL son SPOF | Aceptado por la guía documentándolo; mejora opcional: Sentinel / réplica |
| Login demo sin OIDC real | El `OIDC_ISSUER` ya es configurable; la validación JWT completa llega en Etapa 4 junto con los requisitos del problema |
| Balanceo round-robin | Elegido para rotación visible en la demo; `least_conn` disponible como alternativa comentada en `nginx.conf` |
