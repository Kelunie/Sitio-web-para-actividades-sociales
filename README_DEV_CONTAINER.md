Instrucciones rápidas para abrir el proyecto en un contenedor

1) Desde VS Code (recomendado)
- Instala la extensión "Dev Containers" o "Remote - Containers".
- Abre la carpeta del repositorio en VS Code.
- Abre la paleta de comandos y ejecuta: "Dev Containers: Reopen in Container".

2) Ejecutar manualmente con Docker (PowerShell)
```powershell
docker run --rm -it -p 3000:3000 -v ${PWD}:/workspace -w /workspace node:24-slim sh -c "npm install && npm run dev -- --host 0.0.0.0 --port 3000"
```

Notas:
- El contenedor en este repo usa el `Dockerfile` existente y expone el puerto `3000`.
- Si prefieres usar la imagen oficial directa, el `.devcontainer/devcontainer.json` ya está configurado para usar el `Dockerfile` del repo.
