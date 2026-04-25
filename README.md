# ReadTracker

Aplicacion web fullstack para gestionar lecturas personales, registrar progreso por pagina y analizar actividad de lectura con estadisticas e historial.

## ✨ Funcionalidades principales

- Autenticacion con JWT y aislamiento estricto por usuario.
- Perfil de cuenta desde el header (nombre, apellidos, correo, foto, fechas de alta); actualizacion con `PATCH /auth/me`.
- Biblioteca personal con CRUD de libros, panel lateral de detalle y **listado paginado** (12 libros por peticion; boton para cargar mas debajo de la rejilla). Resumen global de totales y generos vía `GET /books/summary`.
- Reseñas personales por libro con valoración por estrellas, etiquetas y recomendación.
- Marcado de pagina con registro de sesiones de lectura en backend.
- Historial mensual con calendario de intensidad y detalle diario.
- Borrado de sesiones con recalculo automatico de progreso del libro.
- Estadisticas de lectura (ritmo, rachas, actividad anual, generos, valoraciones y **compras desde lista de deseos** con desglose por mes).
- Lista de deseos y adquisiciones con flujo independiente.

## 🧱 Stack y arquitectura

- Frontend: React 19 + TypeScript + Vite + React Router + Tailwind CSS v4.
- UI: shadcn + Base UI (`@base-ui/react`) + `class-variance-authority`, `clsx`, `tailwind-merge`.
- Backend: Node.js + Express 5 + TypeScript + PostgreSQL (`pg`).
- Auth: `jsonwebtoken` + `bcryptjs`.
- Arquitectura backend: `route -> controller -> service -> repository`.
- Infra actual: Vercel (frontend), Render (API), Neon (Postgres).

## 🗂️ Estructura del repositorio

```text
root/
  client/   # SPA React
  server/   # API REST Express
  docs/     # Documentacion tecnica y funcional
  README.md
```

## 🚀 Puesta en marcha local

### 1) Backend (`server/`)

```bash
cd server
npm install
# crear .env a partir de .env.example
npm run dev
```

API local: `http://localhost:4000/api/v1`

Variables backend importantes:

- `DATABASE_URL`: conexion a Postgres (Neon en cloud).
- `JWT_SECRET`: secreto para firmar/verificar tokens JWT.
- `NODE_ENV`: `development` o `production`.
- `CLIENT_ORIGIN`: URL frontend unica para CORS.
- `CLIENT_ORIGINS`: varias URLs separadas por comas (prioriza sobre `CLIENT_ORIGIN`).
- `CORS_ORIGIN_SUFFIXES`: sufijos HTTPS permitidos para previews (opcional).
- `CORS_ALLOW_VERCEL_PREVIEWS`: `true/false` para aceptar `*.vercel.app`.
- `RATE_LIMIT_WINDOW_MS`: ventana del rate limit en ms (default `60000`).
- `RATE_LIMIT_MAX_REQUESTS`: maximo de peticiones por ventana (default `120`).

### 2) Frontend (`client/`)

```bash
cd client
npm install
# crear .env a partir de .env.example
npm run dev
```

App local: `http://localhost:5173`

Variable frontend importante:

- `VITE_API_BASE_URL`: base URL de la API (incluye `/api/v1`).

## 🧪 Scripts utiles

### Frontend (`client/`)

- `npm run dev`
- `npm run build`
- `npm run test`
- `npm run smoke:predeploy` (build + test)

### Backend (`server/`)

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run test`
- `npm run smoke:predeploy` (build + test)
- `npm run cleanup:reading-sessions` (limpieza puntual de duplicados historicos)

## 🔐 Seguridad y operacion

- `helmet` activo para cabeceras de seguridad.
- `express-rate-limit` activo con limites configurables por entorno.
- CORS estricto por origen y politicas de previews controladas por env vars.
- Logs estructurados JSON con `request-id`, endpoint, status y duracion.
- Healthcheck `GET /api/v1/health` con verificacion de DB.
- Startup checks claros (configuracion, conexion DB, schema, listen).

## ✅ Testing y calidad

- Frontend: Vitest + React Testing Library.
- Backend: Vitest (repositorios y consistencia de datos).
- Cobertura clave de `reading-sessions`:
  - create idempotente (dedupe),
  - delete con recalculo de progreso,
  - permisos por usuario.
- Flujos criticos de historial cubiertos en tests de integracion frontend.

## 🌍 Despliegue actual

- Frontend: `https://readtracker.vercel.app`
- Backend API: `https://readtracker-api.onrender.com/api/v1`

## 📚 Documentacion

La carpeta `docs/` contiene guias funcionales y operativas:

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
- `runbook-incidents.md`
- `agile.md`
- `project-management.md`
- `retrospective.md`

Para release y rollback, revisar primero `docs/deployment.md`.
Para incidencias de DB/API/UI, revisar `docs/runbook-incidents.md`.
