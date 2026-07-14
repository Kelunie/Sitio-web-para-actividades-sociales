import hashlib
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


def actualizar_usuario(email: str, datos: schemas.UsuarioUpdate):
    cambios = {k: v for k, v in datos.model_dump(exclude_unset=True).items() if v is not None}

    if "email" in cambios and cambios["email"] != email:
        if get_usuario_por_email(cambios["email"]):
            raise ValueError("El email ya está registrado")

    if cambios:
        db[COLLECTION_NAME].update_one({"email": email}, {"$set": cambios})

    usuario = get_usuario_por_email(cambios.get("email", email))
    return {
        "id": str(usuario["_id"]),
        "nombre": usuario["nombre"],
        "email": usuario["email"],
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
