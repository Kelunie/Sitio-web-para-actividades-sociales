from fastapi import APIRouter, Depends, status
from app.auth import get_current_user
from app.actividades import schemas, services


router = APIRouter(prefix="/actividades", tags=["actividades"])


@router.get("/", response_model=list[schemas.Actividad], summary="Listar actividades")
def listar_actividades():
    return services.get_actividades()


@router.post("/crear", response_model=dict, summary="Crear una nueva actividad")
def crear_actividad(actividad: schemas.ActividadCreate):
    return services.crear_actividad(actividad)


eventos_router = APIRouter(prefix="/eventos", tags=["eventos"])


@eventos_router.get("/", response_model=list[schemas.Evento], summary="Listar eventos")
def listar_eventos():
    return services.get_eventos()


@eventos_router.post(
    "/crear",
    response_model=schemas.Evento,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un evento",
)
def crear_evento(
    evento: schemas.EventoCreate,
    usuario=Depends(get_current_user),
):
    return services.crear_evento(evento, usuario)


@eventos_router.post(
    "/{evento_id}/unirse",
    response_model=schemas.Evento,
    summary="Unirse a un evento",
)
def unirse_a_evento(
    evento_id: str,
    usuario=Depends(get_current_user),
):
    return services.unirse_a_evento(evento_id, usuario["id"])


@eventos_router.put(
    "/{evento_id}",
    response_model=schemas.Evento,
    summary="Editar un evento",
)
def editar_evento(
    evento_id: str,
    evento_update: schemas.EventoUpdate,
    usuario=Depends(get_current_user),
):
    return services.actualizar_evento(evento_id, evento_update, usuario["id"])


@eventos_router.delete(
    "/{evento_id}",
    response_model=dict,
    summary="Eliminar un evento",
)
def eliminar_evento(
    evento_id: str,
    usuario=Depends(get_current_user),
):
    return services.eliminar_evento(evento_id, usuario["id"])


router.include_router(eventos_router)

