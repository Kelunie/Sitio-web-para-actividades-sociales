from pydantic import BaseModel
from typing import Optional

class ActividadBase(BaseModel):
    titulo: str
    descripcion: str
    fecha: Optional[str] = None

class ActividadCreate(ActividadBase):
    pass

class Actividad(ActividadBase):
    id: Optional[str] = None
