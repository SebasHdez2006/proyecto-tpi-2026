# Notas para agentes

- Proyecto universitario TPI115 (guía en la raíz). Reglas duras: APIs REST
  programadas a mano (prohibido json-server/Supabase/Firebase/PostgREST/Hasura),
  sin sticky sessions (Redis central), HTTPS siempre, un solo código para
  internet e intranet (toda diferencia va en `.env`/overrides de compose).
- Backend: FastAPI en `backend/`, prefijo `/api/v1`, config por
  `app/core/config.py` (pydantic-settings, variables de entorno). OpenAPI en
  `/api/docs`.
- Frontend: React+Vite PWA en `frontend/` (`vite-plugin-pwa`, cola offline
  IndexedDB en `src/syncQueue.js`). `npm run build` genera `dist/` + `sw.js`.
- Despliegue: `deploy/docker-compose.yml` + overrides por entorno. Nginx sirve
  estáticos y balancea a app1/2/3 (least_conn). Certificados en `deploy/certs/`
  (autofirmado si faltan; mkcert recomendado).
- Verificación rápida: `curl -k https://localhost/api/v1/info` debe rotar
  `node_id` entre app1/app2/app3; `/api/v1/session` mantiene el contador
  aunque responda otro nodo.
- Migraciones: `alembic` dentro del contenedor app (`alembic upgrade head`).
- Prueba de carga: `tests/load/nodes.js` (k6) reporta hits por nodo.
