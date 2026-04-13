# Design

## Decisión de arquitectura

Monorepo simple con dos aplicaciones:

- `client/`: React + TypeScript + Vite.
- `server/`: Express + TypeScript.

Se evita sobreingeniería: capas claras, tipos fuertes y responsabilidades separadas.

## Flujo de datos

Frontend llama la API REST (`/api/v1/books`, etc.) mediante cliente tipado en `client/src/api/client.ts`.

Flujo backend:

`route → controller → service → repository`

- **Route:** mapea el endpoint HTTP.
- **Controller:** traduce req/res y códigos de estado.
- **Service:** reglas de negocio.
- **Repository:** acceso a datos en **PostgreSQL** (pool `pg`), no en memoria.

## Interacción frontend-backend

- Frontend usa `fetch` tipado.
- Backend responde JSON consistente (`{ data }` o `{ error }`).
- Context global (`BooksContext`) comparte estado de libros entre páginas.

## Identidad visual (estado actual)

- Paleta principal en **verde salvia** (claro y oscuro), alineada con fondo de página y componentes UI.
- **Biblioteca:** panel de filtros en card con gradiente salvia; inputs y selects con estilos custom (el desplegable nativo del `<select>` sigue mostrando acentos del sistema/navegador al abrir la lista).
- **Listado:** efecto de **baldas** continuo por fila en `BookList`; tarjetas a portada completa con menú contextual y chip de estado (visible al hover/focus en línea con “Ver detalle”).
- **Detalle del libro:** layout enriquecido, barra de progreso, fechas de alta/actualización, valoración con **estrellas** (`StarRating`), tipografía Fraunces + DM Sans en esa vista.

## Componentes UI base

Patrón inspirado en shadcn: `Button`, `Card`, `Input`, `Select`, `Textarea`, `Alert`, `FormError` bajo `client/src/components/ui/`, con utilidad `cn()` para clases.
