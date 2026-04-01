# Hooks

## Hooks usados

- `useState`: manejar estado local (formularios, loading, errores).
- `useEffect`: cargar datos iniciales o por cambio de parámetro.
- `useMemo`: optimizar filtrado de libros.
- `useCallback`: estabilizar handlers reutilizados.

## Hook personalizado

`useBookFilters` centraliza:
- texto de búsqueda,
- filtro de estado,
- cálculo de lista filtrada.

Esto evita duplicar lógica en las páginas.
