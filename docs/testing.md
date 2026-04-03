# Testing

## Pruebas manuales minimas

1. Levantar backend y frontend.
2. Ver biblioteca inicial (carga de libros desde API).
3. Crear libro desde formulario.
4. Ver detalle de libro creado.
5. Editar libro desde botón de card.
6. Eliminar libro desde botón de card (confirmación + recarga).
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

- [x] Rutas frontend funcionan.
- [x] Endpoints REST responden con codigos correctos.
- [x] Validaciones basicas se aplican.
- [x] Estado global se actualiza tras operaciones CRUD.
- [x] CORS validado en entorno de producción.
