from fastapi import APIRouter, HTTPException, status
from app.usuarios import schemas, services
from app.auth import crear_token

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

@router.get("/", response_model=list[schemas.Usuario], summary="Listar usuarios")
def listar_usuarios():
    return services.get_usuarios()

@router.post(
    "/registro",
    response_model=schemas.Usuario,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar un usuario",
)
def registrar_usuario(usuario: schemas.UsuarioCreate):
    if services.get_usuario_por_email(usuario.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado",
        )
    return services.crear_usuario(usuario)

@router.post(
    "/login",
    response_model=schemas.Token,
    summary="Iniciar sesión",
)
def iniciar_sesion(credentials: schemas.UsuarioLogin):
    usuario = services.autenticar_usuario(credentials.email, credentials.password)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )
    token = crear_token(usuario["email"])
    return {"access_token": token, "token_type": "bearer"}
