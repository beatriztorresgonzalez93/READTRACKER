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
  - `id`, `name`, `last_name`, `email`, `password_hash`, `avatar_url`, `created_at`
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
- Middleware `requireAuth` protege `/books`, `/books/summary`, `/auth/me` y `PATCH /auth/me`.
- La autorizacion de libros se hace en SQL filtrando por `user_id`.

Migraciones versionadas en `server/src/migrations/` (incluye perfil de usuario `004_user_profile_fields`).

## Frontend: separacion de responsabilidades

- `api/client.ts`: red y errores tipados.
- `AuthContext`: sesion global.
- `BooksContext`: coleccion paginada + resumen para la biblioteca principal.
- `useFullBooksSnapshot`: carga encadenada por paginas donde hace falta el conjunto completo de libros.
- `ProtectedRoute`: control de acceso por ruta.
- `LibraryPage`: fuente de verdad del panel de detalle (`?preview=<id>`).

## Principios usados

- componentes reutilizables,
- contratos tipados compartidos por dominio,
- respuestas JSON consistentes (`data`/`error`),
- UI reactiva con estados claros de carga/error.
