# Estrategia Centralizada de Validación y Manejo de Errores

Este documento explica cómo funciona el sistema de validación de entradas y el manejo centralizado de excepciones en la API, usando el validador de agentes (`agentValidator`) como ejemplo principal.

La estrategia se basa en tres componentes clave:
1.  **Validadores**: Definen las reglas que los datos de entrada deben cumplir.
2.  **Manejador de Errores Centralizado**: Un único lugar que atrapa todos los errores de la aplicación y envía una respuesta HTTP consistente.
3.  **Errores Personalizados**: Clases de error que nos permiten manejar diferentes situaciones (ej. 404 Not Found, 400 Bad Request) de forma semántica.

---

## 1. El Validador: `agentValidator.js`

Este archivo se encarga de definir las **reglas de validación** específicas para las rutas de los agentes. Vamos a desglosarlo:

```javascript
// 1. Importaciones necesarias
const { body, param, validationResult } = require('express-validator');
const { BadRequestError } = require('../utils/customErrors');

// 2. Middleware para manejar los errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req); // Revisa si hubo errores en las validaciones anteriores
  if (!errors.isEmpty()) {
    // Si hay errores, los formatea y lanza un error personalizado
    const errorMessages = errors.array().map(err => err.msg);
    throw new BadRequestError(errorMessages.join(', ')); 
  }
  next(); // Si no hay errores, continúa al siguiente middleware (o al controlador)
};

// 3. Reglas para el cuerpo de la solicitud (POST y PUT)
const agentValidation = [
  // El campo 'name' no debe estar vacío, se limpian espacios y se escapan caracteres especiales
  body('name', 'El nombre es requerido').not().isEmpty().trim().escape(),
  // El campo 'department' no debe estar vacío
  body('department', 'El departamento es requerido').not().isEmpty().trim().escape(),
  // Al final, siempre se llama al manejador de errores
  handleValidationErrors,
];

// 4. Reglas para el parámetro de la URL (GET por ID, PUT, DELETE)
const agentIdValidation = [
  // El parámetro 'id' en la URL debe ser un número entero
  param('id', 'El ID debe ser un número entero').isInt(),
  // Se llama al manejador de errores
  handleValidationErrors,
];

// 5. Se exportan las reglas para usarlas en el archivo de rutas
module.exports = {
  agentValidation,
  agentIdValidation,
};
```

En resumen, este archivo crea "paquetes" de reglas de validación (`agentValidation` y `agentIdValidation`) que podemos insertar en nuestras rutas como si fueran un guardia de seguridad.

---

## 2. El Vínculo entre el Validador y el `errorHandler`

La conexión entre el validador y el manejador de errores se realiza a través del **mecanismo de manejo de errores de Express**. Piénsalo como un sistema de dos vías: la vía normal y la vía de error.

### El Puente: El Middleware `handleValidationErrors`

El validador por sí solo (`body('name').not().isEmpty()`) no hace nada más que registrar si un campo es válido o no. La magia ocurre en el pequeño middleware que creamos y que ponemos al final de cada cadena de validación: `handleValidationErrors`.

Cuando este middleware encuentra un error de validación, **lanza un error personalizado** (`throw new BadRequestError(...)`). Esta acción es la que activa el cambio de la vía normal a la vía de error.

### El Flujo de Conexión

1.  **La Vía Normal (`next()`)**:
    Si todas las validaciones en una ruta son exitosas, cada middleware llama a `next()`, pasando el control al siguiente en la cadena hasta llegar al controlador.

2.  **El Desvío a la Vía de Error (`throw`)**:
    Si una validación falla, `handleValidationErrors` lo detecta y **lanza un error**. 

3.  **Express Busca al "Bombero" (`errorHandler`)**:
    *   Nuestro `asyncHandler` (o Express por defecto) "atrapa" ese error.
    *   Llama a `next(error)`, lo que le indica a Express que ignore los middlewares normales y busque un manejador de errores.
    *   Express encuentra nuestro `errorHandler` en `server.js` porque es el único middleware con **cuatro argumentos**: `(err, req, res, next)`.

4.  **El `errorHandler` Recibe el Error**:
    *   Express le pasa el objeto `BadRequestError` que lanzamos a nuestro `errorHandler`.
    *   El `errorHandler` lo inspecciona, ve que es un error conocido (una instancia de `ApiError`), y usa su `statusCode` (400) y su mensaje para enviar una respuesta JSON consistente al cliente.

En resumen: **Validador -> `throw new CustomError()` -> Express cambia a la vía de error -> `errorHandler` atrapa el `CustomError` y envía la respuesta.**

---

## 3. Flujo Completo: Ejemplo Práctico

Usemos como ejemplo una solicitud para actualizar un agente: `PUT /api/agents/123` con datos incorrectos en el cuerpo (body).

La definición de esta ruta en `routes/agents.js` es:

```javascript
router.put('/:id', agentIdValidation, agentValidation, agentController.updateAgent);
```

Este es el viaje completo de la solicitud:

**Paso 1: La Solicitud Llega**
Un cliente envía una solicitud `PUT` a `/api/agents/123` con el siguiente cuerpo: `{ "name": " " }` (un nombre vacío y sin departamento).

**Paso 2: Autenticación**
Se ejecuta el middleware `authenticate`. Si el token es válido, la solicitud continúa.

**Paso 3: Comienza la Cadena de Validación**
Express empieza a ejecutar los middlewares de la ruta en orden.

**Paso 4: Se ejecuta `agentIdValidation`**
*   La regla `param('id', ...).isInt()` revisa el `123` en la URL. Es un entero, así que la validación es **exitosa**.
*   `handleValidationErrors` no encuentra errores y llama a `next()`.

**Paso 5: Se ejecuta `agentValidation` (Aquí falla)**
*   La regla `body('name', ...).not().isEmpty()` **falla** porque el nombre está vacío.
*   La regla `body('department', ...)` **falla** porque el campo no existe.
*   Ahora se ejecuta `handleValidationErrors`:
    *   `validationResult(req)` le informa de los dos errores.
    *   Crea un array de mensajes: `['El nombre es requerido', 'El departamento es requerido']`.
    *   Lanza el error: `throw new BadRequestError('El nombre es requerido, El departamento es requerido')`.

**Paso 6: El Manejador de Errores Centralizado Actúa**
*   El `throw` detiene la ejecución y pasa el control al `errorHandler`.
*   El `errorHandler` recibe el `BadRequestError`.
*   Detecta que es un `ApiError`, toma su `statusCode` (400) y su mensaje.
*   Envía la respuesta final al cliente:
    ```json
    {
      "error": "El nombre es requerido, El departamento es requerido"
    }
    ```
*   El controlador `agentController.updateAgent` **nunca se ejecuta**.
