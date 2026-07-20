from fastapi import HTTPException, status
from bson import ObjectId
from typing import Optional
from app.database import db
from app.actividades import schemas


ACTIVIDADES_COLLECTION_NAME = "actividades"
EVENTOS_COLLECTION_NAME = "eventos"
USUARIOS_COLLECTION_NAME = "usuarios"


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


def get_eventos(busqueda: Optional[str] = None):
    filtro = {}
    if busqueda:
        filtro = {"nombre": {"$regex": busqueda.strip(), "$options": "i"}}

    eventos = []
    for evento in db[EVENTOS_COLLECTION_NAME].find(filtro):
        eventos.append(_serializar_documento(evento))
    return eventos


def crear_evento(evento: schemas.EventoCreate, usuario: dict):
    evento_data = evento.model_dump(exclude_none=True)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Debe iniciar sesión para crear un evento",
        )

    evento_data["creado_por"] = usuario.get("id")
    evento_data["asistentes"] = []

    result = db[EVENTOS_COLLECTION_NAME].insert_one(evento_data)
    return {
        "id": str(result.inserted_id),
        **evento_data,
    }


def get_evento_por_id(evento_id: str):
    try:
        obj_id = ObjectId(evento_id)
    except Exception:
        return None
    evento = db[EVENTOS_COLLECTION_NAME].find_one({"_id": obj_id})
    if evento:
        return _serializar_documento(evento)
    return None


def unirse_a_evento(evento_id: str, usuario_id: str):
    evento = get_evento_por_id(evento_id)
    if not evento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado",
        )

    if evento.get("estado") != "disponible":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El evento no está disponible",
        )

    capacidad = evento.get("capacidad")
    asistentes = evento.get("asistentes", [])
    if capacidad is not None and len(asistentes) >= capacidad:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El evento ha alcanzado su capacidad máxima",
        )

    if usuario_id in asistentes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya estás registrado en este evento",
        )

    db[EVENTOS_COLLECTION_NAME].update_one(
        {"_id": ObjectId(evento_id)},
        {"$addToSet": {"asistentes": usuario_id}}
    )
    return get_evento_por_id(evento_id)


def actualizar_evento(evento_id: str, evento_update: schemas.EventoUpdate, usuario_id: str):
    evento = get_evento_por_id(evento_id)
    if not evento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado",
        )

    if evento.get("creado_por") != usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para editar este evento",
        )

    update_data = evento_update.model_dump(exclude_unset=True)
    if not update_data:
        return evento

    db[EVENTOS_COLLECTION_NAME].update_one(
        {"_id": ObjectId(evento_id)},
        {"$set": update_data}
    )
    return get_evento_por_id(evento_id)


def eliminar_evento(evento_id: str, usuario_id: str):
    evento = get_evento_por_id(evento_id)
    if not evento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado",
        )

    if evento.get("creado_por") != usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para eliminar este evento",
        )

    db[EVENTOS_COLLECTION_NAME].delete_one({"_id": ObjectId(evento_id)})
    return {"mensaje": "Evento eliminado exitosamente"}


def get_eventos_por_creador(usuario_id: str):
    eventos = []
    for evento in db[EVENTOS_COLLECTION_NAME].find({"creado_por": usuario_id}):
        eventos.append(_serializar_documento(evento))
    return eventos


def get_asistentes_evento(evento_id: str):
    evento = get_evento_por_id(evento_id)
    if not evento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado",
        )

    asistentes_ids = evento.get("asistentes", [])
    if not asistentes_ids:
        return []

    object_ids = [ObjectId(usuario_id) for usuario_id in asistentes_ids]
    asistentes = []
    for usuario in db[USUARIOS_COLLECTION_NAME].find(
        {"_id": {"$in": object_ids}}, {"password": 0}
    ):
        asistentes.append({
            "id": str(usuario["_id"]),
            "nombre": usuario.get("nombre"),
            "email": usuario.get("email"),
        })
    return asistentes


def get_eventos_por_asistente(usuario_id: str):
    eventos = []
    for evento in db[EVENTOS_COLLECTION_NAME].find({"asistentes": usuario_id}):
        eventos.append(_serializar_documento(evento))
    return eventos