# Context

Actualmente hay dos contextos globales:

## `AuthContext`

Archivo: `client/src/context/AuthContext.tsx`

Expone:
- `user`
- `loading`
- `isAuthenticated`
- `login(email, password)`
- `register(name, email, password)`
- `logout()`

Comportamiento:
- al iniciar app, intenta recuperar sesion con token guardado (`/auth/me`),
- persiste/limpia token en `localStorage`,
- centraliza todo el estado de autenticacion.

## `BooksContext`

Archivo: `client/src/context/BooksContext.tsx`

Expone:
- `books`
- `loading`
- `error`
- `reloadBooks()`

Comportamiento:
- carga libros desde API tipada,
- si no hay sesion, limpia estado y no consulta biblioteca,
- evita prop drilling entre pantallas de libros.
