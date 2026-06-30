# Punto de entrada de la aplicación
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.actividades.router import router as actividades_router
from app.usuarios.router import router as usuarios_router
from app.database import client

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "error", "message": str(e)}
        )

@app.get("/health")
def health():
    return health_check()