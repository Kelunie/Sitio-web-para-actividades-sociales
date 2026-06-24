import hashlib
from app.database import db
from app.usuarios import schemas

COLLECTION_NAME = "usuarios"


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def get_usuarios():
    return list(db[COLLECTION_NAME].find({}, {"_id": 0, "password": 0}))


def get_usuario_por_email(email: str):
    return db[COLLECTION_NAME].find_one({"email": email})


def crear_usuario(usuario: schemas.UsuarioCreate):
    usuario_data = usuario.dict()
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
