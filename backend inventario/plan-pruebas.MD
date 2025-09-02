# Plan de Pruebas para la API de Inventario

Este documento describe el plan de trabajo para implementar una suite de pruebas robusta para la API, utilizando Jest y Supertest.

### 1. Configuración del Entorno de Pruebas

-   **Instalar Dependencias de Desarrollo**: Añadir al proyecto las librerías necesarias para las pruebas:
    -   `jest`: El framework principal para ejecutar las pruebas.
    -   `supertest`: Una librería que facilita la realización de solicitudes HTTP a nuestra API dentro de las pruebas.
    -   `cross-env`: Una utilidad para asegurar que las variables de entorno (como `NODE_ENV=test`) funcionen en cualquier sistema operativo.

-   **Crear el Script de Pruebas**: Modificar el archivo `package.json` para incluir un nuevo script `test`:
    ```json
    "scripts": {
      "test": "cross-env NODE_ENV=test jest --testTimeout=10000 --detectOpenHandles"
    }
    ```
    Esto asegura que las pruebas se ejecuten con una configuración de base de datos de prueba y finalicen correctamente.

-   **Configurar Jest**: Crear un archivo `jest.config.js` en la raíz del proyecto para establecer la configuración base, como el entorno de Node.js y la limpieza de mocks entre pruebas.

-   **Preparar la Base de Datos de Pruebas**: Implementar un mecanismo (`tests/setup.js`) para que, antes de que se ejecute la suite de pruebas, la base de datos de prueba se reinicie a un estado limpio y conocido (`sequelize.sync({ force: true })`). Esto garantiza que los resultados de una prueba no afecten a las siguientes.

### 2. Estrategia y Escritura de Pruebas

-   **Enfoque en Pruebas de Integración**: La estrategia principal será escribir pruebas de integración. Estas son las más valiosas para una API, ya que simulan el comportamiento real de un cliente:
    1.  Inician el servidor de la API.
    2.  Realizan una solicitud HTTP a un endpoint (ej. `POST /api/agents`).
    3.  Verifican la respuesta HTTP (código de estado, cuerpo JSON).
    4.  Opcionalmente, verifican que los datos se hayan guardado correctamente en la base de datos.

-   **Estructura de Archivos**: Crear un nuevo directorio `/tests` en la raíz del proyecto. Dentro, organizar las pruebas en archivos que correspondan a cada recurso de la API: `auth.test.js`, `agents.test.js`, `assets.test.js`, etc.

-   **Casos de Prueba a Cubrir**: Para cada recurso, se deben probar los siguientes escenarios:
    -   **Creación (POST)**: Probar la creación exitosa (respuesta `201`), la validación de datos (respuesta `400`) y la autenticación (respuesta `401`).
    -   **Lectura (GET)**: Probar que se pueda obtener una lista de recursos y un recurso individual por su ID. También probar el caso de un ID que no existe (respuesta `404`).
    -   **Actualización (PUT)**: Probar la actualización exitosa, el error de validación y el error de "no encontrado".
    -   **Eliminación (DELETE)**: Probar la eliminación exitosa y el error de "no encontrado".
    -   **Reglas de Negocio**: Probar lógicas específicas, como impedir que se elimine un agente si tiene activos asociados (respuesta `400`).
