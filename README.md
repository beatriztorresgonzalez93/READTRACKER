# ReadTracker

Aplicacion web fullstack para gestionar lecturas y libros personales, con una base limpia y facil de evolucionar paso a paso.

## Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS + React Router
- Backend: Node.js + Express + TypeScript
- Arquitectura backend: route -> controller -> service -> repository

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
- `DATABASE_URL`: cadena de conexión de Neon Postgres.
- `CLIENT_ORIGIN`: URL del frontend para CORS.

### 2) Frontend

```bash
cd client
npm install
# crear .env a partir de .env.example
npm run dev
```

App disponible en `http://localhost:5173`.

## Documentacion

La carpeta `docs/` incluye decisiones de arquitectura, API, routing, formularios, hooks, contexto, testing y deployment.

## Espacios para completar

- Trello: [pendiente]
- Frontend URL (deploy): [pendiente]
- Backend URL (deploy): [pendiente]
