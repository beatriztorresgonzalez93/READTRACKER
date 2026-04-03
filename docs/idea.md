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

- listado de libros con búsqueda por texto (título, autor, género),
- filtro por estado (`pendiente`, `leyendo`, `leido`),
- ordenación por `título`, `autor`, `género` y `valoración`,
- crear, editar y eliminar libros,
- navegación por card completa al detalle + botón editar y eliminar en cada card,
- formulario con validaciones y reglas de progreso:
  - `leido` => progreso automático `100`,
  - `pendiente` => progreso automático `0`,
  - `leyendo` => progreso editable,
- búsqueda automática de portadas por título (con Enter o botón Buscar),
- tema oscuro por defecto con preferencia persistida en `localStorage`.

## Funcionalidades opcionales / futuras

- sistema de favoritos,
- estadísticas de lectura,
- subida real de portada (upload de archivo),
- autenticación de usuarios.
