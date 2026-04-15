# Forms

## `BookForm` (crear/editar libro)

Formulario controlado y reutilizable en:
`client/src/components/BookForm.tsx`

### Campos

- titulo
- autor
- genero
- anio de publicacion (`publicationYear`)
- url de portada
- busqueda automatica de portada
- estado (`pendiente`, `leyendo`, `leido`)
- progreso (solo visible en `leyendo`)
- resena + valoracion por estrellas (solo visible en `leido`)

### Reglas por estado

- `pendiente`:
  - progreso automatico `0`
  - sin progreso manual
  - sin resena/valoracion
- `leyendo`:
  - progreso manual visible (0..100)
  - sin resena/valoracion
- `leido`:
  - progreso automatico `100`
  - muestra resena y valoracion por estrellas

### Validaciones

- requeridos: titulo, autor, genero, estado.
- `publicationYear`: entero valido y en rango razonable.
- `rating`: 0..5.
- `progress`: 0..100 cuando estado `leyendo`.

## Auth forms

- `LoginPage`: email + password.
- `RegisterPage`: name + email + password (min 6 chars).

Ambas muestran feedback con mensajes de API (`ApiError`).
