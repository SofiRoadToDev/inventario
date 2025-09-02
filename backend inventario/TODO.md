# TODO - Mejoras para la API de Inventario

Esta es una lista de tareas pendientes, mejoras y correcciones para la API.

## Crítico

-   [x] **Implementar Validación de Entrada:** Se ha implementado la validación en todas las rutas usando `express-validator`.
-   [~] **Añadir Pruebas Unitarias y de Integración:** En progreso. Se ha configurado el entorno de pruebas con Jest y Supertest.
    -   [x] Configuración del entorno (Jest, Supertest, DB de prueba).
    -   [x] Pruebas para `auth`.
    -   [ ] Pruebas para `agents`.
    -   [ ] Pruebas para `assets`.
    -   [ ] Pruebas para `locations`.
    -   [ ] Pruebas para `categories`.
    -   [ ] Pruebas para `nomenclatures`.

## Mejoras

-   [ ] **Paginación en Endpoints de Listado:** Las rutas `GET` que devuelven listas (`/assets`, `/agents`, etc.) deberían implementar paginación para manejar grandes volúmenes de datos de manera eficiente.
-   [x] **Mejorar la Gestión de Errores:** Se ha implementado un manejador de errores centralizado y clases de error personalizadas para estandarizar las respuestas.
-   [ ] **Transacciones en Operaciones Complejas:** Las operaciones que modifican múltiples tablas (ej. crear un activo y asociarlo) deberían estar envueltas en transacciones de Sequelize para garantizar la atomicidad.
-   [x] **Sanitización de Entradas:** Se ha añadido sanitización básica (`trim`, `escape`) en los validadores para prevenir ataques XSS.
-   [ ] **Crear un archivo `.env.example`:** Añadir un archivo `.env.example` al repositorio para que los nuevos desarrolladores sepan qué variables de entorno se necesitan.

## Correcciones y Refactorización

-   [ ] **Consistencia en las Respuestas de Eliminación:** Las rutas `DELETE` deberían devolver un código de estado `204 No Content` sin cuerpo en la respuesta, en lugar de un `200` con un mensaje JSON.
-   [x] **Seguridad en la Eliminación:** Se ha añadido la verificación de activos asociados antes de eliminar entidades como `Category`, `Location`, `Agent`, etc.
-   [ ] **Refactorizar el Endpoint de Subida de Archivos:** El endpoint `/api/upload` está definido directamente en `server.js`. Sería más limpio mover esta lógica a su propio controlador y archivo de rutas (ej. `routes/upload.js` y `controllers/uploadController.js`).
-   [ ] **Completar Migraciones:** El directorio `migrations` está vacío. Se deberían generar y usar migraciones para gestionar el esquema de la base de datos de forma versionada, en lugar de depender de `sequelize.sync()`.

## Documentación

-   [x] **Actualizar `README.md`:** Realizado.
-   [x] **Actualizar y completar `openapi.yaml`:** Realizado.
-   [x] **Crear `asynchandler-HOF.md`**: Realizado.
-   [x] **Crear `central-exceptions-handling.MD`**: Realizado.