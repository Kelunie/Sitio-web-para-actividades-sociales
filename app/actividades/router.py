from fastapi import APIRouter
from app.actividades import schemas, services

router = APIRouter(prefix="/actividades", tags=["actividades"])

@router.get("/", response_model=list[schemas.Actividad], summary="Listar actividades")
def listar_actividades():
    return services.get_actividades()

@router.post("/crear", response_model=dict, summary="Crear una nueva actividad")
def crear_actividad(actividad: schemas.ActividadCreate):
    return services.crear_actividad(actividad)
