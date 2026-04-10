# ReadTracker

Aplicación web fullstack para gestionar lecturas y libros personales, con una base clara y fácil de evolucionar.

## Stack

### Frontend (`client/`)

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS 4** (plugin `@tailwindcss/vite`)
- **React Router 6**
- **Estilo de componentes:** patrón tipo shadcn con **class-variance-authority**, **clsx** y **tailwind-merge** (`src/components/ui/`, `src/lib/utils.ts`)
- **Tests:** Vitest + Testing Library

### Backend (`server/`)

- **Node.js** + **Express 5** + **TypeScript**
- **PostgreSQL** vía cliente `pg` (p. ej. Neon)
- Arquitectura: **route → controller → service → repository**

### Tipografía (ficha de detalle)

En `client/index.html` se cargan **Fraunces** (titulares) y **DM Sans** (cuerpo) para la página de detalle del libro. El resto de la app sigue usando la fuente definida en `client/src/index.css` (Inter / sistema).

## Estructura del repositorio

```text
root/
  client/
  server/
  docs/
  README.md
```

## Ejecutar en local

### 1) Backend

```bash
cd server
npm install
# crear .env a partir de .env.example
npm run dev
```

API disponible en `http://localhost:4000/api/v1`.

Variables backend importantes:

- `DATABASE_URL`: cadena de conexión PostgreSQL (p. ej. Neon).
- `CLIENT_ORIGIN`: URL del frontend para CORS (una sola).
- `CLIENT_ORIGINS`: lista separada por comas si necesitas varios orígenes; si está definida, sustituye el uso de `CLIENT_ORIGIN` para CORS. **En local** conviene incluir `http://localhost:5173` y `http://localhost:5174` por si Vite usa el puerto alternativo.
- `CORS_ORIGIN_SUFFIXES`: sufijos de host separados por coma; orígenes `https://...` que terminen en uno de ellos pasan CORS (útil para previews de Vercel).
- Nota: el backend también permite orígenes `https://*.vercel.app` para reducir bloqueos de CORS en despliegues dinámicos.

### 2) Frontend

```bash
cd client
npm install
# opcional: copiar .env.example a .env y ajustar VITE_API_BASE_URL
npm run dev
```

La app suele abrirse en `http://localhost:5173`; si el puerto está ocupado, Vite puede usar **5173** u otro (comprueba la URL en la terminal).

Variable opcional del cliente:

- `VITE_API_BASE_URL`: base de la API (por defecto `http://localhost:4000/api/v1` si no se define).

## Documentación

La carpeta `docs/` incluye decisiones de arquitectura, API, routing, formularios, componentes, diseño, testing y despliegue. Conviene mantenerla alineada con el código al cambiar rutas o dependencias.

## Enlaces útiles

- Trello: [ReadTracker board](https://trello.com/b/g4VaV0oc)
- Frontend (deploy): `https://readtracker.vercel.app`
- Backend (deploy): `https://readtracker-api.onrender.com/api/v1`
