# API Client

El frontend usa una capa de red tipada en un solo módulo:

- `client/src/api/client.ts`: `apiFetch`, constante `API_BASE_URL` y funciones de dominio de libros.

Funciones expuestas:

- `getBooks(search?, status?)`
- `getBookById(id)`
- `createBook(data)`
- `updateBook(id, data)`
- `deleteBook(id)`

También expone `ApiError` para errores HTTP con mensaje y `status`.

## URL base

Se resuelve con `import.meta.env.VITE_API_BASE_URL`. Si no está definida, el fallback es `http://localhost:4000/api/v1`.

Ejemplo en `client/.env.example`:

`VITE_API_BASE_URL=http://localhost:4000/api/v1`

## Manejo de errores

`apiFetch` lanza `ApiError` cuando la respuesta no es OK, para mostrar feedback en la UI.

## Estados de red en UI

- **Carga:** mensajes de carga en biblioteca y detalle.
- **Éxito:** listados y fichas.
- **Error:** `Alert` u otros mensajes (p. ej. biblioteca no cargada, error al guardar).
