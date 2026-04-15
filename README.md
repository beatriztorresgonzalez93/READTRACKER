# ReadTracker

Aplicacion web fullstack para gestionar lecturas personales con autenticacion, biblioteca por usuario y ficha de detalle enriquecida.

## Stack actual

- Frontend: React 19 + TypeScript + Vite + React Router + Tailwind CSS v4
- UI: sistema de componentes shadcn + Base UI (`@base-ui/react`) + utilidades (`class-variance-authority`, `clsx`, `tailwind-merge`)
- Backend: Node.js + Express 5 + TypeScript + PostgreSQL (`pg`)
- Auth: JWT (`jsonwebtoken`) + hash de contrasena (`bcryptjs`)
- Arquitectura backend: `route -> controller -> service -> repository`

## Estructura del repositorio

```text
root/
  client/   # SPA React
  server/   # API REST Express
  docs/     # documentacion tecnica y funcional
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

API local: `http://localhost:4000/api/v1`

Variables backend importantes:
- `DATABASE_URL`: conexion a Neon Postgres.
- `JWT_SECRET`: secreto para firmar/verificar tokens JWT.
- `CLIENT_ORIGIN`: URL frontend unica para CORS.
- `CLIENT_ORIGINS`: varias URLs separadas por comas (si se usa, prioriza sobre `CLIENT_ORIGIN`).
- `CORS_ORIGIN_SUFFIXES`: sufijos de host HTTPS para previews (opcional).

### 2) Frontend

```bash
cd client
npm install
# crear .env a partir de .env.example
npm run dev
```

App local: `http://localhost:5173`

Variable frontend importante:
- `VITE_API_BASE_URL`: base URL del backend (incluye `/api/v1`).

## Scripts utiles

### Frontend (`client/`)
- `npm run dev`
- `npm run test`
- `npm run build`

### Backend (`server/`)
- `npm run dev`
- `npm run build`
- `npm run start`

## Estado funcional actual

- Registro, login y logout de usuarios.
- Rutas privadas en frontend (`/`, `/books/*`) con guard de autenticacion.
- Endpoints de auth (`/auth/register`, `/auth/login`, `/auth/me`).
- CRUD de libros protegido por JWT.
- Aislamiento por usuario (`books.user_id`): cada cuenta solo ve sus libros.
- Busqueda automatica de portadas con proveedores externos:
  - principal: Open Library,
  - fallback: Google Books.
- Formulario de libro con:
  - `publicationYear`,
  - progreso por estado (`pendiente` 0, `leyendo` editable, `leido` 100),
  - valoracion por estrellas en estado `leido`.

## Despliegue actual

- Frontend: `https://readtracker.vercel.app`
- Backend API: `https://readtracker-api.onrender.com/api/v1`

## Documentacion

La carpeta `docs/` contiene:
- `idea.md`
- `design.md`
- `components.md`
- `forms.md`
- `hooks.md`
- `context.md`
- `routing.md`
- `api.md`
- `api-client.md`
- `testing.md`
- `deployment.md`
- `agile.md`
- `project-management.md`
- `retrospective.md`
