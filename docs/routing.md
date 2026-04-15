# Routing

Router principal en:
`client/src/App.tsx`

## Rutas publicas

- `/login` -> `LoginPage`
- `/register` -> `RegisterPage`
- `*` -> `NotFoundPage`

## Rutas protegidas (`ProtectedRoute`)

- `/` -> `LibraryPage`
- `/books/new` -> `NewBookPage`
- `/books/:id` -> `BookDetailPage`
- `/books/:id/edit` -> `EditBookPage`

Si no hay sesion valida, `ProtectedRoute` redirige a `/login`.

## Layout

Todas las rutas renderizan dentro de `Layout`, que contiene:
- header global,
- switch de tema,
- acciones de auth (entrar/registro o usuario/logout).
