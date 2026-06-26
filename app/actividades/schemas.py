from pydantic import BaseModel
from typing import Literal, Optional


class ActividadBase(BaseModel):
    titulo: str
    descripcion: str
    fecha: Optional[str] = None


class ActividadCreate(ActividadBase):
    pass


class Actividad(ActividadBase):
    id: Optional[str] = None


EstadoEvento = Literal["disponible", "reservado", "cancelado"]


class EventoBase(BaseModel):
    nombre: str
    fecha: str
    lugar: str
    descripcion: str
    capacidad: Optional[int] = None
    estado: Optional[EstadoEvento] = "disponible"


class EventoCreate(EventoBase):
    pass


class Evento(EventoBase):
    id: Optional[str] = None

    class Config:
        from_attributes = True