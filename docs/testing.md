# Testing

## Tests automatizados (cliente)

El frontend usa [Vitest](https://vitest.dev/) con jsdom y [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

- **Ejecutar una vez (CI):** desde `client/`, `npm run test`
- **Modo observación:** `npm run test:watch`

**Que cubren:**

- `src/api/client.test.ts` — `apiFetch`: URL base, JSON en éxito, `ApiError` con cuerpo de error y fallback si el JSON falla.
- `src/components/BookForm.test.tsx` — validación de campos obligatorios; envío con estado `leido` fuerza `progress: 100` en el payload.

Configuración: `vite.config.ts` (`test.environment`, `setupFiles`), setup en `src/test/setup.ts`.

## Pruebas manuales minimas

1. Levantar backend y frontend.
2. Crear cuenta en `/register`.
3. Iniciar sesion en `/login`.
4. Ver biblioteca inicial (carga de libros del usuario autenticado).
5. Crear libro desde formulario.
6. Ver detalle de libro creado.
7. Editar libro desde boton de card.
8. Eliminar libro desde menu de card (confirmacion + recarga).
9. Filtrar por estado y buscar por texto.
10. Ordenar por titulo, autor, genero y valoracion.
11. Probar reglas de progreso:
   - `leido` => 100,
   - `pendiente` => 0,
   - `leyendo` => editable.
12. Probar busqueda automatica de portada con `Enter`.
13. Cerrar sesion y confirmar redireccion a login para rutas privadas.
14. Comprobar navegacion y 404.

## Checklist

- [x] Tests automatizados del cliente (`npm run test` en `client/`).
- [x] Flujo de auth (`register/login/me`) operativo.
- [x] Rutas protegidas frontend funcionan.
- [x] Endpoints REST responden con codigos correctos.
- [x] Validaciones basicas se aplican.
- [x] Estado global se actualiza tras operaciones CRUD.
- [x] CORS validado en entorno de producción.
