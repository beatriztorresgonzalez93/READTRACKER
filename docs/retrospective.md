# Retrospective


### 1) Que salio bien
- Lo que mas valoro es que la app ya se siente "de verdad": crear, editar, borrar y buscar libros funciona bien de punta a punta.
- La experiencia visual quedo bastante cuidada (modo oscuro consistente, mensajes claros y confirmacion al eliminar).
- Me gusto haber resuelto detalles que mejoran mucho la sensacion de calidad, como el fallback de portadas cuando una imagen falla.
- Tambien fue un acierto sumar tests automatizados en el cliente, porque ahora hay mas confianza antes de tocar cosas sensibles.
- La documentacion quedo mas alineada con el codigo real, y eso ayuda mucho a no perder tiempo despues.

### 2) Que se puede mejorar
- Todavia hay momentos donde la carga inicial se siente lenta, y eso es de lo primero que quiero mejorar.
- A nivel seguridad, hace falta dar un paso mas para estar tranquilos en produccion (control de acceso y limites de uso).
- Los logs actuales ayudan, pero cuando algo falla en remoto vendria bien tener mas contexto y mejor monitoreo.
- La base de datos necesita un flujo de cambios mas ordenado (migraciones) para no depender solo del arranque del servidor.
- Quiero ampliar los tests para cubrir mas casos reales y no solo los mas basicos.

### 3) Acciones concretas para la siguiente iteracion
- Implementar un primer control de acceso al API y dejar CORS mas cerrado a los dominios que realmente uso.
- Añadir limite de peticiones y una cache corta para la busqueda de portadas.
- Mejorar el health check para validar tambien la conexion a la base de datos.
- Definir una estrategia simple de migraciones y dejarla documentada.
- Sumar varios tests mas (frontend y backend) para reducir riesgos antes de desplegar.

### 4) Uso de IA en el proyecto
- La IA me ayudo sobre todo a avanzar mas rapido en tareas repetitivas: ajustes de UI, refactors pequeños, pruebas base y documentacion.
- Para no confiar "a ciegas", fui validando cada cambio con build, tests y pruebas manuales en pantalla.
- Las decisiones importantes (prioridades, alcance, que aceptar o descartar) las tome yo; la IA fue apoyo de ejecucion.
- En general, la senti como una buena compañia de trabajo para mantener el ritmo sin perder control del proyecto.

### 5) Aprendizajes tecnicos
- Aprendi que una buena base tecnica acelera, pero los detalles de UX son los que realmente se notan.
- Tambien confirme que separar responsabilidades en backend evita dolores de cabeza cuando el proyecto crece.
- Probar escenarios de error (no solo el caso ideal) cambia mucho la calidad final.
- Mantener docs al dia con el codigo ahorra confusiones y tiempo.
- Aunque sean pocos, tener tests automatizados da muchisima mas tranquilidad para iterar.
