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

5. Ejecutar la aplicación con Uvicorn:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

6. Probar la API en el navegador o con herramientas como Postman en:

```
http://localhost:8000
```

7. Documentación automática de FastAPI:

```
http://localhost:8000/docs
```

## Variables de entorno

El proyecto usa un archivo `.env` local para la configuración de MongoDB.
No debe subirse el archivo `.env` al repositorio.

El archivo `.env` debe contener los valores de MongoDB que te compartieron para este proyecto.

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
- Descripción: Inicia sesión con email y contraseña, retornando un token JWT.
- Para las rutas protegidas, se debe enviar este token en la cabecera HTTP `Authorization: Bearer <token>`.
- Body `application/json`:
```json
{
  "email": "juan@example.com",
  "password": "MiClaveSegura123"
}
```
- Respuesta exitosa `200 OK`:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```
- Error si las credenciales son inválidas `401 Unauthorized`:
```json
{"detail": "Email o contraseña incorrectos"}
```

### `GET /actividades/eventos/`
- Descripción: lista todos los eventos registrados.
- Respuesta:
```json
[
  {
    "id": "647b8f4a...",
    "nombre": "Taller de fotografía",
    "fecha": "2026-07-01",
    "lugar": "Auditorio central",
    "descripcion": "Evento para compartir conocimientos",
    "capacidad": 30,
    "estado": "disponible"
  }
]
```

### `POST /actividades/eventos/crear`
- Descripción: registra un nuevo evento.
- Requiere que el usuario ya haya iniciado sesión.
- Body `application/json`:
```json
{
  "nombre": "Taller de fotografía",
  "fecha": "2026-07-01",
  "lugar": "Auditorio central",
  "descripcion": "Evento para compartir conocimientos"
}
```
- Respuesta exitosa `201 Created`:
```json
{
  "id": "647b8f4a...",
  "nombre": "Taller de fotografía",
  "fecha": "2026-07-01",
  "lugar": "Auditorio central",
  "descripcion": "Evento para compartir conocimientos",
  "capacidad": null,
  "estado": "disponible"
}
```


