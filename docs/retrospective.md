# Retrospective

## 1) Que salio bien

- La app quedo como producto usable de punta a punta (auth + CRUD + detalle + filtros).
- El rediseño visual mejoro mucho identidad y legibilidad.
- Se incorporo autenticacion JWT con aislamiento real por usuario.
- Se mantuvo una estructura backend clara por capas.
- El cliente API tipado simplifica el manejo de errores y peticiones.

## 2) Que falta mejorar

- Tests backend (actualmente no hay suite automatizada del server).
- Flujo formal de migraciones de BD (hoy se hace via `initDb` + `ALTER`).
- Hardening de seguridad (rate limit, politicas de contrasena, rotacion JWT secret).
- Monitoreo operativo en produccion (logs estructurados y alertas).

## 3) Proximas acciones sugeridas

- Agregar tests de integracion para `/auth/*` y `/books/*`.
- Añadir middleware de rate limiting en auth.
- Documentar estrategia de backups/restauracion de Neon.
- Revisar CORS para minimizar superficie sin romper previews.
- Añadir endpoint de health que valide DB ademas de proceso.

## 4) Aprendizajes

- Integrar auth tarde implica tocar varias capas; conviene preverlo desde el inicio.
- Tipado consistente entre cliente y servidor evita regresiones.
- Actualizar docs al cierre de cada bloque reduce deuda tecnica.
