# Design

## Arquitectura general

Monorepo con dos apps:
- `client/` (React + TS + Vite)
- `server/` (Express + TS + PostgreSQL en Neon)

Infraestructura de despliegue:
- frontend en Vercel,
- backend en Render,
- base de datos en Neon.

Patron backend:
`route -> controller -> service -> repository`

## Modelo de datos actual

- `users`
  - `id`, `name`, `email`, `password_hash`, `created_at`
- `books`
  - `id`, `user_id`, `title`, `author`, `genre`, `publication_year`,
    `status`, `rating`, `review`, `progress`, `cover_url`,
    `synopsis`, `read_at`, `times_read`, `favorite_quote`,
    `would_recommend`, `review_tags`, `current_page`, `last_page_marked_at`, timestamps
- `wishlist_items`
  - `id`, `user_id`, `title`, `author`, `price`, `store`, `priority`, timestamps
- `wishlist_acquisitions`
  - `id`, `user_id`, `title`, `author`, `price`, `store`, `purchased_at`, timestamps

`books.user_id` define propiedad del recurso y aislamiento por cuenta.

## Seguridad y acceso

- JWT para autenticacion de API.
- Middleware `requireAuth` protege `/books` y `/auth/me`.
- La autorizacion de libros se hace en SQL filtrando por `user_id`.

## Frontend: separacion de responsabilidades

- `api/client.ts`: red y errores tipados.
- `AuthContext`: sesion global.
- `BooksContext`: estado de biblioteca.
- `ProtectedRoute`: control de acceso por ruta.
- `LibraryPage`: fuente de verdad del panel de detalle (`?preview=<id>`).

## Principios usados

- componentes reutilizables,
- contratos tipados compartidos por dominio,
- respuestas JSON consistentes (`data`/`error`),
- UI reactiva con estados claros de carga/error.
