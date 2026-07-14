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
    response_model=schemas.Usuario,
    summary="Ver perfil del usuario autenticado",
)
def ver_perfil(usuario_actual: dict = Depends(get_current_user)):
    return usuario_actual

@router.put(
    "/perfil",
    response_model=schemas.Usuario,
    summary="Actualizar perfil del usuario autenticado",
)
def actualizar_perfil(
    datos: schemas.UsuarioUpdate,
    usuario_actual: dict = Depends(get_current_user),
):
    try:
        return services.actualizar_usuario(usuario_actual["email"], datos)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )
