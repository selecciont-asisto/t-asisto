# Configuración de Seguridad de los Endpoints

## Resumen
Se ha implementado seguridad centralizada en los endpoints de la API mediante dos utilidades compartidas: gestión de CORS y validación de API key.

## Archivos Actualizados

Los siguientes endpoints han sido refactorizados con las nuevas medidas de seguridad:

1. **get-question.js** - Obtener preguntas abiertas
2. **post-question.js** - Guardar respuestas a preguntas abiertas
3. **get-test.js** - Obtener test psicométrico
4. **post-test.js** - Guardar resultados del test psicométrico
5. **post-candidate.js** - Crear nuevo candidato

## Utilidades Centralizadas

### 1. CORS (`/api/utils/cors.js`)

Función `setCorsHeaders(res)` que configura los headers de CORS:
- **Access-Control-Allow-Origin**: `*` (permite todas las origenes)
- **Access-Control-Allow-Methods**: `GET, POST, PUT, DELETE, OPTIONS`
- **Access-Control-Allow-Headers**: `Content-Type, Authorization`

### 2. Autenticación (`/api/utils/auth.js`)

#### Función `validateApiKey(req)`
Valida la API key desde los headers de la petición:
- Busca la clave en el header `x-api-key`
- También acepta el header `Authorization` con formato `Bearer <token>`
- Compara contra la variable de entorno `API_KEY`

#### Función `sendUnauthorizedResponse(res, setCorsHeaders)`
Envía una respuesta estandarizada 401 cuando la autenticación falla:
```json
{
  "message": "No autorizado. API key inválida o faltante."
}
```

## Configuración Requerida

### Variable de Entorno

Debe configurarse la variable de entorno `API_KEY` en el servidor:

```bash
API_KEY=your_api_key_here
```

**En Vercel:**
1. Ve a tu proyecto > Settings > Environment Variables
2. Añade `API_KEY` con el valor correspondiente
3. Aplica para todos los entornos (Production, Preview, Development)

## Uso desde el Cliente

### Hacer Peticiones Autenticadas

Todas las peticiones a los endpoints protegidos deben incluir el header `x-api-key`:

```javascript
fetch('/api/get-test', {
  method: 'GET',
  headers: {
    'x-api-key': 'your_api_key_here',
    'Content-Type': 'application/json'
  }
})
```

### Ejemplo con POST

```javascript
fetch('/api/post-candidate', {
  method: 'POST',
  headers: {
    'x-api-key': 'your_api_key_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre: 'Juan Pérez',
    email: 'juan@example.com'
    // ... más datos del candidato
  })
})
```

## Flujo de Validación

En cada endpoint protegido, el flujo es el siguiente:

1. **Validación de método HTTP** - Verifica que sea el método correcto (GET/POST)
2. **Validación de API key** - Llama a `validateApiKey(req)`
   - Si falla: retorna 401 con mensaje de error
   - Si pasa: continúa con la lógica del endpoint
3. **Procesamiento de la petición** - Ejecuta la lógica específica del endpoint
4. **Respuesta con CORS** - Todas las respuestas incluyen headers CORS

## Respuestas de Error

### 401 - No Autorizado
```json
{
  "message": "No autorizado. API key inválida o faltante."
}
```

### 405 - Método No Permitido
```json
{
  "message": "Método no permitido"
}
```

### 500 - Error Interno del Servidor
```json
{
  "message": "Error interno del servidor."
}
```

## Seguridad

### Mejores Prácticas

1. **Nunca commitear el API key** en el código fuente
2. **Rotar el API key periódicamente** (cada 90 días recomendado)
3. **Usar HTTPS** en producción siempre
4. **Monitorear peticiones no autorizadas** en los logs
5. **Considerar rate limiting** para prevenir abuso

### Archivos a Excluir en .gitignore

```
.env
.env.local
.env.*.local
```

## Testing

Para probar los endpoints con la autenticación:

**Con curl:**
```bash
curl -H "x-api-key: your_api_key_here" \
     https://tu-dominio.vercel.app/api/get-test
```

**Con REST Client (test.rest):**
```http
GET https://tu-dominio.vercel.app/api/get-test
x-api-key: your_api_key_here
```

## Notas Adicionales

- El endpoint maneja peticiones OPTIONS (preflight) automáticamente para CORS
- La validación ocurre antes de cualquier operación costosa o acceso a base de datos
- Los headers CORS se establecen en todas las respuestas, incluyendo errores

