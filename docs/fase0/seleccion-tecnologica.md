# Fase 0 — Selección de tecnologías

> Principio rector: **un solo código, dos despliegues**. Todo lo que cambia
> entre internet e intranet vive en archivos `.env` / overrides de compose,
> nunca en el código fuente.

## Tabla de componentes

| Componente | Tecnología | Justificación | Config. internet | Config. intranet |
|---|---|---|---|---|
| Framework JS | React 18 + Vite | Ecosistema mayor, build rápido, plugin PWA maduro | igual | igual |
| Framework CSS | Bootstrap 5 (bundled) | Responsive sin depender de CDN en runtime | bundle propio | bundle propio |
| PWA | vite-plugin-pwa + Workbox | SW generado con estrategias de caché, manifest, autoUpdate | igual | igual |
| CDN / assets | `VITE_CDN_BASE_URL` | Fuentes/íconos/imágenes por URL base configurable | CDN público | CDN propio o self-hosted |
| Backend | Python 3.12 + FastAPI | OpenAPI automático, validación pydantic, async | igual | igual |
| Servidor app | Uvicorn | ASGI estándar, liviano | 3 contenedores | 3 contenedores |
| Balanceador / frontal | Nginx | TLS, upstream least_conn a 3 nodos, estáticos PWA, health checks | cert Let's Encrypt | cert CA interna |
| Sesiones | Redis 7 | Store central: cualquier nodo atiende cualquier sesión (sin sticky) | contenedor/managed | contenedor |
| Base de datos | PostgreSQL 16 | Centralizada, ACID, madura | host configurable | host configurable |
| ORM / migraciones | SQLAlchemy + Alembic | Migraciones versionadas, acceso con código propio | igual | igual |
| Identidad | OAuth2/OIDC — issuer por env | `OIDC_ISSUER` configurable: externo o propio | Google / Auth0 / Entra | Keycloak (perfil `idp`) |
| API entre sistemas | REST + API key (`X-Service-Key`) | Endpoints programados a mano; timeouts y reintentos | URL por env | URL por env |
| TLS | OpenSSL/mkcert/step-ca | HTTPS obligatorio en todos los entornos | Let's Encrypt | CA interna + raíz en smartphones |
| Contenedores | Docker + Compose | Reproduce el clúster en una máquina | compose + override | compose + override |
| Pruebas de carga | k6 | Demuestra distribución del balanceo | — | — |
| Docs API | OpenAPI/Swagger (`/api/docs`) | Contrato documentado automáticamente | igual | igual |

## Descartadas

- **json-server, Supabase, Firebase, PostgREST, Hasura**: prohibidas — las APIs
  se programan en el backend.
- **Sticky sessions**: prohibidas como solución de sesión; se usa Redis central.
- **Firebase Auth / solo-externo**: exigiría internet; reemplazable por Keycloak
  en intranet gracias al issuer OIDC configurable.
