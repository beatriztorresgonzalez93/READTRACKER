# Routing

Router principal en:
`client/src/App.tsx`

## Rutas publicas

- `/login` -> `LoginPage`
- `/register` -> `RegisterPage`
- `*` -> `NotFoundPage`

## Rutas protegidas (`ProtectedRoute`)

- `/` -> `LibraryPage`
- `/history` -> `ReadingHistoryPage` (carga perezosa)
- `/reviews` -> `ReviewsPage`
- `/wishlist` -> `WishlistPage`
- `/stats` -> `StatisticsPage`
- `/books/new` -> `NewBookPage`
- `/books/:id/edit` -> `EditBookPage`

Si no hay sesion valida, `ProtectedRoute` redirige a `/login`.

## Flujo de detalle de libro (actual)

- No existe una pantalla de detalle independiente.
- El detalle se abre mediante panel lateral de `LibraryPage` con query param:
  - `/?preview=<bookId>`
- Cuando se abre desde `ReviewsPage`, se usa navegacion modal (`backgroundLocation`) para mantener la pantalla de reseñas detrás desenfocada.

## Layout

Todas las rutas renderizan dentro de `Layout`, que contiene:
- header global,
- acciones de auth (entrar/registro o menu de usuario con perfil y logout).

El perfil se edita desde el header (dialog); no hay ruta dedicada `/profile`.
