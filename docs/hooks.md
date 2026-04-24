# Hooks

## Hooks React usados

- `useState`: estado local de formularios, menus y flags UI.
- `useEffect`: bootstrap de sesion/cargas iniciales.
- `useMemo`: derivaciones (por ejemplo progreso acotado en detalle).
- `useCallback`: handlers estables para context y mutaciones.
- `useContext`: acceso a `AuthContext` y `BooksContext`.

## Hook/abstraccion de filtros

`useBookFilters(books)`:

- estado de UI: texto de busqueda, filtro por estado (`todos` / estados de lectura), ordenacion (`sortBy`),
- persistencia de esos valores en `localStorage` con manejo seguro de errores,
- devuelve `filteredBooks` como alias de `books` (el filtrado y orden reales los aplica el servidor vía `BooksContext.syncLibraryQuery` en `LibraryPage`).

## Carga completa de biblioteca para otras pantallas

`useFullBooksSnapshot(enabled?)` (`client/src/hooks/useFullBooksSnapshot.ts`):

- cuando `enabled` es true (p. ej. usuario autenticado), llama a `fetchAllBooksSnapshot` del cliente API, que pagina con `getBooksPage` hasta reunir todos los libros,
- usado en estadisticas, reseñas, lista de deseos e historial para no bloquear la coleccion principal con listas enormes en memoria alli.

## Patrones destacados

- guardas de ruta con `ProtectedRoute` + hooks de auth.
- paginas de auth y CRUD separadas, compartiendo cliente API tipado,
- query param `preview` para abrir detalle de libro en panel lateral.
