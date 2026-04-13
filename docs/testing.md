# Testing

## Tests automatizados (cliente)

El frontend usa [Vitest](https://vitest.dev/) con jsdom y [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

- **Ejecutar una vez (CI):** desde `client/`, `npm run test`
- **Modo observación:** `npm run test:watch`

**Qué cubren:**

- `src/api/client.test.ts` — `apiFetch`: URL base, JSON en éxito, `ApiError` con cuerpo de error y fallback si el JSON falla.
- `src/components/BookForm.test.tsx` — validación de campos obligatorios; envío con estado `leido` fuerza `progress: 100` en el payload.

Configuración: `vite.config.ts` (`test.environment`, `setupFiles`), setup en `src/test/setup.ts`.

## Pruebas manuales minimas

1. Levantar backend y frontend.
2. Ver biblioteca inicial (carga de libros desde API).
3. Crear libro desde formulario.
4. Ver detalle de libro creado (progreso, estrellas si hay valoración, reseña).
5. Editar libro desde el menú ⋮ de la card (Editar).
6. Eliminar libro desde el menú ⋮ (Eliminar → confirmación + recarga).
7. Filtrar por estado y buscar por texto.
8. Ordenar por título, autor, género y valoración.
9. Probar reglas de progreso:
   - `leido` => 100,
   - `pendiente` => 0,
   - `leyendo` => editable.
10. Probar búsqueda automática de portada con `Enter`.
11. Forzar error (por ejemplo status invalido) y validar mensaje.
12. Comprobar navegación y 404.

## Checklist

- [x] Tests automatizados del cliente (`npm run test` en `client/`).
- [x] Rutas frontend funcionan.
- [x] Endpoints REST responden con codigos correctos.
- [x] Validaciones basicas se aplican.
- [x] Estado global se actualiza tras operaciones CRUD.
- [x] CORS validado en entorno de producción.
