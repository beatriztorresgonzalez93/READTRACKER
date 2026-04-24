# API

Base URL local:
`http://localhost:4000/api/v1`

Base URL produccion:
`https://readtracker-api.onrender.com/api/v1`

## Formato de respuesta

- Exito: `{ "data": ... }` (algunos endpoints incluyen tambien `meta`, ver libros).
- Error: cuerpo JSON con `code`, `message` / `error` (segun endpoint).

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
    "lastName": "Torres",
    "email": "beatriz@example.com",
    "avatarUrl": null,
    "createdAt": "2026-04-15T08:00:00.000Z"
  }
}
```

### `PATCH /auth/me`

Actualiza perfil del usuario autenticado. Requiere `Authorization: Bearer <token>`.

Body JSON (todos los campos opcionales; solo se aplican los enviados):

- `name` (string no vacio),
- `lastName` (string),
- `avatarUrl` (string: data URL JPEG/PNG/WebP o URL `http(s)://`, o `null` para quitar foto).

Response `200`: mismo objeto `user` que `GET /auth/me`.

## Books (protegido con JWT)

Todas las rutas de libros requieren:
`Authorization: Bearer <token>`

Rutas relevantes (orden en Express: `/summary` antes de `/:id`):

- `GET /books` — listado **paginado** y filtrado en servidor.
- `GET /books/summary` — totales globales de la biblioteca (barra lateral).
- `GET /books/:id`
- `POST /books`
- `PUT /books/:id`
- `DELETE /books/:id`

### `GET /books`

Query params (tipicos):

| Parametro | Descripcion |
|-----------|-------------|
| `limit` | Tamano de pagina (default `12`, max `100`) |
| `offset` | Desplazamiento (default `0`) |
| `search` | Busqueda en titulo, autor, editorial, genero (ILIKE) |
| `status` | Filtro de estado: `todos` \| `pendiente` \| `leyendo` \| `leido` |
| `shelf` | Estante: `todos` \| `favoritos` \| `pendiente` \| `leyendo` \| `leido` |
| `genre` | Genero exacto (trim, comparacion sin distinguir mayusculas) |
| `sort` | `recientes` \| `titulo` \| `autor` \| `genero` \| `valoracion` |

Response `200`:

```json
{
  "data": [ /* array de libros */ ],
  "meta": {
    "total": 50,
    "limit": 12,
    "offset": 0
  }
}
```

### `GET /books/summary`

Una sola lectura agregada para totales por estante, favoritos, leidos, suma/conteo para media de valoracion, año mas reciente (`updated_at`) y lista de generos con conteo.

Response `200`:

```json
{
  "data": {
    "total": 50,
    "pendiente": 10,
    "leyendo": 3,
    "leido": 35,
    "favoritos": 8,
    "ratedSum": 142,
    "ratedCount": 30,
    "latestYear": 2026,
    "genres": [{ "genre": "Fantasia", "count": 12 }]
  }
}
```

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
