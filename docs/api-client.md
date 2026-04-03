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

La URL base se construye con `VITE_API_BASE_URL`.
Si no está definida, usa fallback local: `http://localhost:4000/api/v1`.

## Configuracion de entorno

Variable:
`VITE_API_BASE_URL=http://localhost:4000/api/v1`

## Manejo de errores

Se lanza `ApiError` con mensaje y status HTTP para mostrar feedback claro en UI.

## Estados de red en UI

- `loading`: se muestra estado de carga en biblioteca y detalle.
- `success`: se renderizan libros y vistas.
- `error`: se muestra mensaje de error (por ejemplo, cuando falla la carga de biblioteca).
