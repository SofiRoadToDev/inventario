# Backend Inventario - Sistema de Gestión de Inventario

API RESTful para gestión de inventario construida con Node.js, Express y Sequelize.

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar base de datos:
   - Crear base de datos PostgreSQL
   - Configurar variables de entorno en `.env`

3. Ejecutar migraciones:
```bash
npm run db:migrate
```

4. Iniciar servidor:
```bash
npm run dev
```

## Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Agentes
- `GET /api/agents` - Listar agentes
- `GET /api/agents/:id` - Obtener agente
- `POST /api/agents` - Crear agente
- `PUT /api/agents/:id` - Actualizar agente
- `DELETE /api/agents/:id` - Eliminar agente

### Activos
- `GET /api/assets` - Listar activos
- `GET /api/assets/:id` - Obtener activo
- `POST /api/assets` - Crear activo
- `PUT /api/assets/:id` - Actualizar activo
- `DELETE /api/assets/:id` - Eliminar activo

### Reportes
- `GET /api/reports/assets-by-agent` - Reporte de activos por agente

### Archivos
- `POST /api/upload` - Subir archivo

## Variables de Entorno

```
NODE_ENV=development
PORT=3000
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventario_db
DB_USERNAME=postgres
DB_PASSWORD=password
```