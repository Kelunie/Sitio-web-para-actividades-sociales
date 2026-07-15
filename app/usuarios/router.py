from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.usuarios import schemas, services
from app.auth import crear_token, get_current_user

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
def iniciar_sesion(credentials: schemas.UsuarioLogin, request: Request):
    usuario = services.autenticar_usuario(credentials.email, credentials.password)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )
    token = crear_token(usuario["email"], usuario.get("nombre"))
    return {"access_token": token, "token_type": "bearer"}


@router.get(
    "/perfil",
    response_model=schemas.PerfilUsuarioResponse,
    summary="Ver perfil del usuario con sus eventos creados y asistidos",
)
def ver_perfil(
    current_user: dict = Depends(get_current_user),
):
    from app.actividades import services as actividades_services

    eventos_creados = actividades_services.get_eventos_por_creador(current_user["id"])
    eventos_asistidos = actividades_services.get_eventos_por_asistente(current_user["id"])

    return {
        "usuario": current_user,
        "eventos_creados": eventos_creados,
        "eventos_asistidos": eventos_asistidos,
    }


@router.put(
    "/perfil",
    response_model=schemas.Usuario,
    summary="Actualizar perfil de usuario",
)
def actualizar_perfil(
    perfil_update: schemas.PerfilUpdate,
    current_user: dict = Depends(get_current_user),
):
    return services.actualizar_usuario_perfil(current_user["id"], perfil_update)


