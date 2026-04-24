# Project Management

## Organizacion del trabajo

El proyecto se organiza por iteraciones pequeñas:
1. Base técnica (frontend + backend + docs).
2. CRUD completo y validaciones.
3. Mejoras de UX/UI.
4. Integración, despliegue y cierre.

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
- Auth JWT funcional (`register/login/me`) con rutas privadas en frontend.
- Modelo multiusuario aplicado (`books.user_id`).
- Frontend en React + TypeScript con `AuthContext` y `BooksContext`.
- Filtros, ordenacion, cards con acciones y detalle enriquecido (fuente única en `LibraryPage`).
- Vistas funcionales de `Reseñas`, `Lista de deseos` y `Estadísticas`.
- Flujo modal de detalle desde reseñas con `backgroundLocation` y `preview`.
- Deploy activo en Vercel (frontend) y Render (backend), con CORS configurado.

## Recomendaciones

- Limitar tareas en progreso para no bloquearse.
- Cerrar tarjetas pequenas con frecuencia.
- Revisar prioridades al inicio de cada sesion.
- Mantener una tarjeta fija de "alinear docs con codigo" por iteracion.
