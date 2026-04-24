# Hooks

## Hooks React usados

- `useState`: estado local de formularios, menus y flags UI.
- `useEffect`: bootstrap de sesion/cargas iniciales.
- `useMemo`: derivaciones (por ejemplo progreso acotado en detalle).
- `useCallback`: handlers estables para context y mutaciones.
- `useContext`: acceso a `AuthContext` y `BooksContext`.

## Hook/abstraccion de filtros

`useBookFilters`:
- texto de busqueda,
- filtro por estado,
- ordenacion,
- lista resultante memoizada,
- persistencia de filtros en `localStorage` con manejo seguro de errores.

## Patrones destacados

- guardas de ruta con `ProtectedRoute` + hooks de auth.
- paginas de auth y CRUD separadas, compartiendo cliente API tipado,
- query param `preview` para abrir detalle de libro en panel lateral.
