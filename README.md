# Sitio web para actividades sociales - BackEnd

Este repositorio contiene únicamente el backend para el sitio web de actividades sociales. El backend está implementado en Python usando FastAPI.

## Descripción

- Backend del proyecto: API REST para gestionar actividades sociales y usuarios.
- Tecnología principal: Python
- Framework: FastAPI
- Enfoque: lógica del servidor, rutas, esquemas y servicios.

## Estructura del proyecto

- `requirements.txt` - dependencias del proyecto.
- `app/` - paquete principal de la aplicación.
  - `__init__.py` - inicializa el paquete.
  - `config.py` - configuración de la aplicación.
  - `database.py` - conexión y manejo de la base de datos.
  - `main.py` - punto de entrada de la aplicación FastAPI.
  - `actividades/` - módulo básico de actividades. La lógica completa de actividades se desarrolla en otra historia.
    - `router.py` - rutas básicas de actividades.
    - `schemas.py` - esquemas Pydantic de actividades.
    - `services.py` - stubs de servicio de actividades.
  - `usuarios/` - módulo para funcionalidades de usuarios.
    - `router.py` - rutas de usuarios.
    - `schemas.py` - esquemas Pydantic para usuarios.
    - `services.py` - lógica de negocio de usuarios.

## Uso

1. Crear un entorno virtual de Python:

```bash
python -m venv .venv
```

2. Activar el entorno virtual:

- Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

- Windows CMD:

```cmd
.\.venv\Scripts\activate.bat
```

3. Instalar dependencias:

```bash
pip install -r requirements.txt
```

4. Ejecutar la aplicación con Uvicorn:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

5. Probar la API en el navegador o con herramientas como Postman en:

```
http://localhost:8000
```

6. Documentación automática de FastAPI:

```
http://localhost:8000/docs
```

## Variables de entorno

El proyecto usa un archivo `.env` local para la configuración de MongoDB.
No debe subirse el archivo `.env` al repositorio.

Ejemplo de `.env`:

```env
MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net
DATABASE_NAME=metodologiasutn_db
```

Asegúrate de reemplazar `<usuario>`, `<contraseña>` y `<cluster>` por tus valores reales en tu entorno local.

## Rutas principales

### `GET /`
- Descripción: devuelve un mensaje de bienvenida.
- Respuesta:
```json
{"mensaje": "Hola Mundo"}
```

### `GET /health`
- Descripción: verifica la conexión con MongoDB.
- Respuesta exitosa:
```json
{"status": "ok", "message": "Conexión a la base de datos exitosa"}
```

### `GET /usuarios/`
- Descripción: lista todos los usuarios registrados.
- Respuesta:
```json
[
  {
    "id": "647b8f4a...",
    "nombre": "Juan Pérez",
    "email": "juan@example.com"
  }
]
```

### `POST /usuarios/registro`
- Descripción: registra un nuevo usuario.
- Body `application/json`:
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "MiClaveSegura123"
}
```
- Respuesta exitosa `201 Created`:
```json
{
  "id": "647b8f4a...",
  "nombre": "Juan Pérez",
  "email": "juan@example.com"
}
```
- Error si el email ya existe:
```json
{"detail": "El email ya está registrado"}
```

### `POST /usuarios/login`
- Descripción: inicia sesión con email y contraseña.
- Body `application/json`:
```json
{
  "email": "juan@example.com",
  "password": "MiClaveSegura123"
}
```
- Respuesta exitosa:
```json
{
  "id": "647b8f4a...",
  "nombre": "Juan Pérez",
  "email": "juan@example.com"
}
```
- Error si las credenciales son inválidas `401 Unauthorized`:
```json
{"detail": "Email o contraseña incorrectos"}
```

> Las rutas de actividades existen en el código, pero la US actual cubre sólo la creación/registro de usuarios e inicio de sesión.

> Nota: Este repositorio no incluye frontend; está dedicado al desarrollo del backend con FastAPI.
