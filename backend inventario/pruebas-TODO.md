# TODO - Plan de Implementación de Pruebas

Este documento detalla las tareas pendientes para completar la suite de pruebas de integración de la API, basado en el plan de pruebas aprobado.

## Fase 1: Configuración del Entorno de Pruebas

- [x] Instalar dependencias de desarrollo (`jest`, `supertest`, `cross-env`).
- [x] Añadir el script `npm test` al archivo `package.json`.
- [x] Crear y configurar el archivo `jest.config.js`.
- [x] Crear el script de preparación `tests/setup.js` con hooks `beforeAll` y `afterAll` para manejar la base de datos de pruebas.

## Fase 2: Escritura de Pruebas de Integración por Recurso

### Módulo de Autenticación (`/api/auth`)
- **Archivo**: `tests/auth.test.js`
- **Estado**: `Completado`
- [x] **`POST /register`**:
    - [x] Prueba de registro exitoso (201).
    - [x] Prueba de error cuando el email ya existe (400).
    - [x] Prueba de error de validación por datos faltantes (400).
- [x] **`POST /login`**:
    - [x] Prueba de login exitoso con token (200).
    - [x] Prueba de error con contraseña incorrecta (401).
    - [x] Prueba de error con email inexistente (401).

### Módulo de Agentes (`/api/agents`)
- **Archivo**: `tests/agents.test.js`
- **Estado**: `Completado`
- [x] **`POST /`**:
    - [x] Prueba de creación exitosa (201).
    - [x] Prueba de error de validación (400).
    - [x] Prueba de error de autenticación (401).
- [x] **`GET /`**:
    - [x] Prueba de obtención de la lista de agentes (200).
- [x] **`GET /:id`**:
    - [x] Prueba de obtención de un agente específico (200).
    - [x] Prueba de error cuando el ID no existe (404).
- [x] **`PUT /:id`**:
    - [x] Prueba de actualización exitosa (200).
    - [x] Prueba de error de validación (400).
    - [x] Prueba de error cuando el ID no existe (404).
- [x] **`DELETE /:id`**:
    - [x] Prueba de eliminación exitosa (200).
    - [x] Prueba de error cuando el ID no existe (404).
    - [x] Prueba de error al intentar eliminar un agente con activos asignados (400).

### Módulo de Activos (`/api/assets`)
- **Archivo**: `tests/assets.test.js`
- **Estado**: `Completado`
- [x] **`POST /`**:
    - [x] Prueba de creación exitosa (201).
    - [x] Prueba de error de validación (ej. `agentId` no existe) (400).
    - [x] Prueba de error de validación por campos faltantes (400).
    - [x] Prueba de error de autenticación (401).
- [x] **`GET /`**:
    - [x] Prueba de obtención de la lista de activos (200).
    - [x] Prueba de filtrado por `status`.
    - [x] Prueba de filtrado por `agentId`.
- [x] **`GET /:id`**:
    - [x] Prueba de obtención de un activo específico (200).
    - [x] Prueba de error cuando el ID no existe (404).
- [x] **`PUT /:id`**:
    - [x] Prueba de actualización exitosa (200).
    - [x] Prueba de error cuando el ID no existe (404).
- [x] **`DELETE /:id`**:
    - [x] Prueba de eliminación exitosa (200).
    - [x] Prueba de error cuando el ID no existe (404).

### Módulo de Ubicaciones (`/api/locations`)
- **Archivo**: `tests/locations.test.js`
- **Estado**: `Pendiente`
- [X] Pruebas para el CRUD completo (POST, GET, GET by ID, PUT, DELETE).
- [X] Prueba de error al eliminar una ubicación con activos asignados (400).

### Módulo de Categorías (`/api/categories`)
- **Archivo**: `tests/categories.test.js`
- **Estado**: `Pendiente`
- [X] Pruebas para el CRUD completo (POST, GET, GET by ID, PUT, DELETE).
- [X] Prueba de error al eliminar una categoría con activos asignados (400).

### Módulo de Nomenclaturas (`/api/nomenclatures`)
- **Archivo**: `tests/nomenclatures.test.js`
- **Estado**: `Pendiente`
- [ ] Pruebas para el CRUD completo (POST, GET, GET by ID, PUT, DELETE).
- [ ] Prueba de error al eliminar una nomenclatura con activos asignados (400).
