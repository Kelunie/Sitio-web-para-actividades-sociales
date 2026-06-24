# Punto de entrada de la aoplicación
from fastapi import FastAPI
from app.actividades.router import router as actividades_router
from app.usuarios.router import router as usuarios_router
from app.database import client

app = FastAPI()
app.include_router(actividades_router)
app.include_router(usuarios_router)

@app.get("/")
def root():
    return {"mensaje": "Hola Mundo"}


def health_check():
    try:
        # Verificar la conexión a la base de datos
        client.admin.command('ping')
        return {"status": "ok", "message": "Conexión a la base de datos exitosa"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/health")
def health():
    return health_check()