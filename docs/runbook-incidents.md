# Runbook de Incidentes

Guía corta para diagnóstico inicial cuando falla DB, API o UI.

## 1) Si falla DB (Neon / conexión)

Síntomas típicos:

- `GET /api/v1/health` responde `503`,
- errores de conexión o timeout a Postgres en logs.

Qué mirar primero:

1. `DATABASE_URL` en Render (formato correcto, sin espacios).
2. estado del proyecto Neon (up/down, límites, credenciales).
3. logs de backend: errores en `startup.check` o consultas.

Acciones rápidas:

- revalidar secreto/URL de conexión,
- reiniciar servicio backend tras corregir env vars,
- confirmar recuperación con `GET /api/v1/health`.

## 2) Si falla API (5xx/4xx anómalos)

Síntomas típicos:

- incremento de `5xx`,
- respuestas `401/403` inesperadas,
- rate limit `429` excesivo.

Qué mirar primero:

1. logs estructurados (request-id, endpoint, status, durationMs).
2. cambios recientes en release (backend/env vars/CORS).
3. `JWT_SECRET`, `CLIENT_ORIGIN(S)`, `CORS_ALLOW_VERCEL_PREVIEWS`,
   `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`.

Acciones rápidas:

- si hay regresión clara, hacer rollback de backend,
- ajustar rate limit si está bloqueando tráfico legítimo,
- validar CORS con origen real del frontend.

## 3) Si falla UI (frontend)

Síntomas típicos:

- errores de red en navegador,
- pantalla en blanco o rutas que no cargan,
- acciones de historial sin reflejo visual.

Qué mirar primero:

1. `VITE_API_BASE_URL` en Vercel.
2. consola del navegador (fetch, CORS, auth).
3. endpoint `GET /api/v1/health` (si backend está sano).

Acciones rápidas:

- rollback de frontend en Vercel si el fallo empezó tras deploy,
- limpiar caché y revalidar ruta afectada,
- comprobar sesión expirada (`401`) y relogin.

## 4) Escalado y cierre

1. Si no se recupera en 15-30 min, escalar y aplicar rollback.
2. Registrar:
   - hora inicio/fin,
   - impacto,
   - causa raíz preliminar,
   - mitigación aplicada.
3. Crear tarea post-mortem con acciones preventivas.
