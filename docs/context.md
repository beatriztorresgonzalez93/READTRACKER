# Context

`BooksContext` expone estado global para biblioteca:
- `books`
- `loading`
- `error`
- `reloadBooks`

## Objetivo

Compartir datos entre páginas sin prop drilling y mantener una sola fuente de verdad.

## Funcionamiento

Al montar el provider:
1. ejecuta carga inicial con `useEffect`,
2. llama a API tipada,
3. actualiza estado global.
