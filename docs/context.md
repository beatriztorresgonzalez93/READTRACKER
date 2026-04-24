# Context

Actualmente hay dos contextos globales:

## `AuthContext`

Archivo: `client/src/context/AuthContext.tsx`

Expone:

- `user` (`AuthUser` o `null`): incluye `id`, `name`, `lastName`, `email`, `avatarUrl`, `createdAt`
- `loading`, `isAuthenticated`
- `login(email, password)`
- `register(name, email, password)`
- `logout()`
- `updateProfile(body)` — persiste cambios con `PATCH /auth/me` y actualiza `user` en memoria

Comportamiento:

- al iniciar la app, intenta recuperar sesion con token guardado (`GET /auth/me`),
- persiste/limpia token en `localStorage`,
- normaliza campos de usuario por compatibilidad (`lastName`, `avatarUrl`).

## `BooksContext`

Archivo: `client/src/context/BooksContext.tsx`

Expone:

- `books` — pagina actual de la **coleccion** segun el ultimo `syncLibraryQuery` (filtros en servidor)
- `booksTotal` — `meta.total` de la ultima peticion de listado
- `librarySummary` — resultado de `GET /books/summary` (totales, generos, media de valoracion, etc.)
- `nowReadingPreview` — hasta unos pocos libros en estado `leyendo` (peticion aparte para el aside)
- `loading`, `loadingMore`, `error`
- `syncLibraryQuery(query)` — reinicia lista a la primera pagina con filtros (`search`, `status`, `sort`, `shelf`, `genre`)
- `loadMoreBooks()` — siguiente pagina (mismo criterio), concatena al final
- `reloadBooks()` — vuelve a cargar primera pagina y resumen (tras crear/editar/borrar libro desde flujos que lo llaman)
- `upsertBook(book)` — actualiza o antepone en el array visible sin refetch completo (optimizacion de UI)

Comportamiento:

- si no hay sesion, limpia estado y no consulta biblioteca,
- evita prop drilling en la **coleccion** y estados de carga asociados,
- las pantallas que necesitan **toda** la biblioteca (estadisticas, reseñas, etc.) usan el hook `useFullBooksSnapshot` (ver `docs/hooks.md`), no dependen de tener los N libros en `BooksContext`.
