# Components

## Páginas (`client/src/pages/`)

- `LibraryPage`: biblioteca con búsqueda, filtros por estado y orden (controles en la propia página, no componentes separados `SearchBar` / `StatusFilter`).
- `NewBookPage` / `EditBookPage`: envoltorio + `BookForm`.
- `BookDetailPage`: ficha del libro (portada, metadatos, progreso, estrellas, reseña, fechas).
- `NotFoundPage`: 404.

## Componentes de dominio

- `Layout`: cabecera, tema claro/oscuro y contenedor principal.
- `BookList`: grid de libros con fondo de baldas y espaciado bajo portada.
- `BookCard`: portada a pantalla completa en la card, menú ⋮ (editar / eliminar con confirmación), overlay “Ver detalle”, chip de estado.
- `BookForm`: formulario controlado crear/editar (incluye búsqueda de portadas).
- `StarRating`: valoración de 0–5 en estrellas (solo lectura), usada en detalle.

## UI reutilizable (`client/src/components/ui/`)

- `button`, `card`, `input`, `select`, `textarea`, `alert`, `form-error`.

## Beneficios

- Reutilización entre páginas.
- Props tipadas y mantenimiento sencillo.
- Separación clara entre UI genérica y pantallas concretas.
