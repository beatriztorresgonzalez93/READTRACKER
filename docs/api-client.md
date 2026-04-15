# API Client

El frontend usa una unica capa tipada en:
`client/src/api/client.ts`

## Responsabilidad

- centralizar `fetch` en `apiFetch`,
- construir URLs con `VITE_API_BASE_URL`,
- incluir `Content-Type: application/json`,
- adjuntar `Authorization: Bearer <token>` automaticamente si hay sesion,
- lanzar `ApiError` tipado cuando `response.ok` es `false`.

## Funciones de dominio disponibles

### Auth
- `registerUser(name, email, password)`
- `loginUser(email, password)`
- `getMe()`
- `authStorage.getToken()/setToken()/clearToken()`

### Books
- `getBooks(search?, status?)`
- `getBookById(id)`
- `createBook(data)`
- `updateBook(id, data)`
- `deleteBook(id)`

## Configuracion

`VITE_API_BASE_URL=http://localhost:4000/api/v1`

Si no existe variable, usa fallback local:
`http://localhost:4000/api/v1`.

## Manejo de errores

Cuando falla una peticion se lanza:

```ts
new ApiError(message, status)
```

Esto permite mostrar en UI el mensaje real del backend (por ejemplo validaciones o auth).
