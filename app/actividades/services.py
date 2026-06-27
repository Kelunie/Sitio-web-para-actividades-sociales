from fastapi import HTTPException, status
from app.database import db
from app.actividades import schemas


ACTIVIDADES_COLLECTION_NAME = "actividades"
EVENTOS_COLLECTION_NAME = "eventos"


def _serializar_documento(documento):
    documento["id"] = str(documento.pop("_id"))
    return documento


def get_actividades():
    actividades = []
    for actividad in db[ACTIVIDADES_COLLECTION_NAME].find({}):
        actividades.append(_serializar_documento(actividad))
    return actividades


def crear_actividad(actividad):
    actividad_data = actividad.model_dump(exclude_none=True)
    result = db[ACTIVIDADES_COLLECTION_NAME].insert_one(actividad_data)
    return {
        "id": str(result.inserted_id),
        **actividad_data,
    }


def get_eventos():
    eventos = []
    for evento in db[EVENTOS_COLLECTION_NAME].find({}):
        eventos.append(_serializar_documento(evento))
    return eventos


def crear_evento(evento: schemas.EventoCreate, usuario: dict):
    evento_data = evento.model_dump(exclude_none=True)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Debe iniciar sesión para crear un evento",
        )

    evento_data["creado_por"] = usuario.get("id") or usuario.get("email")

    result = db[EVENTOS_COLLECTION_NAME].insert_one(evento_data)
    return {
        "id": str(result.inserted_id),
        **evento_data,
    }