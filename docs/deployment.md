# Deployment

## Frontend (Vercel/Netlify)

1. Configurar root en `client/`.
2. Comando build: `npm run build`.
3. Publicar carpeta `dist`.
4. Configurar variable `VITE_API_BASE_URL` con URL del backend.
5. Para SPA con React Router, este proyecto incluye `client/vercel.json` para reescribir rutas a `index.html`.

## Backend (Render/Railway/Fly)

1. Configurar root en `server/`.
2. Comando build: `npm run build`.
3. Comando start: `npm run start`.
4. Variables:
   - `PORT`
   - `CLIENT_ORIGIN` (una URL del frontend) **o** `CLIENT_ORIGINS` (varias URLs separadas por coma). En desarrollo local, si usas Vite, incluye al menos `http://localhost:5173` y, por si el puerto está ocupado, `http://localhost:5174`.
   - `CORS_ORIGIN_SUFFIXES` (opcional): para previews de Vercel, añade el sufijo estable del host, p. ej. `-tuteam-projects.vercel.app`, para no tener que actualizar la lista en cada deploy
   - `DATABASE_URL`
5. Este backend tambien acepta orígenes `https://*.vercel.app` para reducir fallos de CORS con dominios dinámicos de Vercel.

## URLs actuales del proyecto

- Frontend: `https://readtracker.vercel.app`
- Backend API base: `https://readtracker-api.onrender.com/api/v1`

## Recomendacion

Primero desplegar backend y luego conectar frontend con su URL publica.
