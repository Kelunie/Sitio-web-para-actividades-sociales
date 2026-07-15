from pydantic import BaseModel 
from datetime import date, datetime
from pydantic import field_validator
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
    imagen_url: Optional[str] = None

    @field_validator("nombre", "lugar", "descripcion")
    @classmethod
    def campo_obligatorio_no_vacio(cls, valor, info):
        if valor is None or not valor.strip():
            raise ValueError(f"El campo '{info.field_name}' es obligatorio")
        return valor.strip()

    @field_validator("fecha")
    @classmethod
    def validar_fecha(cls, valor):
        if valor is None or not valor.strip():
            raise ValueError("La fecha es obligatoria")
        valor = valor.strip()
        try:
            datetime.strptime(valor, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError("La fecha no es válida, debe tener el formato YYYY-MM-DD")
        return valor


class EventoCreate(EventoBase):
    @field_validator("fecha")
    @classmethod
    def validar_fecha_creacion(cls, valor):
        fecha_evento = datetime.strptime(valor.strip(), "%Y-%m-%d").date()
        if fecha_evento < date.today():
            raise ValueError("La fecha no puede ser anterior al día de hoy")
        return valor


class Evento(EventoBase):
    id: Optional[str] = None
    asistentes: list[str] = []
    creado_por: Optional[str] = None

    class Config:
        from_attributes = True


class EventoUpdate(BaseModel):
    nombre: Optional[str] = None
    fecha: Optional[str] = None
    lugar: Optional[str] = None
    descripcion: Optional[str] = None
    capacidad: Optional[int] = None
    estado: Optional[EstadoEvento] = None
    imagen_url: Optional[str] = None

    @field_validator("nombre", "lugar", "descripcion")
    @classmethod
    def validar_campos_opcionales(cls, valor, info):
        if valor is not None and not valor.strip():
            raise ValueError(f"El campo '{info.field_name}' no puede estar vacío")
        return valor.strip() if valor is not None else None

    @field_validator("fecha")
    @classmethod
    def validar_fecha(cls, valor):
        if valor is not None:
            valor = valor.strip()
            try:
                datetime.strptime(valor, "%Y-%m-%d").date()
            except ValueError:
                raise ValueError("La fecha no es válida, debe tener el formato YYYY-MM-DD")
        return valor