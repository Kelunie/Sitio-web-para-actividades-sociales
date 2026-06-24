# conexión y sesión con la base de datos
from pymongo import MongoClient
from app.config import MONGODB_URI, DATABASE_NAME

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI no está definido. Verifica tu archivo .env o las variables de entorno.")

client = MongoClient(MONGODB_URI)

db = client[DATABASE_NAME]