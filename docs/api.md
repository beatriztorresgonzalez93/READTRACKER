# API

Base URL local:
`http://localhost:4000/api/v1`

Base URL producción:
`https://readtracker-api.onrender.com/api/v1`

## Endpoints

- `GET /books`
- `GET /books/:id`
- `POST /books`
- `PUT /books/:id`
- `DELETE /books/:id`
- `GET /health`
- `GET /covers/search?title=...`

## Ejemplo POST /books

Request:
```json
{
  "title": "The Pragmatic Programmer",
  "author": "Andrew Hunt",
  "genre": "Software",
  "status": "leyendo",
  "rating": 5,
  "progress": 45
}
```

Response 201:
```json
{
  "data": {
    "id": "uuid",
    "title": "The Pragmatic Programmer",
    "author": "Andrew Hunt",
    "genre": "Software",
    "status": "leyendo",
    "rating": 5,
    "progress": 45,
    "createdAt": "2026-04-01T00:00:00.000Z",
    "updatedAt": "2026-04-01T00:00:00.000Z"
  }
}
```

Errores (cuerpo JSON, mensajes en español):
```json
{ "error": "Descripción del error" }
```

## Notas de comportamiento

- `GET /books` acepta query params opcionales:
  - `search` (texto libre),
  - `status` (`pendiente`, `leyendo`, `leido`).
- `GET /covers/search` devuelve array de URLs de portada en `data`.
