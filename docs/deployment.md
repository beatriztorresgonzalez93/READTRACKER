# Deployment

## Frontend (Vercel)

1. Root directory: `client/`
2. Build command: `npm run build`
3. Output: `dist`
4. Variable obligatoria:
   - `VITE_API_BASE_URL=https://readtracker-api.onrender.com/api/v1`
5. El proyecto ya incluye `client/vercel.json` para reescritura SPA.

## Backend (Render)

1. Root directory: `server/`
2. Build command: `npm run build`
3. Start command: `npm run start`
4. Variables recomendadas:
   - `PORT=4000`
   - `NODE_ENV=production`
   - `DATABASE_URL=<neon-connection-string>`
   - `JWT_SECRET=<random-long-secret>`
   - `CLIENT_ORIGIN=<frontend-url>` o `CLIENT_ORIGINS=<url1,url2,...>`
   - `CORS_ORIGIN_SUFFIXES` (opcional para previews)
   - `CORS_ALLOW_VERCEL_PREVIEWS=false` (recomendado en producción estable)
   - `RATE_LIMIT_WINDOW_MS=60000`
   - `RATE_LIMIT_MAX_REQUESTS=120`

5. Endurecimiento operativo aplicado:
   - `helmet` activo para cabeceras de seguridad.
   - `express-rate-limit` activo en toda la API.
   - CORS estricto por entorno (orígenes explícitos).
   - Logs estructurados JSON con `request-id`, endpoint, status y duración.
   - Healthcheck (`/api/v1/health`) con verificación de conexión a DB.
   - Migraciones versionadas automáticas en arranque (`schema_migrations`).
   - Graceful shutdown en `SIGTERM/SIGINT` (cierre ordenado de HTTP + pool DB).
   - Fail-fast en producción si `CLIENT_ORIGIN(S)` no está definido o usa localhost.

## CI/CD (GitHub Actions)

- Workflow: `.github/workflows/ci.yml`
- Se ejecuta en `pull_request` y en `push` a `main`.
- Corre:
  - `client`: `npm run smoke:predeploy`
  - `server`: `npm run smoke:predeploy`
- Resultado: PR/release bloqueada si falla build o tests.

## Valores recomendados por entorno

| Variable | Dev (local) | Staging | Prod |
| --- | --- | --- | --- |
| `NODE_ENV` | `development` | `production` | `production` |
| `DATABASE_URL` | DB local o Neon de desarrollo | Neon de staging | Neon de producción |
| `JWT_SECRET` | valor local no compartido | secreto robusto (>=32 chars) | secreto robusto (>=32 chars), rotado periódicamente |
| `CLIENT_ORIGIN` / `CLIENT_ORIGINS` | `http://localhost:5173` | URL pública de staging | URL pública de producción |
| `CORS_ALLOW_VERCEL_PREVIEWS` | `true` | `true` (si usáis previews) | `false` (recomendado) |
| `RATE_LIMIT_WINDOW_MS` | `60000` | `60000` | `60000` |
| `RATE_LIMIT_MAX_REQUESTS` | `300` (menos fricción en dev) | `180` | `120` |
| `PORT` | `4000` | asignado por plataforma o `4000` | asignado por plataforma o `4000` |

Notas rápidas:

- En Render, si `PORT` viene inyectado por la plataforma, no es necesario fijarlo manualmente.
- En Neon, separa proyectos/roles por entorno (`dev`, `staging`, `prod`) para evitar cruces de datos.
- En producción, evita habilitar previews abiertas por CORS salvo necesidad explícita.

## Orden recomendado de despliegue

### Release (paso a paso)

1. Ejecutar smoke local:
   - `server/`: `npm run smoke:predeploy`
   - `client/`: `npm run smoke:predeploy`
2. Confirmar variables de entorno en Render/Neon (prod):
   - `DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN(S)`,
   - `CORS_ALLOW_VERCEL_PREVIEWS=false`,
   - `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`.
3. Desplegar backend en Render.
4. Validar backend en producción:
   - `GET /api/v1/health` devuelve `status: ok`,
   - revisar logs estructurados y ausencia de errores 5xx.
5. Configurar/confirmar `VITE_API_BASE_URL` en frontend con backend público.
6. Desplegar frontend en Vercel.
7. Ejecutar sanity de negocio:
   - `register -> login`,
   - crear libro,
   - marcar página -> aparece en historial,
   - borrar sesión -> desaparece y ajusta progreso.

### Rollback (paso a paso)

1. Frontend:
   - revertir deployment en Vercel a la release estable previa.
2. Backend:
   - rollback en Render al deploy estable previo.
3. Variables:
   - verificar que no quedaron env vars parcialmente cambiadas.
4. Datos:
   - si hubo script de mantenimiento, revisar resultado (no re-ejecutar sin diagnóstico).
5. Validación post-rollback:
   - `GET /api/v1/health`,
   - login,
   - lectura y borrado de sesión en historial.
6. Comunicar incidente y abrir follow-up con causa raíz.

## Nota de sincronizacion de rama

Si Render despliega una rama distinta de la que tiene auth, `/auth/*` devolvera `Ruta no encontrada`.
Confirma siempre la rama desplegada y el ultimo commit.
