import hashlib
from fastapi import HTTPException, status
from bson import ObjectId
from app.database import db
from app.usuarios import schemas

COLLECTION_NAME = "usuarios"


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def get_usuarios():
    usuarios = []
    for usuario in db[COLLECTION_NAME].find({}, {"password": 0}):
        usuario["id"] = str(usuario.pop("_id"))
        usuarios.append(usuario)
    return usuarios


def get_usuario_por_email(email: str):
    return db[COLLECTION_NAME].find_one({"email": email})


def crear_usuario(usuario: schemas.UsuarioCreate):
    usuario_data = usuario.model_dump()
    usuario_data["password"] = _hash_password(usuario_data["password"])
    result = db[COLLECTION_NAME].insert_one(usuario_data)
    return {
        "id": str(result.inserted_id),
        "nombre": usuario_data["nombre"],
        "email": usuario_data["email"],
    }


def autenticar_usuario(email: str, password: str):
    usuario = get_usuario_por_email(email)
    if not usuario:
        return None

    hashed_password = _hash_password(password)
    if usuario.get("password") != hashed_password:
        return None

    return {
        "id": str(usuario.get("_id")),
        "nombre": usuario.get("nombre"),
        "email": usuario.get("email"),
    }


def actualizar_usuario_perfil(usuario_id: str, perfil_update: schemas.PerfilUpdate):
    try:
        obj_id = ObjectId(usuario_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de usuario inválido",
        )

    usuario = db[COLLECTION_NAME].find_one({"_id": obj_id})
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    update_data = {
        k: v for k, v in perfil_update.model_dump(exclude_unset=True).items()
        if v is not None
    }

    # Validar si intenta cambiar el email y si este ya está tomado por otro usuario
    if "email" in update_data and update_data["email"] != usuario["email"]:
        email_duplicado = db[COLLECTION_NAME].find_one({"email": update_data["email"]})
        if email_duplicado:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado por otro usuario",
            )

    # Cifrar password si se está actualizando (e ignorar si viene vacía)
    if "password" in update_data:
        if isinstance(update_data["password"], str) and not update_data["password"].strip():
            del update_data["password"]
        else:
            update_data["password"] = _hash_password(update_data["password"])

    if not update_data:
        usuario["id"] = str(usuario.pop("_id"))
        usuario.pop("password", None)
        return usuario

    db[COLLECTION_NAME].update_one(
        {"_id": obj_id},
        {"$set": update_data}
    )

    # Obtener el usuario actualizado
    usuario_actualizado = db[COLLECTION_NAME].find_one({"_id": obj_id})
    usuario_actualizado["id"] = str(usuario_actualizado.pop("_id"))
    usuario_actualizado.pop("password", None)
    return usuario_actualizado

