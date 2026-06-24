# Sitio Web para Actividades Sociales
## Proyecto del Grupo 5

---

## Estructura del Proyecto

```
.
├── src/                  # Código fuente React
│   ├── main.jsx         # Punto de entrada
│   ├── App.jsx          # Componente raíz
│   └── styles.css       # Estilos globales
├── index.html           # Archivo HTML principal
├── package.json         # Dependencias Node
├── vite.config.js       # Configuración Vite
└── README.md            # Este archivo
```

## Tecnología

- **Frontend**: React 18 + Vite
- **Base de datos**: MongoDB Atlas (en la nube)

## Instalación y Ejecución

### Local (desde el host)

```bash
# Instalar dependencias
npm install

# Iniciar el backend en localhost:8000
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Iniciar el frontend en localhost:3000
npm run dev
```

En este modo el `vite.config.js` debe reenviar las solicitudes de API a `http://localhost:8000`.

```js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/usuarios': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/actividades': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

### En Docker

Este repositorio ya incluye un `Dockerfile` para ejecutar el frontend en un contenedor.

```bash
docker build -t eventura-frontend .

docker run --rm -it \
  -p 3000:3000 \
  -v "$PWD:/workspace" \
  -w /workspace \
  -e BACKEND_URL=http://host.docker.internal:8000 \
  eventura-frontend
```

- `-p 3000:3000` expone el frontend en `http://localhost:3000`.
- `-v "$PWD:/workspace"` monta el código local dentro del contenedor.
- `BACKEND_URL=http://host.docker.internal:8000` conecta al backend que corre en tu Windows host.

Si tu backend está dentro de Docker en otra red, reemplaza `BACKEND_URL` por la URL correcta del backend.

En Docker el `vite.config.js` puede usar `host.docker.internal` o la variable de entorno `BACKEND_URL`:

```js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/usuarios': {
        target: process.env.BACKEND_URL || 'http://host.docker.internal:8000',
        changeOrigin: true,
      },
      '/actividades': {
        target: process.env.BACKEND_URL || 'http://host.docker.internal:8000',
        changeOrigin: true,
      },
      '/health': {
        target: process.env.BACKEND_URL || 'http://host.docker.internal:8000',
        changeOrigin: true,
      },
    },
  },
})
```

### Docker Compose

Si prefieres usar `docker-compose`, crea un archivo `docker-compose.yml` con una configuración similar a esta:

```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - '3000:3000'
    volumes:
      - ./:/workspace
    working_dir: /workspace
    environment:
      - BACKEND_URL=http://host.docker.internal:8000
    command: npm run dev -- --host 0.0.0.0 --port 3000
```

Luego ejecuta:

```bash
docker compose up --build
```

Esto levanta el frontend en `http://localhost:3000` y reenvía las rutas al backend definido en `BACKEND_URL`.

### Notas de conexión

- Si el backend corre en Windows y el frontend en Docker Desktop, `host.docker.internal` es la forma recomendada de referenciar el host.
- Si el backend corre en otra máquina o en otro contenedor, usa ese host/puerto en `BACKEND_URL`.
- Si el backend está en el mismo contenedor, apunta a `http://localhost:8000`.

## Conexión con el backend

Este frontend comunica con el backend FastAPI a través de las siguientes rutas:

- `POST /usuarios/registro` → registro de usuario
- `POST /usuarios/login` → inicio de sesión
- `GET /usuarios/` → listar usuarios
- `GET /actividades` → lista de eventos
- `GET /health` → estado de la API

Para probar localmente, inicia el backend con:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Luego ejecuta el frontend con:

```bash
npm run dev
```