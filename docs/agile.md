# Agile

Agile es una forma de trabajar en ciclos cortos para entregar valor continuo y adaptarse a cambios de producto. En ReadTracker se ha aplicado con iteraciones pequenas orientadas a resultado visible (UI, auth, datos, deploy).

## Scrum

Scrum organiza el trabajo en sprints (por ejemplo, de 1 o 2 semanas), con roles y eventos claros:
- Product Owner prioriza backlog.
- Scrum Master facilita el proceso.
- Equipo de desarrollo implementa.
- Eventos: planning, daily, review, retrospective.

Se recomienda cuando hay un equipo estable y se quiere cadencia fija con entregas frecuentes.

## Kanban

Kanban se basa en flujo continuo:
- tablero visual (pendiente, en progreso, hecho),
- limite de trabajo en progreso (WIP),
- mejora continua del flujo.

Es util cuando el trabajo llega de forma variable y se necesita flexibilidad diaria.

## Diferencias principales

- Scrum: iteraciones fijas, roles definidos, objetivos de sprint.
- Kanban: flujo continuo, menos ceremonias obligatorias, enfocado en throughput y tiempos de ciclo.

## Cuando usar cada uno

- Scrum: proyectos con roadmap claro y necesidad de ritmo constante.
- Kanban: mantenimiento evolutivo, incidencias frecuentes o equipo pequeno con multitarea.

## Aplicacion practica en este proyecto

- Se ha trabajado de forma cercana a Kanban: peticiones cortas, feedback inmediato y ajustes frecuentes.
- Cada bloque tecnico se ha cerrado con validacion (`build/test`) antes de pasar al siguiente.
- Las ramas se han usado para comparar estilos/versiones y reducir riesgo al integrar.
- Tras cambios de API o de flujos de datos compartidos (`AuthContext`, `BooksContext`, paginacion de libros), conviene cerrar el ciclo actualizando `docs/api.md`, `docs/api-client.md`, `README.md` y, si aplica, `docs/context.md` / `docs/hooks.md` para que la documentacion siga siendo fuente de verdad operativa.
