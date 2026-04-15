# Design

## Arquitectura general

Monorepo con dos apps:
- `client/` (React + TS + Vite)
- `server/` (Express + TS + PostgreSQL)

Patron backend:
`route -> controller -> service -> repository`

## Modelo de datos actual

- `users`
  - `id`, `name`, `email`, `password_hash`, `created_at`
- `books`
  - `id`, `user_id`, `title`, `author`, `genre`, `publication_year`,
    `status`, `rating`, `review`, `progress`, `cover_url`, timestamps

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

## Principios usados

- componentes reutilizables,
- contratos tipados compartidos por dominio,
- respuestas JSON consistentes (`data`/`error`),
- UI reactiva con estados claros de carga/error.
