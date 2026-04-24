# Idea

ReadTracker es una aplicación web fullstack para gestionar libros y lecturas personales en un solo lugar.

## Problema que resuelve

Muchas personas llevan sus lecturas en notas sueltas, hojas de cálculo o memoria. Esto dificulta ver progreso, historial y prioridades.

## Usuario objetivo

Estudiantes y lectores que quieren un sistema simple para:

- registrar libros,
- controlar avance,
- guardar opinión personal.

## Funcionalidades principales (estado actual)

- registro e inicio de sesion con JWT,
- perfil de cuenta desde el header (nombre, apellidos, correo, avatar); persistencia con `PATCH /auth/me`,
- biblioteca aislada por usuario (cada cuenta ve solo sus libros),
- listado **paginado** en la biblioteca (carga por paginas con “cargar mas”); filtros y orden se aplican en servidor,
- busqueda por texto (titulo, autor, editorial, genero),
- filtro por estado de lectura (`pendiente`, `leyendo`, `leido`, `todos`),
- estantes rapidos (`todos`, por estado y **favoritos**) y filtro por **genero** a partir del resumen de biblioteca (`GET /books/summary`),
- ordenacion por `recientes`, `titulo`, `autor`, `genero` y `valoracion`,
- crear, editar y eliminar libros,
- panel lateral de detalle con tabs (`Información`, `Mi reseña`, `Similares`),
- formulario con validaciones, anio de publicacion y reglas de progreso:
  - `leido` => progreso automático `100`,
  - `pendiente` => progreso automático `0`,
  - `leyendo` => progreso editable,
- valoracion por estrellas en panel y modal de reseña,
- búsqueda automática de portadas por título (con Enter o botón Buscar),
- gestion de reseña avanzada (fecha lectura, veces leído, cita, recomendación, etiquetas),
- lista de deseos persistida en backend (precio, tienda, prioridad, edición inline),
- sección de últimas adquisiciones en la biblioteca,
- sesiones de lectura al marcar pagina; **historial** en ruta dedicada (`/history`) con calendario mensual e intensidad,
- borrado de sesiones con recalculo de progreso del libro,
- pantalla de reseñas con cards clicables a detalle,
- pantalla de estadísticas (ritmo, rachas, actividad, generos, valoraciones y **compras desde lista de deseos** por mes),
- tema oscuro global.

## Funcionalidades opcionales / futuras

- sistema de favoritos avanzado por colecciones,
- subida real de portada (upload de archivo),
- recuperacion de contrasena por email,
- roles/admin para moderacion avanzada.
