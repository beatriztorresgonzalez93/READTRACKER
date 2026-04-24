# Testing

## Tests automatizados (cliente)

El frontend usa [Vitest](https://vitest.dev/) con jsdom y [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

- **Ejecutar una vez (CI):** desde `client/`, `npm run test`
- **Modo observación:** `npm run test:watch`

**Que cubren:**

- `src/api/client.test.ts` — `apiFetch`: URL base, JSON en éxito, `ApiError` con cuerpo de error y fallback si el JSON falla.
- `src/components/BookForm.test.tsx` — validación de campos obligatorios; envío con estado `leido` fuerza `progress: 100` en el payload.
- `src/pages/ReadingHistoryPage.e2e.test.tsx` — flujos críticos de historial:
  - sesiones visibles en historial,
  - borrado de sesión + refresco de progreso/libros,
  - abrir libro desde historial manteniendo contexto modal.

Configuración: `vite.config.ts` (`test.environment`, `setupFiles`), setup en `src/test/setup.ts`.

## Tests automatizados (backend)

El backend usa [Vitest](https://vitest.dev/) para validar lógica de repositorios y consistencia de datos.

- **Ejecutar una vez (CI):** desde `server/`, `npm run test`
- **Modo observación:** desde `server/`, `npm run test:watch`
- **E2E real con DB:** desde `server/`, `npm run test:e2e:db` (requiere `DATABASE_URL`)

**Que cubren ahora:**

- `tests/readingSessionsRepository.test.ts`
  - creación idempotente de sesiones (si hay conflicto de dedupe, devuelve la sesión existente),
  - recálculo de progreso al borrar una sesión cuando quedan sesiones posteriores,
  - reset de progreso al borrar la última sesión de un libro,
  - protección por usuario (no crear/borrar sesiones de otro usuario).
- `tests/http.integration.test.ts`
  - contrato HTTP estable (`code`, `message`, `error`, `details` cuando aplica),
  - autenticación en rutas protegidas (`401 AUTH_REQUIRED`),
  - `auth`: payload inválido y credenciales incorrectas,
  - `books`: list/create/update/delete (éxito + validaciones + not found),
  - `wishlist`: list/acquisitions/create/update/purchase (éxito + validaciones + not found),
  - `reading-sessions`: validación de payload, create, delete y error interno controlado.
- `tests/http.e2e.db.test.ts`
  - flujo real `register -> create book -> create sessions -> delete session`,
  - validación de recálculo de `currentPage/progress` en DB tras borrado de sesión,
  - se salta automáticamente si no existe `DATABASE_URL`.

Smoke predeploy backend:

- desde `server/`, `npm run smoke:predeploy`
- ejecuta `build + test` en un único paso.

## Limpieza de duplicados de sesiones (operación puntual)

Comando disponible en backend:

- desde `server/`, `npm run cleanup:reading-sessions`

Qué hace:

- elimina duplicados históricos en `reading_sessions` usando la clave lógica
  `(user_id, book_id, current_page, recorded_at)`, conservando la fila más reciente,
- asegura el índice único `idx_reading_sessions_dedupe`.

Cuándo ejecutarlo en entorno real:

- después de migraciones/importaciones antiguas que pudieron insertar duplicados,
- si detectas errores de índice único relacionados con sesiones históricas,
- si aparecen sesiones repetidas en historial pese a no crearse de nuevo.

Checklist recomendado antes de ejecutar:

- [ ] Hacer backup/snapshot de base de datos.
- [ ] Confirmar que no hay despliegues de esquema en curso.
- [ ] Ejecutar en ventana de bajo tráfico (aunque sea operación corta).

Checklist recomendado después de ejecutar:

- [ ] Revisar salida del script (número de duplicados eliminados).
- [ ] Verificar endpoint `GET /api/v1/reading-sessions` con un usuario real.
- [ ] Probar borrado de sesión y comprobar recálculo de progreso en libro.

## Pruebas manuales minimas

1. Levantar backend y frontend.
2. Crear cuenta en `/register`.
3. Iniciar sesion en `/login`.
4. Ver biblioteca inicial (carga de libros del usuario autenticado).
5. Crear libro desde formulario.
6. Ver detalle en panel lateral (`?preview=<id>`).
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
15. Abrir reseña y comprobar detalle en modo modal (fondo desenfocado, sin salto de layout).
16. Marcar página en un libro en lectura y verificar que aparece una sesión en `Historial`.
17. Borrar sesión en `Historial` y verificar que desaparece y se ajusta el progreso del libro.
18. Abrir libro desde `Historial` y confirmar que mantiene contexto modal (fondo detrás).

## Integración frontend (flujos críticos)

- `src/pages/ReadingHistoryPage.e2e.test.tsx`
  - el historial muestra sesiones cargadas (flujo marcar página -> aparece historial),
  - borrar sesión la elimina del panel y refresca datos de libros,
  - abrir libro desde historial navega en modo modal (`previewOnly`).

## Contrato API validado por tests HTTP

Campos de error verificados:

- `code`: identificador estable para lógica de cliente/monitorización.
- `message`: texto principal legible para usuario.
- `error`: alias de compatibilidad para cliente existente.
- `details`: metadata adicional cuando aplica (ej. campos inválidos).

Casos clave cubiertos:

- `400` payload inválido,
- `401` auth requerida / credenciales inválidas,
- `404` recurso no encontrado,
- `500` error interno controlado por controlador.

## Validación rápida de sesiones/borrado (QA)

Checklist corto para validar sesiones en entorno real:

1. Abrir un libro en `leyendo`, marcar página y confirmar nueva sesión en `Historial`.
2. Borrar esa sesión desde panel de día y confirmar que desaparece del listado.
3. Volver al libro y validar que el progreso/campo de página actual se ajustó.
4. Repetir marcando la misma página con mismo timestamp desde script (si aplica) para validar idempotencia.

Smoke predeploy frontend:

- desde `client/`, `npm run smoke:predeploy`
- ejecuta `build + test` en un único paso.

## Checklist

- [x] Tests automatizados del cliente (`npm run test` en `client/`).
- [x] Flujo de auth (`register/login/me`) operativo.
- [x] Rutas protegidas frontend funcionan.
- [x] Endpoints REST responden con codigos correctos.
- [x] Validaciones basicas se aplican.
- [x] Estado global se actualiza tras operaciones CRUD.
- [x] CORS validado en entorno de producción.
