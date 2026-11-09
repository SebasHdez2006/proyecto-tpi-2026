# Etapa 3 — Diseño

> Plantilla — completar tras el análisis.
> Convenciones y simbología: `../convenciones.md`

## 1. Arquitectura detallada
- Ver `docs/fase0/arquitectura.md`; aquí se especializa al problema.

## 2. Diseño de base de datos
- Diagrama ER + diccionario de datos → se implementa con migraciones Alembic.

## 3. Contrato de API REST
- Recursos, verbos, códigos de estado, paginación, versionado `/api/v1`.
- Borrador OpenAPI (FastAPI lo expone en `/api/docs` y `/api/openapi.json`).
- Endpoints de servicio-a-servicio (`X-Service-Key`) para otros equipos.

## 4. Diseño PWA / offline
- Estrategias de caché por recurso, qué opera offline, cola de sincronización.

## 5. Diseño de seguridad
- OIDC (issuer por entorno), roles/permisos, CORS entre proyectos, cabeceras.

## 6. Prototipo navegable
- Enlace a Figma / capturas.
