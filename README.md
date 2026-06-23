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
  - `actividades/` - módulo para funcionalidades de actividades.
    - `router.py` - rutas de actividades.
    - `schemas.py` - esquemas Pydantic para actividades.
    - `services.py` - lógica de negocio de actividades.
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

> Nota: Este repositorio no incluye frontend; está dedicado al desarrollo del backend con FastAPI.
