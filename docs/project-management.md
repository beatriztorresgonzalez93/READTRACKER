# Project Management

## Organizacion del trabajo

El proyecto se organiza por iteraciones pequeñas:
1. Base técnica (frontend + backend + docs).
2. CRUD completo y validaciones.
3. Mejoras de UX/UI.
4. Integración, despliegue y cierre.
5. Evolucion continua (perfil, biblioteca paginada y resumen, historial de sesiones, estadisticas con compras, etc.) con docs alineadas en la misma iteracion cuando cambie contrato o comportamiento visible.

Cada tarea debe ser corta, con criterio de aceptacion claro y resultado verificable.

## Uso de Trello

Tablero del proyecto:
- https://trello.com/b/g4VaV0oc

Columnas usadas:
- Backlog
- To Do
- In Progress
- Review
- Done

Cada tarjeta incluye:
- objetivo,
- checklist tecnico,
- definicion de terminado,
- evidencia (captura o commit).

## Estado actual resumido

- CRUD funcional con backend en Express + Neon Postgres.
- Auth JWT (`register/login/me`) y **perfil** con `PATCH /auth/me`; rutas privadas en frontend.
- Modelo multiusuario aplicado (`books.user_id`); usuarios con campos de perfil (`last_name`, `avatar_url`) en migraciones versionadas.
- Frontend en React + TypeScript con `AuthContext` y `BooksContext` (coleccion paginada + resumen de biblioteca; otras pantallas usan `useFullBooksSnapshot` cuando necesitan el conjunto completo de libros).
- Biblioteca: filtros y orden en servidor, estantes (incl. favoritos), filtro por genero desde resumen, “cargar mas”; detalle en panel lateral (fuente unica en `LibraryPage`, query `?preview=`).
- Sesiones de lectura en backend; pagina **Historial** (`/history`) con calendario y borrado de sesiones con recalculo de progreso.
- Vistas funcionales de `Reseñas`, `Lista de deseos` y `Estadísticas` (incluye compras desde deseos por mes).
- Flujo modal de detalle desde reseñas con `backgroundLocation` y `preview`.
- Deploy activo en Vercel (frontend) y Render (backend), con CORS configurado.

## Recomendaciones

- Limitar tareas en progreso para no bloquearse.
- Cerrar tarjetas pequenas con frecuencia.
- Revisar prioridades al inicio de cada sesion.
- Mantener una tarjeta fija de "alinear docs con codigo" por iteracion.
