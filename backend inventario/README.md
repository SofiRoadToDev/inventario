# Backend Inventario - Sistema de Gestión de Inventario

API RESTful para la gestión de inventario, construida con Node.js, Express y Sequelize. Permite manejar activos, agentes, ubicaciones, categorías y nomenclaturas.

## Características

- **Autenticación:** Sistema de registro e inicio de sesión basado en JWT.
- **Gestión de Activos:** CRUD completo para activos del inventario.
- **Gestión de Agentes:** CRUD para los responsables de los activos.
- **Gestión de Ubicaciones:** CRUD para las ubicaciones físicas de los activos.
- **Gestión de Categorías:** CRUD para categorizar los activos.
- **Gestión de Nomenclaturas:** CRUD para los códigos de clasificación de activos.
- **Gestión de Roles:** CRUD para los roles de los agentes.
- **Reportes:** Generación de reportes (ej. activos por agente).
- **Subida de Archivos:** Endpoint para subir imágenes asociadas a los activos.
- **Base de Datos Dual:** Soporte para PostgreSQL y SQLite.

## Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd backend-inventario
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar el entorno:**
    -   Crea un archivo `.env` en la raíz del proyecto.
    -   Copia el contenido de `.env.example` (si existe) o usa las variables de la sección "Variables de Entorno".
    -   Para usar **SQLite**, establece `DB_DIALECT=sqlite`. No se necesitan más variables de base de datos.
    -   Para usar **PostgreSQL**, configura las variables `DB_HOST`, `DB_PORT`, `DB_NAME`, etc.

4.  **Ejecutar migraciones (solo para PostgreSQL):**
    ```bash
    npm run db:migrate
    ```
    *Nota: Para SQLite, la base de datos se sincroniza automáticamente.*

5.  **Iniciar el servidor:**
    -   Modo desarrollo (con reinicio automático):
        ```bash
        npm run dev
        ```
    -   Modo producción:
        ```bash
        npm start
        ```

## Endpoints de la API

La URL base para todos los endpoints es `/api`.

### Health Check
- `GET /health` - Verifica el estado de la API.

### Autenticación
- `POST /auth/login` - Iniciar sesión.
- `POST /auth/register` - Registrar un nuevo usuario.

### Agentes (`/agents`)
- `GET /` - Listar todos los agentes.
- `GET /:id` - Obtener un agente por su ID.
- `POST /` - Crear un nuevo agente.
- `PUT /:id` - Actualizar un agente.
- `DELETE /:id` - Eliminar un agente.

### Activos (`/assets`)
- `GET /` - Listar todos los activos (permite filtros por `status` y `agentId`).
- `GET /:id` - Obtener un activo por su ID.
- `POST /` - Crear un nuevo activo.
- `PUT /:id` - Actualizar un activo.
- `DELETE /:id` - Eliminar un activo.

### Ubicaciones (`/locations`)
- `GET /` - Listar todas las ubicaciones.
- `GET /:id` - Obtener una ubicación por su ID.
- `POST /` - Crear una nueva ubicación.
- `PUT /:id` - Actualizar una ubicación.
- `DELETE /:id` - Eliminar una ubicación.

### Categorías (`/categories`)
- `GET /` - Listar todas las categorías.
- `GET /:id` - Obtener una categoría por su ID.
- `POST /` - Crear una nueva categoría.
- `PUT /:id` - Actualizar una categoría.
- `DELETE /:id` - Eliminar una categoría.

### Nomenclaturas (`/nomenclatures`)
- `GET /` - Listar todas las nomenclaturas.
- `GET /:id` - Obtener una nomenclatura por su ID.
- `POST /` - Crear una nueva nomenclatura.
- `PUT /:id` - Actualizar una nomenclatura.
- `DELETE /:id` - Eliminar una nomenclatura.

### Roles (`/roles`)
- `GET /` - Listar todos los roles.
- `GET /:id` - Obtener un rol por su ID.
- `POST /` - Crear un nuevo rol.
- `PUT /:id` - Actualizar un rol.
- `DELETE /:id` - Eliminar un rol.

### Reportes (`/reports`)
- `GET /assets-by-agent` - Reporte de activos agrupados por agente.

### Archivos (`/upload`)
- `POST /upload` - Subir un archivo (imagen).

## Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```
# Entorno de la aplicación (development, production)
NODE_ENV=development

# Puerto del servidor
PORT=3000

# Secreto para firmar los tokens JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# --- Configuración de la Base de Datos ---

# Dialecto de la base de datos: 'postgres' o 'sqlite'
DB_DIALECT=sqlite

# --- Opcional: Solo para PostgreSQL ---
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventario_db
DB_USERNAME=postgres
DB_PASSWORD=password
```
