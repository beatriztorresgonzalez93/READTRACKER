# Design

## Decisión de arquitectura

Monorepo simple con dos aplicaciones:
- `client/`: React + TypeScript.
- `server/`: Express + TypeScript.

Se evita sobreingeniería: capas claras, tipos fuertes y responsabilidades separadas.

## Flujo de datos

Frontend llama API REST (`/api/v1/books`) mediante cliente tipado.

Flujo backend:
`route -> controller -> service -> repository`

- Route: mapea endpoint HTTP.
- Controller: traduce req/res.
- Service: aplica reglas de negocio.
- Repository: gestiona datos en memoria.

## Interacción frontend-backend

- Frontend usa `fetch` tipado.
- Backend responde JSON consistente (`{ data }` o `{ error }`).
- Context global comparte estado de libros entre páginas.
