# Forms

## `BookForm` (crear/editar libro)

Formulario controlado y reutilizable en:
`client/src/components/BookForm.tsx`

### Campos

- titulo
- autor
- editorial
- genero
- paginas
- anio de publicacion (`publicationYear`)
- url de portada
- busqueda automatica de portada
- sinopsis

### Validaciones

- requeridos: titulo, autor, editorial, genero.
- `pages`: entero valido en rango 1..20000.
- `publicationYear`: entero valido y en rango razonable.

## Estado, progreso y reseña

La gestion de estado de lectura, progreso y reseña ya no se resuelve en `BookForm`.
Ahora se gestiona desde el panel lateral de detalle en `LibraryPage`:

- cambio de estado (`pendiente`, `leyendo`, `leido`),
- marcado de pagina y progreso,
- reseña completa (texto, valoración, metadatos y etiquetas).

## Formulario de reseña (panel lateral)

Desde el panel de detalle de `LibraryPage`, el dialogo de reseña permite editar:

- reseña,
- valoración por estrellas,
- fecha de lectura (`readAt`),
- veces leído (`timesRead`),
- cita favorita (`favoriteQuote`),
- recomendación (`wouldRecommend`),
- etiquetas (`reviewTags`).

## Auth forms

- `LoginPage`: email + password.
- `RegisterPage`: name + email + password (min 6 chars).

Ambas muestran feedback con mensajes de API (`ApiError`).
