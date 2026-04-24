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

### Wishlist
- `getWishlistItems()`
- `createWishlistItem(data)`
- `updateWishlistItem(id, data)`
- `purchaseWishlistItem(id)`
- `getWishlistAcquisitions()`

### Reading sessions
- `getReadingSessions()`
- `createReadingSession(data)`
- `deleteReadingSession(id)`

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

Además, el cliente ahora incluye utilidades para mensajes más claros:

- `getReadableErrorMessage(error, fallback)` para transformar errores de red/servidor en texto apto para UI.
- mapeo por estado HTTP en `apiFetch`:
  - `400`: payload inválido,
  - `401`: sesión expirada/no autorizada,
  - `403`: permisos insuficientes,
  - `404`: recurso no encontrado,
  - `409`: conflicto de datos,
  - `5xx`: error temporal de servidor.

## Flujos de sesiones y borrado

### Crear sesión de lectura

`createReadingSession` envía:

```ts
{
  bookId: string;
  currentPage: number;
  previousPage?: number;
  recordedAt?: string; // ISO
}
```

Comportamiento esperado:

- la API deduplica por `(user_id, book_id, current_page, recorded_at)`,
- si el cliente reintenta la misma petición, devuelve la sesión existente (idempotencia).

### Borrar sesión de lectura

`deleteReadingSession(id)` elimina una sesión y el backend recalcula:

- `currentPage`,
- `progress`,
- `lastPageMarkedAt`

del libro asociado en una transacción.
