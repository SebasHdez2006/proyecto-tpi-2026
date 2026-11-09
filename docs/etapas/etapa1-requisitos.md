# Etapa 1 — Especificación de Requisitos (SRS)

> Plantilla — completar cuando el docente asigne el problema.
> Convenciones y simbología: `../convenciones.md`

## 1. Introducción
- Propósito, alcance, definiciones y acrónimos.
- Problema asignado: _(pegar enunciado)_

## 2. Descripción general
- Perspectiva del producto (encaje con los sistemas de otros equipos: qué APIs
  expone este sistema y cuáles consume).
- Usuarios y roles.
- Restricciones heredadas de la guía (PWA, clúster, OIDC, dual internet/intranet).

## 3. Requisitos funcionales
| ID | Requisito | Prioridad |
|---|---|---|
| RF-01 | … | Alta |

## 4. Requisitos no funcionales
- Disponibilidad (cualquier nodo atiende a cualquier usuario).
- Offline-first: operaciones encoladas y sincronizadas.
- Seguridad: OWASP Top 10, OIDC, TLS.
- Tiempos de espera/reintentos y comportamiento ante caída de sistemas externos.

## 5. APIs externas a consumir / exponer
| Sistema | Endpoint | Dirección | Auth |
|---|---|---|---|
