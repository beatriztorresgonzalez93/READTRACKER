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
- biblioteca aislada por usuario (cada cuenta ve solo sus libros),
- listado de libros con busqueda por texto (titulo, autor, editorial, genero),
- filtro por estado (`pendiente`, `leyendo`, `leido`),
- ordenacion por `titulo`, `autor`, `genero` y `valoracion`,
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
- pantalla de reseñas con cards clicables a detalle,
- pantalla de estadísticas de lectura,
- tema oscuro global.

## Funcionalidades opcionales / futuras

- sistema de favoritos avanzado por colecciones,
- subida real de portada (upload de archivo),
- recuperacion de contrasena por email,
- roles/admin para moderacion avanzada.
