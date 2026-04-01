# Deployment

## Frontend (Vercel/Netlify)

1. Configurar root en `client/`.
2. Comando build: `npm run build`.
3. Publicar carpeta `dist`.
4. Configurar variable `VITE_API_BASE_URL` con URL del backend.

## Backend (Render/Railway/Fly)

1. Configurar root en `server/`.
2. Comando build: `npm run build`.
3. Comando start: `npm run start`.
4. Variables:
   - `PORT`
   - `CLIENT_ORIGIN` (una URL del frontend) **o** `CLIENT_ORIGINS` (varias URLs separadas por coma)
   - `CORS_ORIGIN_SUFFIXES` (opcional): para previews de Vercel, añade el sufijo estable del host, p. ej. `-tuteam-projects.vercel.app`, para no tener que actualizar la lista en cada deploy

## Recomendacion

Primero desplegar backend y luego conectar frontend con su URL publica.
