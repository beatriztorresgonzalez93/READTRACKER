# Routing

Rutas principales en el frontend (`client/src/App.tsx`):

- `/` → `LibraryPage`
- `/books/new` → `NewBookPage`
- `/books/:id` → `BookDetailPage`
- `/books/:id/edit` → `EditBookPage`
- `*` → `NotFoundPage`

Se usa `BrowserRouter` dentro de `main.tsx` y el layout común en `Layout`.

Para SPA en producción, el proyecto incluye `client/vercel.json` con reescritura a `index.html`.
