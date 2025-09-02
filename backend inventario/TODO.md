# TODO - Mejoras para la API de Inventario

Esta es una lista de tareas pendientes, mejoras y correcciones para la API.

## Crítico

-   [x] **Implementar Validación de Entrada:** Ninguna ruta parece tener validación para los datos de entrada (`req.body`, `req.params`, `req.query`). Esto es un riesgo de seguridad y puede causar errores inesperados. Se recomienda usar una librería como `express-validator` o `joi`.
-   [ ] **Añadir Pruebas Unitarias y de Integración:** El proyecto carece de un framework de pruebas. Es crucial añadir pruebas para asegurar la fiabilidad del código y evitar regresiones. Se sugiere usar `jest` y `supertest`.

## Mejoras

-   [ ] **Paginación en Endpoints de Listado:** Las rutas `GET` que devuelven listas (`/assets`, `/agents`, etc.) deberían implementar paginación para manejar grandes volúmenes de datos de manera eficiente.
-   [ ] **Mejorar la Gestión de Errores:** El `errorHandler` es genérico. Se podría mejorar para manejar errores específicos de Sequelize (ej. `SequelizeValidationError`, `SequelizeUniqueConstraintError`) y devolver códigos de estado y mensajes más precisos.
-   [ ] **Transacciones en Operaciones Complejas:** Las operaciones que modifican múltiples tablas (ej. crear un activo y asociarlo) deberían estar envueltas en transacciones de Sequelize para garantizar la atomicidad.
-   [ ] **Sanitización de Entradas:** Además de la validación, se deben sanitizar las entradas para prevenir ataques XSS, especialmente en campos de texto como `name` y `description`.
-   [ ] **Crear un archivo `.env.example`:** Añadir un archivo `.env.example` al repositorio para que los nuevos desarrolladores sepan qué variables de entorno se necesitan.

## Correcciones y Refactorización

-   [ ] **Consistencia en las Respuestas de Eliminación:** Las rutas `DELETE` deberían devolver un código de estado `204 No Content` sin cuerpo en la respuesta, en lugar de un `200` con un mensaje JSON.
-   [ ] **Seguridad en la Eliminación:** Al eliminar entidades como `Category`, `Location` o `Nomenclature`, la lógica actual podría permitir la eliminación incluso si hay activos asociados. Se debe verificar que no existan activos vinculados antes de eliminar (similar a lo que se sugiere en la descripción de `DELETE /agents` en el `openapi.yaml` original).
-   [ ] **Refactorizar el Endpoint de Subida de Archivos:** El endpoint `/api/upload` está definido directamente en `server.js`. Sería más limpio mover esta lógica a su propio controlador y archivo de rutas (ej. `routes/upload.js` y `controllers/uploadController.js`).
-   [ ] **Completar Migraciones:** El directorio `migrations` está vacío. Se deberían generar y usar migraciones para gestionar el esquema de la base de datos de forma versionada, en lugar de depender de `sequelize.sync()`.

## Documentación

-   [x] **Actualizar `README.md`:** Realizado.
-   [x] **Actualizar y completar `openapi.yaml`:** Realizado.
