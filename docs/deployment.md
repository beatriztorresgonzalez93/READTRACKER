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
   - `DATABASE_URL=<neon-connection-string>`
   - `JWT_SECRET=<random-long-secret>`
   - `CLIENT_ORIGIN=<frontend-url>` o `CLIENT_ORIGINS=<url1,url2,...>`
   - `CORS_ORIGIN_SUFFIXES` (opcional para previews)

## Orden recomendado de despliegue

1. Desplegar backend y validar `GET /api/v1/health`.
2. Configurar `VITE_API_BASE_URL` en frontend con backend publico.
3. Desplegar frontend.
4. Probar flujo completo: register -> login -> CRUD libros.

## Nota de sincronizacion de rama

Si Render despliega una rama distinta de la que tiene auth, `/auth/*` devolvera `Ruta no encontrada`.
Confirma siempre la rama desplegada y el ultimo commit.
