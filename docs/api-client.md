# API Client

Frontend usa una capa de red tipada:
- `api/client.ts`: wrapper reusable de `fetch`.
- `api/booksApi.ts`: funciones de dominio de libros.

Funciones disponibles:
- `getBooks()`
- `getBookById(id)`
- `createBook(data)`
- `updateBook(id, data)`
- `deleteBook(id)`

## Configuracion de entorno

Variable:
`VITE_API_BASE_URL=http://localhost:4000/api/v1`

## Manejo de errores

Se lanza `ApiError` con mensaje y status HTTP para mostrar feedback claro en UI.
