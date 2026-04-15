# API

Base URL local:
`http://localhost:4000/api/v1`

Base URL produccion:
`https://readtracker-api.onrender.com/api/v1`

## Formato de respuesta

- Exito: `{ "data": ... }`
- Error: `{ "error": "mensaje" }`

## Auth

### `POST /auth/register`

Crea cuenta y devuelve token JWT.

Request:
```json
{
  "name": "Beatriz",
  "email": "beatriz@example.com",
  "password": "secret123"
}
```

Response `201`:
```json
{
  "data": {
    "token": "jwt",
    "user": {
      "id": "uuid",
      "name": "Beatriz",
      "email": "beatriz@example.com",
      "createdAt": "2026-04-15T08:00:00.000Z"
    }
  }
}
```

### `POST /auth/login`

Request:
```json
{
  "email": "beatriz@example.com",
  "password": "secret123"
}
```

Response `200`: mismo formato que register.

### `GET /auth/me`

Requiere header:
`Authorization: Bearer <token>`

Response `200`:
```json
{
  "data": {
    "id": "uuid",
    "name": "Beatriz",
    "email": "beatriz@example.com",
    "createdAt": "2026-04-15T08:00:00.000Z"
  }
}
```

## Books (protegido con JWT)

Todas las rutas de libros requieren:
`Authorization: Bearer <token>`

- `GET /books`
- `GET /books/:id`
- `POST /books`
- `PUT /books/:id`
- `DELETE /books/:id`

### Campos de libro

- `title` (string, requerido en create)
- `author` (string, requerido en create)
- `genre` (string, requerido en create)
- `publicationYear` (number opcional)
- `status` (`pendiente` | `leyendo` | `leido`)
- `rating` (0..5 opcional)
- `review` (string opcional)
- `progress` (0..100 opcional)
- `coverUrl` (string opcional)

### Ejemplo `POST /books`

```json
{
  "title": "The Pragmatic Programmer",
  "author": "Andrew Hunt",
  "genre": "Software",
  "publicationYear": 1999,
  "status": "leyendo",
  "progress": 45
}
```

## Covers

### `GET /covers/search?title=...`

Endpoint publico para sugerir portadas.

Proveedor actual:
- primero consulta Open Library (`openlibrary.org` + `covers.openlibrary.org`),
- si no hay resultados validos, usa Google Books (`googleapis.com/books/v1/volumes`) como fallback.

Response `200`:
```json
{ "data": ["https://.../cover.jpg"] }
```

## Health

### `GET /health`

Response `200`:
```json
{ "data": { "status": "ok" } }
```

## Errores frecuentes

- `401`: token ausente/invalido.
- `404`: recurso no encontrado o ruta inexistente.
- `400`: validaciones de payload (campos faltantes/rangos/campos no permitidos).
