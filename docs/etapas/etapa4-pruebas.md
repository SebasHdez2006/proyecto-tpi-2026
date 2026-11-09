# Etapa 4 — Desarrollo y reporte de pruebas

> Plantilla — completar durante la implementación.
> Convenciones y simbología: `../convenciones.md`

## 1. Cobertura implementada
- Funcionalidades entregadas vs. requisitos (trazabilidad RF-xx ↔ commits).

## 2. Pruebas unitarias / integración
- Backend: `pytest` (routers, servicios, acceso a datos).
- Frontend: `vitest` (componentes, cola offline).

## 3. Pruebas de API
- Colección Bruno/Postman + casos de error (401, 404, 422, 503 externo caído).

## 4. Pruebas de balanceo y resiliencia
- `tests/load/nodes.js` (k6): distribución entre app1/app2/app3.
- `docker compose stop app2` → el sistema sigue respondiendo.
- Sesión sobrevive a la caída del nodo que la creó.

## 5. Pruebas PWA
- Lighthouse (installable, SW registrado), operación offline y re-sincronización.

## 6. Resultados
| Prueba | Resultado | Evidencia |
|---|---|---|
