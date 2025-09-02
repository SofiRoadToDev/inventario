# Especificación de API Backend - Sistema de Gestión de Inventario

Este documento define la arquitectura y los endpoints para el servidor backend construido con Node.js, Express y Sequelize.

## 1. Arquitectura y Stack Tecnológico

- **Framework**: Express.js
- **ORM**: Sequelize
- **Base de Datos**: PostgreSQL (o MySQL/MariaDB/SQLite, según preferencia)
- **Autenticación**: JSON Web Tokens (JWT)
- **Manejo de Archivos**: Multer para subida de archivos.
- **Validación**: `joi` o `express-validator` para validar los datos de entrada.

## 2. Estructura de Directorios Sugerida

```
/
|-- config/
|   |-- config.json         # Credenciales de la base de datos para Sequelize
|   |-- passport.js         # (Opcional) Configuración de Passport.js para estrategias JWT
|-- controllers/
|   |-- authController.js
|   |-- agentController.js
|   |-- assetController.js
|   |-- reportController.js
|-- middleware/
|   |-- authenticate.js     # Middleware de autenticación JWT
|   |-- errorHandler.js     # Middleware para manejo centralizado de errores
|   |-- uploader.js         # Middleware de configuración de Multer para archivos
|-- migrations/             # Generadas por Sequelize-CLI
|-- models/
|   |-- index.js            # Inicialización de modelos y asociaciones de Sequelize
|   |-- user.js
|   |-- agent.js
|   |-- asset.js
|-- routes/
|   |-- auth.js
|   |-- agents.js
|   |-- assets.js
|   |-- reports.js
|-- seeders/                # (Opcional) Generados por Sequelize-CLI para poblar la BD
|-- uploads/                # Directorio para almacenar archivos subidos (debe estar en .gitignore)
|-- .env
|-- server.js               # Punto de entrada de la aplicación
|-- package.json
```

## 3. Esquema de Autenticación (JWT)

El acceso a los endpoints protegidos se controla mediante un JSON Web Token.

**Flujo:**
1.  El cliente envía credenciales (email/password) al endpoint `POST /api/auth/login`.
2.  El servidor valida las credenciales. Si son correctas, genera un JWT firmado con un secreto (`JWT_SECRET`) y lo devuelve en la respuesta.
3.  El cliente almacena este token (en `localStorage` o `sessionStorage`).
4.  Para cada solicitud a un endpoint protegido, el cliente debe incluir el token en el header `Authorization` con el formato `Bearer <token>`.
5.  Un middleware en el servidor (`authenticate.js`) intercepta la solicitud, verifica la validez del token y, si es válido, adjunta la información del usuario al objeto `req` para que los controladores puedan usarla.

### Endpoints de Autenticación

-   `POST /api/auth/login`
    -   **Body**: `{ "email": "user@example.com", "password": "password123" }`
    -   **Respuesta Exitosa (200)**: `{ "token": "ey...", "user": { "id": 1, "name": "John Doe" } }`
-   `POST /api/auth/register` (Opcional, si se permite el auto-registro)
    -   **Body**: `{ "name": "Jane Doe", "email": "jane@example.com", "password": "password123" }`
    -   **Respuesta Exitosa (201)**: `{ "message": "User created successfully" }`

## 4. Gestión de Archivos

Se utilizará la librería `multer` para procesar `multipart/form-data`.

-   **Almacenamiento**: Los archivos se guardarán en el directorio `/uploads` del servidor.
-   **Acceso**: Se configurará una ruta estática en Express para servir estos archivos. Ej: `app.use('/files', express.static('uploads'))`. Así, un archivo guardado como `image.jpg` será accesible en `http://<server_url>/files/image.jpg`.
-   **Endpoint de Subida**:
    -   `POST /api/upload`
    -   **Tipo de Content**: `multipart/form-data`
    -   **Body**: Un campo `file` con el archivo a subir.
    -   **Middleware**: Se usará un middleware de `multer` en esta ruta.
    -   **Respuesta Exitosa (200)**: `{ "filePath": "/files/filename-timestamp.ext" }`
    -   **Uso**: El cliente primero sube el archivo a este endpoint, recibe la URL y luego usa esa URL al crear o actualizar un registro (ej: un `Asset`).

## 5. Modelos de Base de Datos (Sequelize)

-   **User**:
    -   `id`: INTEGER, Primary Key, Auto-increment
    -   `name`: STRING
    -   `email`: STRING, Unique
    -   `password`: STRING (se debe almacenar el hash, no el texto plano)
-   **Agent** (Responsable):
    -   `id`: INTEGER, Primary Key, Auto-increment
    -   `name`: STRING
    -   `department`: STRING
-   **Asset** (Activo):
    -   `id`: INTEGER, Primary Key, Auto-increment
    -   `name`: STRING
    -   `description`: TEXT
    -   `serialNumber`: STRING, Unique
    -   `value`: DECIMAL
    -   `purchaseDate`: DATE
    -   `status`: ENUM('active', 'in_repair', 'decommissioned')
    -   `imageUrl`: STRING (URL del archivo subido)
    -   `agentId`: INTEGER, Foreign Key to `Agent.id`

**Asociaciones**:
-   `Agent.hasMany(Asset)`
-   `Asset.belongsTo(Agent)`

## 6. Endpoints de la API (RESTful)

Todos los endpoints (excepto auth) deben estar protegidos y requerir un token JWT.

### Agentes (`/api/agents`)

-   `GET /`: Listar todos los agentes.
-   `GET /:id`: Obtener un agente por su ID.
-   `POST /`: Crear un nuevo agente.
-   `PUT /:id`: Actualizar un agente existente.
-   `DELETE /:id`: Eliminar un agente.

### Activos (`/api/assets`)

-   `GET /`: Listar todos los activos. Soporta query params para filtrar (ej: `?status=active`, `?agentId=1`).
-   `GET /:id`: Obtener un activo por su ID.
-   `POST /`: Crear un nuevo activo.
-   `PUT /:id`: Actualizar un activo existente.
-   `DELETE /:id`: Eliminar un activo.

### Reportes (`/api/reports`)

-   `GET /assets-by-agent`: Devuelve una lista de agentes, cada uno con un array de los activos que tiene asignados.
    -   **Respuesta Exitosa (200)**:
        ```json
        [
          {
            "id": 1,
            "name": "John Doe",
            "department": "IT",
            "assets": [
              { "id": 101, "name": "Laptop Dell XPS" },
              { "id": 102, "name": "Monitor LG 27"" }
            ]
          }
        ]
        ```

## 7. Middlewares Clave

-   **`authenticate.js`**:
    -   Extrae el token del header `Authorization: Bearer <token>`.
    -   Usa `jwt.verify()` para validar el token.
    -   Si es válido, busca al usuario en la BD y lo adjunta a `req.user`.
    -   Si no es válido o no existe, devuelve un error `401 Unauthorized`.
-   **`errorHandler.js`**:
    -   Middleware de Express que se define al final, con 4 argumentos `(err, req, res, next)`.
    -   Captura todos los errores que ocurren en la aplicación.
    -   Devuelve una respuesta de error estandarizada (ej: `{ "error": "Mensaje de error" }`) con el código de estado adecuado (500 por defecto).
-   **CORS**:
    -   Usar el paquete `cors` de npm (`app.use(cors())`) para permitir peticiones desde el frontend de React.
