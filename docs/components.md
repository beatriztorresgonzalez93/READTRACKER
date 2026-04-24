# Components

## Componentes clave actuales

- `Layout`: contenedor global, branding, tema y acciones de sesion.
- `ProtectedRoute`: guard para rutas privadas cuando no hay login.
- `BookList`: listado de cards de libros.
- `BookCard`: card interactiva que abre detalle via callback `onOpenPreview`.
- `BookForm`: formulario reutilizable para crear/editar.
- `LibraryPage` (incluye panel lateral de detalle y modales asociados):
  - tabs de detalle (`Información`, `Mi reseña`, `Similares`),
  - cambio de estado/valoración,
  - marcar página,
  - reseñar,
  - favoritos,
  - eliminar.

## UI base reusable (`components/ui`)

Basada en el stack de componentes shadcn con primitives de Base UI (`@base-ui/react`) y estilos Tailwind.

- `button.tsx`
- `card.tsx`
- `input.tsx`
- `textarea.tsx`
- `select.tsx`
- `alert.tsx`
- `dialog.tsx`
- `dropdown-menu.tsx`
- `form-error.tsx`

## Paginas montadas sobre componentes

- `LibraryPage`
- `ReviewsPage`
- `WishlistPage`
- `StatisticsPage`
- `NewBookPage`
- `EditBookPage`
- `LoginPage`
- `RegisterPage`
- `NotFoundPage`

## Objetivo de diseño de componentes

- reuso real entre pantallas,
- props tipadas,
- separacion clara entre UI, estado (context) y red (api client).
