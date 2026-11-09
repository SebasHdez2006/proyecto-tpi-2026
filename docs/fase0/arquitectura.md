# Fase 0 — Arquitectura de referencia

```mermaid
flowchart TB
    U[Usuario<br/>PWA en smartphone / desktop<br/>HTTPS]

    subgraph Frontal
        NG[Nginx<br/>TLS + balanceo least_conn<br/>estáticos PWA + health checks]
    end

    subgraph Cluster["Clúster de aplicación (FastAPI)"]
        A1[Nodo 1<br/>app1:8000]
        A2[Nodo 2<br/>app2:8000]
        A3[Nodo 3<br/>app3:8000]
    end

    subgraph Datos
        R[(Redis<br/>sesiones centralizadas)]
        DB[(PostgreSQL<br/>base de datos centralizada)]
    end

    subgraph Identidad
        IDP[Proveedor OIDC<br/>internet: externo<br/>intranet: Keycloak]
    end

    EXT[APIs de otros equipos<br/>REST + X-Service-Key]

    U -->|HTTPS| NG
    NG --> A1
    NG --> A2
    NG --> A3
    A1 --> R
    A2 --> R
    A3 --> R
    A1 --> DB
    A2 --> DB
    A3 --> DB
    A1 -.->|valida JWT| IDP
    A2 -.->|valida JWT| IDP
    A3 -.->|valida JWT| IDP
    Cluster <-->|REST| EXT
```

## Decisiones

- **Sin sticky sessions**: cualquier nodo atiende a cualquier usuario porque la
  sesión vive en Redis (cookie opaca `tpi115_session` + TTL configurable).
- **Nginx termina TLS** y sirve los estáticos de la PWA; `/api/*` se proxifica
  al upstream con `least_conn` y `proxy_next_upstream` para reintentar en otro
  nodo si uno falla.
- **Puntos únicos de fallo aceptados** (alcance del proyecto): Redis y
  PostgreSQL. Mejora opcional documentada: Redis Sentinel / réplica de BD.
- **Configuración por entorno**: `.env` (`OIDC_ISSUER`, `DATABASE_URL`,
  `REDIS_URL`, `CDN_BASE_URL`, `CORS_ORIGINS`, credenciales) + override de
  compose (`docker-compose.internet.yml` / `docker-compose.intranet.yml`).
- **Advertencia PWA-intranet**: instalar la PWA en un celular exige HTTPS de
  confianza; con CA interna hay que instalar el certificado raíz en el
  dispositivo (ver `deploy/certs/README.md` y el manual de instalación).
