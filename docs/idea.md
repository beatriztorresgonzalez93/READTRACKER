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
- listado de libros con busqueda por texto (titulo, autor, genero),
- filtro por estado (`pendiente`, `leyendo`, `leido`),
- ordenacion por `titulo`, `autor`, `genero` y `valoracion`,
- crear, editar y eliminar libros,
- navegación por card completa al detalle + botón editar y eliminar en cada card,
- formulario con validaciones, anio de publicacion y reglas de progreso:
  - `leido` => progreso automático `100`,
  - `pendiente` => progreso automático `0`,
  - `leyendo` => progreso editable,
- valoracion por estrellas en estado `leido`,
- búsqueda automática de portadas por título (con Enter o botón Buscar),
- tema oscuro por defecto con preferencia persistida en `localStorage`.

## Funcionalidades opcionales / futuras

- sistema de favoritos,
- estadísticas de lectura,
- subida real de portada (upload de archivo),
- recuperacion de contrasena por email,
- roles/admin para moderacion avanzada.
