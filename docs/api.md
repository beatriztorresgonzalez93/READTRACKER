# API

Base URL local:
`http://localhost:4000/api/v1`

Base URL producción:
`https://readtracker-api.onrender.com/api/v1`

## Endpoints

- `GET /health`
- `GET /books`
- `GET /books/:id`
- `POST /books`
- `PUT /books/:id`
- `DELETE /books/:id`
- `GET /covers/search?title=...`

### GET /health

Respuesta `200`:

```json
{ "data": { "status": "ok" } }
```

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

## Errores (cuerpo JSON)

Formato siempre:

```json
{ "error": "mensaje en español" }
```

Los textos de `error` del **backend** están en **español** y coinciden con los definidos en controladores y middlewares (no se mezclan con inglés salvo nombres de campo en mensajes dinámicos, p. ej. claves desconocidas en `PUT`).

### 400 — Petición inválida

| Situación | `error` |
|-----------|---------|
| `GET /covers/search` sin `title` | `El parámetro title es obligatorio` |
| `GET/PUT/DELETE /books/:id` con `id` no usable | `El id del libro no es válido` |
| `POST /books` sin datos mínimos o estado inválido | `Título, autor, género y estado son obligatorios` |
| Calificación fuera de rango (crear / actualizar) | `La calificación debe estar entre 0 y 5` |
| Progreso fuera de rango (crear / actualizar) | `El progreso debe estar entre 0 y 100` |
| `PUT /books/:id` con cuerpo que no es objeto | `El cuerpo debe ser un objeto JSON` |
| `PUT /books/:id` con propiedades no permitidas | `Campos no permitidos: …` (lista las claves) |
| `PUT /books/:id` sin ningún campo permitido | `Debes enviar al menos un campo para actualizar` |
| `status` inválido en actualización | `El estado no es válido` |

### 404 — No encontrado

| Situación | `error` |
|-----------|---------|
| Libro inexistente (`GET/PUT/DELETE /books/:id`) | `Libro no encontrado` |
| Ruta no definida (cualquier otro path) | `Ruta no encontrada` |

### 500 — Error del servidor

| Situación | `error` |
|-----------|---------|
| Fallo al listar libros | `No se pudieron cargar los libros` |
| Fallo al obtener un libro | `No se pudo cargar el libro` |
| Fallo al crear | `No se pudo crear el libro` |
| Fallo al actualizar | `No se pudo actualizar el libro` |
| Fallo al eliminar | `No se pudo eliminar el libro` |
| Error no capturado (middleware global) | `Error interno del servidor` |

### 502 — Portadas (`GET /covers/search`)

| Situación | `error` |
|-----------|---------|
| Proveedor externo responde mal tras intentar fallback | `No se pudo consultar proveedores de portadas` |
| Red, JSON u otro fallo inesperado en la búsqueda | `No se pudo buscar portadas en este momento` |

En éxito, `GET /covers/search` responde `200` con `{ "data": [ "url", … ] }` (el array puede estar vacío si no hay resultados).

## Notas de comportamiento

- `PUT /books/:id` exige un cuerpo JSON con **al menos uno** de los campos permitidos (`title`, `author`, `genre`, `status`, `rating`, `review`, `progress`, `coverUrl`). No se aceptan cuerpos vacíos ni propiedades desconocidas.
- `GET /books` acepta query params opcionales:
  - `search` (texto libre),
  - `status` (`pendiente`, `leyendo`, `leido`).
- `GET /covers/search` devuelve en `data` un array de URLs (puede ser `[]`). Requiere query `title` no vacío.
