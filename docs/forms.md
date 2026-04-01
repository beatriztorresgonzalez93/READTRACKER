# Forms

`BookForm` usa formulario controlado:
- cada campo vive en estado React,
- se valida antes de enviar,
- se muestran errores simples por campo.

Validaciones actuales:
- requeridos: título, autor, género, estado,
- `calificación` entre 0 y 5,
- `progress` entre 0 y 100.

Esto deja una base clara para luego integrar validación más avanzada.
