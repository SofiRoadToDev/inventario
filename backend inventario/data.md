# Estructura de Modelos del Proyecto

Este documento describe la estructura de los modelos de la base de datos utilizando Sequelize, así como sus atributos y asociaciones.

## Modelos

### 1. Agent

Representa a un agente en el sistema.

-   **Atributos:**
    -   `id`: INTEGER (Primary Key, AutoIncrement)
    -   `name`: STRING (NOT NULL)
    -   `lastname`: STRING (NOT NULL)
    -   `dni`: STRING (UNIQUE, NULLable)
    -   `roleId`: INTEGER (Foreign Key a `roles.id`)
-   **Asociaciones:**
    -   `hasMany` <mcsymbol name="Asset" filename="asset.js" path="c:\Users\Educacion\Downloads\EET3107\ELIM\SOFIA\inventario-app\backend inventario\models\asset.js" startline="4" type="class"></mcsymbol> (como `assets`): Un agente puede tener múltiples activos.
    -   `belongsTo` <mcsymbol name="Role" filename="role.js" path="c:\Users\Educacion\Downloads\EET3107\ELIM\\SOFIA\inventario-app\backend inventario\models\role.js" startline="5" type="class"></mcsymbol> (como `role`): Un agente pertenece a un rol.
-   **Tabla:** `agents`

### 2. Asset

Representa un activo en el inventario.

-   **Atributos:**
    -   `id`: INTEGER (Primary Key, AutoIncrement)
    -   `name`: STRING (NOT NULL)
    -   `description`: TEXT (NULLable)
    -   `serialNumber`: STRING (NOT NULL, UNIQUE)
    -   `value`: DECIMAL(10, 2) (NOT NULL)
    -   `purchaseDate`: DATE (NOT NULL)
    -   `status`: ENUM('MALO', 'REGULAR', 'BUENO', 'MUY BUENO') (NOT NULL, DEFAULT 'BUENO')
    -   `imageUrls`: ARRAY de STRINGs (NULLable)
    -   `agentId`: INTEGER (Foreign Key a `Agents.id`, NULLable)
    -   `locationId`: INTEGER (Foreign Key a `Locations.id`, NULLable)
    -   `categoryId`: INTEGER (Foreign Key a `Categories.id`, NULLable)
    -   `nomenclatureId`: INTEGER (Foreign Key a `Nomenclatures.id`, NULLable)
-   **Asociaciones:**
    -   `belongsTo` <mcsymbol name="Agent" filename="agent.js" path="c:\Users\Educacion\Downloads\EET3107\ELIM\SOFIA\inventario-app\backend inventario\models\agent.js" startline="4" type="class"></mcsymbol> (como `agent`): Un activo pertenece a un agente.
    -   `belongsTo` <mcsymbol name="Location" filename="location.js" path="c:\Users\Educacion\Downloads\EET3107\ELIM\SOFIA\inventario-app\backend inventario\models\location.js" startline="4" type="class"></mcsymbol> (como `location`): Un activo puede tener una ubicación.
    -   `belongsTo` <mcsymbol name="Category" filename="category.js" path="c:\Users\Educacion\Downloads\EET3107\ELIM\SOFIA\inventario-app\backend inventario\models\category.js" startline="4" type="class"></mcsymbol> (como `category`): Un activo puede tener una categoría.
    -   `belongsTo` <mcsymbol name="Nomenclature" filename="nomenclature.js" path="c:\Users\Educacion\Downloads\EET3107\ELIM\SOFIA\inventario-app\backend inventario\models\nomenclature.js" startline="4" type="class"></mcsymbol> (como `nomenclature`): Un activo puede tener una nomenclatura.
-   **Tabla:** `Assets` (por defecto, ya que `modelName` es 'Asset')

### 3. Category

Representa una categoría para los activos.

-   **Atributos:**
    -   `id`: INTEGER (Primary Key, AutoIncrement)
    -   `name`: STRING (NOT NULL)
    -   `description`: TEXT (NULLable)
