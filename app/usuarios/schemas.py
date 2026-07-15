from pydantic import BaseModel, EmailStr
from typing import Optional

class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    imagen_url: Optional[str] = None

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str

class Usuario(UsuarioBase):
    id: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str


class PerfilUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    imagen_url: Optional[str] = None


from app.actividades.schemas import Evento

class PerfilUsuarioResponse(BaseModel):
    usuario: Usuario
    eventos_creados: list[Evento]
    eventos_asistidos: list[Evento]

