# Etapa 5 — Implementación y manual de instalación

> Plantilla — completar para la puesta en producción y la defensa.

## 1. Requisitos previos
- Docker + Compose, DNS del dominio, certificados.

## 2. Despliegue modo INTERNET
```sh
cp deploy/env/.env.internet deploy/env/.env   # ajustar valores reales
docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.internet.yml up -d --build
```
- Certificados Let's Encrypt en `deploy/certs/` (ver `deploy/certs/README.md`).

## 3. Despliegue modo INTRANET
```sh
cp deploy/env/.env.intranet deploy/env/.env
docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.intranet.yml up -d --build
# IdP propio opcional:
docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.intranet.yml --profile idp up -d
```
- CA interna (step-ca/OpenSSL) y **instalación del certificado raíz en cada
  smartphone** — requisito para instalar la PWA (ver `deploy/certs/README.md`).

## 4. Migraciones y datos de prueba
```sh
docker compose exec app1 alembic upgrade head
```

## 5. Verificación post-despliegue
- `https://<dominio>/api/v1/health` → `{"status":"ok"}`.
- `/api/v1/info` rota entre nodos; sesión persiste entre nodos.
- PWA instalable; offline funciona.

## 6. Defensa
- Demo en vivo: balanceo, sesión compartida, offline, cambio de entorno solo
  con configuración, consumo de API de otro equipo.