-   **Asociaciones:**
    -   `hasMany` <mcsymbol name="Asset" filename="asset.js" path="c:\Users\Educacion\Downloads\EET3107\ELIM\SOFIA\inventario-app\backend inventario\models\asset.js" startline="4" type="class"></mcsymbol> (como `assets`): Una categoría puede tener múltiples activos.
-   **Tabla:** `Categories` (por defecto, ya que `modelName` es 'Category')

### 4. Location

Representa una ubicación física para los activos.

-   **Atributos:**
    -   `id`: INTEGER (Primary Key, AutoIncrement)
    -   `name`: STRING (NOT NULL)
    -   `description`: TEXT (NULLable)
-   **Asociaciones:**
    -   `hasMany` <mcsymbol name="Asset" filename="asset.js" path="c:\Users\Educacion\Downloads\EET3107\ELIM\SOFIA\inventario-app\backend inventario\models\asset.js" startline="4" type="class"></mcsymbol> (como `assets`): Una ubicación puede tener múltiples activos.
-   **Tabla:** `Locations` (por defecto, ya que `modelName` es 'Location')

### 5. Nomenclature

Representa una nomenclatura o tipo de activo.

-   **Atributos:**
    -   `id`: INTEGER (Primary Key, AutoIncrement)
    -   `name`: STRING (NOT NULL)
    -   `code`: STRING (NOT NULL, UNIQUE)
-   **Asociaciones:**
    -   `hasMany` <mcsymbol name="Asset" filename="asset.js" path="c:\Users\Educacion\Downloads\EET3107\ELIM\SOFIA\inventario-app\backend inventario\models\asset.js" startline="4" type="class"></mcsymbol> (como `assets`): Una nomenclatura puede tener múltiples activos.
-   **Tabla:** `Nomenclatures` (por defecto, ya que `modelName` es 'Nomenclature')

### 6. Role

Representa los roles de los agentes en el sistema.

-   **Atributos:**
    -   `id`: INTEGER (Primary Key, AutoIncrement)
    -   `name`: STRING (NOT NULL)
-   **Asociaciones:**
    -   `hasMany` <mcsymbol name="Agent" filename="agent.js" path="c:\Users\Educacion\Downloads\EET3107\ELIM\SOFIA\inventario-app\backend inventario\models\agent.js" startline="4" type="class"></mcsymbol> (como `agents`): Un rol puede tener múltiples agentes.
-   **Tabla:** `roles`

### 7. User

Representa a un usuario del sistema, utilizado para autenticación.

-   **Atributos:**
    -   `id`: INTEGER (Primary Key, AutoIncrement)
    -   `name`: STRING (NOT NULL)
    -   `email`: STRING (NOT NULL, UNIQUE, con validación de email)
    -   `password`: STRING (NOT NULL)
-   **Hooks (Transformaciones):**
    -   `beforeCreate`: Antes de crear un usuario, la contraseña se hashea usando `bcryptjs`.
    -   `beforeUpdate`: Antes de actualizar un usuario, si la contraseña ha cambiado, se hashea nuevamente.
-   **Métodos de Instancia:**
    -   `validatePassword(password)`: Método asíncrono para comparar una contraseña dada con la contraseña hasheada del usuario.
-   **Asociaciones:**
    -   Actualmente no tiene asociaciones definidas explícitamente en el archivo del modelo.
-   **Tabla:** `Users` (por defecto, ya que `modelName` es 'User')

## Patrones de Transformación (DTOs)

En este proyecto, no se observan Data Transfer Objects (DTOs) explícitamente definidos como clases separadas para la transferencia de datos entre capas. Los modelos de Sequelize (`Agent`, `Asset`, `Category`, `Location`, `Nomenclature`, `Role`, `User`) actúan directamente como las estructuras de datos para la persistencia y, en muchos casos, también para la transferencia de datos en las respuestas de la API.

La única transformación notable a nivel de modelo es el **hashing de contraseñas** en el modelo `User` a través de los hooks `beforeCreate` y `beforeUpdate` de Sequelize. Esto asegura que las contraseñas nunca se almacenen en texto plano en la base de datos.