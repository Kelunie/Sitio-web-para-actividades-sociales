import unittest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException, status
from fastapi.requests import Request
from app.main import root, health
from app.usuarios.router import listar_usuarios, registrar_usuario, iniciar_sesion, ver_perfil, actualizar_perfil
from app.actividades.router import (
    listar_actividades,
    crear_actividad,
    listar_eventos,
    crear_evento,
    unirse_a_evento,
    editar_evento,
    eliminar_evento,
)
from app.usuarios import schemas as usuarios_schemas
from app.actividades import schemas as actividades_schemas
from bson import ObjectId

class TestEndpoints(unittest.TestCase):
    @patch('app.main.client')
    def test_health_success(self, mock_client):
        mock_client.admin.command.return_value = {"ok": 1.0}
        response = health()
        self.assertEqual(response["status"], "ok")
        self.assertEqual(response["message"], "Conexión a la base de datos exitosa")

    @patch('app.main.client')
    def test_health_failure(self, mock_client):
        mock_client.admin.command.side_effect = Exception("Connection refused")
        with self.assertRaises(HTTPException) as context:
            health()
        self.assertEqual(context.exception.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(context.exception.detail["status"], "error")

    @patch('app.usuarios.services.db')
    def test_listar_usuarios(self, mock_db):
        mock_db.__getitem__.return_value.find.return_value = [
            {"_id": ObjectId("60d5ec4b9b0d6542c8d23456"), "nombre": "Juan Perez", "email": "juan@example.com"}
        ]
        response = listar_usuarios()
        self.assertEqual(len(response), 1)
        self.assertEqual(response[0]["id"], "60d5ec4b9b0d6542c8d23456")
        self.assertEqual(response[0]["nombre"], "Juan Perez")

    @patch('app.usuarios.router.services')
    def test_registrar_usuario_exito(self, mock_services):
        mock_services.get_usuario_por_email.return_value = None
        mock_usuario = usuarios_schemas.UsuarioCreate(
            nombre="Juan Perez",
            email="juan@example.com",
            password="securepassword"
        )
        mock_services.crear_usuario.return_value = {
            "id": "60d5ec4b9b0d6542c8d23456",
            "nombre": "Juan Perez",
            "email": "juan@example.com"
        }
        response = registrar_usuario(mock_usuario)
        self.assertEqual(response["id"], "60d5ec4b9b0d6542c8d23456")
        self.assertEqual(response["nombre"], "Juan Perez")

    @patch('app.usuarios.router.services')
    def test_registrar_usuario_duplicado(self, mock_services):
        mock_services.get_usuario_por_email.return_value = {"_id": "some_id"}
        mock_usuario = usuarios_schemas.UsuarioCreate(
            nombre="Juan Perez",
            email="juan@example.com",
            password="securepassword"
        )
        with self.assertRaises(HTTPException) as context:
            registrar_usuario(mock_usuario)
        self.assertEqual(context.exception.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(context.exception.detail, "El email ya está registrado")

    @patch('app.usuarios.router.services')
    @patch('app.usuarios.router.crear_token')
    def test_iniciar_sesion_exito(self, mock_crear_token, mock_services):
        mock_services.autenticar_usuario.return_value = {
            "id": "60d5ec4b9b0d6542c8d23456",
            "nombre": "Juan Perez",
            "email": "juan@example.com"
        }
        mock_crear_token.return_value = "fake-jwt-token"
        
        credentials = usuarios_schemas.UsuarioLogin(
            email="juan@example.com",
            password="securepassword"
        )
        mock_request = MagicMock(spec=Request)
        
        response = iniciar_sesion(credentials, mock_request)
        self.assertEqual(response["access_token"], "fake-jwt-token")
        self.assertEqual(response["token_type"], "bearer")

    @patch('app.usuarios.router.services')
    def test_iniciar_sesion_fallida(self, mock_services):
        mock_services.autenticar_usuario.return_value = None
        credentials = usuarios_schemas.UsuarioLogin(
            email="juan@example.com",
            password="wrongpassword"
        )
        mock_request = MagicMock(spec=Request)
        
        with self.assertRaises(HTTPException) as context:
            iniciar_sesion(credentials, mock_request)
        self.assertEqual(context.exception.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(context.exception.detail, "Email o contraseña incorrectos")

    @patch('app.actividades.services.db')
    def test_listar_actividades(self, mock_db):
        mock_db.__getitem__.return_value.find.return_value = [
            {"_id": ObjectId("60d5ec4b9b0d6542c8d23457"), "titulo": "Taller", "descripcion": "Desc", "fecha": "2026-07-01"}
        ]
        response = listar_actividades()
        self.assertEqual(len(response), 1)
        self.assertEqual(response[0]["id"], "60d5ec4b9b0d6542c8d23457")
        self.assertEqual(response[0]["titulo"], "Taller")

    @patch('app.actividades.router.services')
    def test_crear_actividad(self, mock_services):
        actividad_in = actividades_schemas.ActividadCreate(
            titulo="Taller",
            descripcion="Desc",
            fecha="2026-07-01"
        )
        mock_services.crear_actividad.return_value = {
            "id": "60d5ec4b9b0d6542c8d23457",
            "titulo": "Taller",
            "descripcion": "Desc",
            "fecha": "2026-07-01"
        }
        response = crear_actividad(actividad_in)
        self.assertEqual(response["id"], "60d5ec4b9b0d6542c8d23457")
        self.assertEqual(response["titulo"], "Taller")

    @patch('app.actividades.services.db')
    def test_listar_eventos(self, mock_db):
        mock_db.__getitem__.return_value.find.return_value = [
            {
                "_id": ObjectId("60d5ec4b9b0d6542c8d23458"),
                "nombre": "Evento",
                "fecha": "2026-07-01",
                "lugar": "Lugar",
                "descripcion": "Desc",
                "capacidad": 10,
                "estado": "disponible"
            }
        ]
        response = listar_eventos()
        self.assertEqual(len(response), 1)
        self.assertEqual(response[0]["id"], "60d5ec4b9b0d6542c8d23458")
        self.assertEqual(response[0]["nombre"], "Evento")

    @patch('app.actividades.router.services')
    def test_crear_evento(self, mock_services):
        evento_in = actividades_schemas.EventoCreate(
            nombre="Evento",
            fecha="2026-12-31",
            lugar="Lugar",
            descripcion="Desc",
            capacidad=10,
            estado="disponible"
        )
        mock_user = {"id": "user_id", "email": "user@example.com", "nombre": "User"}
        mock_services.crear_evento.return_value = {
            "id": "60d5ec4b9b0d6542c8d23458",
            "nombre": "Evento",
            "fecha": "2026-12-31",
            "lugar": "Lugar",
            "descripcion": "Desc",
            "capacidad": 10,
            "estado": "disponible"
        }
        response = crear_evento(evento_in, mock_user)
        self.assertEqual(response["id"], "60d5ec4b9b0d6542c8d23458")
        self.assertEqual(response["nombre"], "Evento")

    @patch('app.actividades.services.get_eventos_por_creador')
    @patch('app.actividades.services.get_eventos_por_asistente')
    def test_ver_perfil(self, mock_get_asistente, mock_get_creador):
        mock_get_creador.return_value = [{"id": "event_id_1", "nombre": "Evento Creado"}]
        mock_get_asistente.return_value = [{"id": "event_id_2", "nombre": "Evento Asistido"}]
        mock_user = {"id": "user_id", "email": "user@example.com", "nombre": "User"}
        
        response = ver_perfil(mock_user)
        self.assertEqual(response["usuario"]["id"], "user_id")
        self.assertEqual(len(response["eventos_creados"]), 1)
        self.assertEqual(response["eventos_creados"][0]["nombre"], "Evento Creado")
        self.assertEqual(len(response["eventos_asistidos"]), 1)
        self.assertEqual(response["eventos_asistidos"][0]["nombre"], "Evento Asistido")

    @patch('app.actividades.router.services')
    def test_unirse_a_evento(self, mock_services):
        mock_user = {"id": "user_id", "email": "user@example.com", "nombre": "User"}
        mock_services.unirse_a_evento.return_value = {
            "id": "60d5ec4b9b0d6542c8d23458",
            "nombre": "Evento",
            "asistentes": ["user_id"]
        }
        
        response = unirse_a_evento("60d5ec4b9b0d6542c8d23458", mock_user)
        self.assertEqual(response["id"], "60d5ec4b9b0d6542c8d23458")
        self.assertIn("user_id", response["asistentes"])

    @patch('app.actividades.router.services')
    def test_editar_evento(self, mock_services):
        mock_user = {"id": "user_id", "email": "user@example.com", "nombre": "User"}
        evento_update = actividades_schemas.EventoUpdate(
            nombre="Nombre Editado",
            descripcion="Nueva Desc"
        )
        mock_services.actualizar_evento.return_value = {
            "id": "60d5ec4b9b0d6542c8d23458",
            "nombre": "Nombre Editado",
            "descripcion": "Nueva Desc"
        }
        
        response = editar_evento("60d5ec4b9b0d6542c8d23458", evento_update, mock_user)
        self.assertEqual(response["id"], "60d5ec4b9b0d6542c8d23458")
        self.assertEqual(response["nombre"], "Nombre Editado")

    @patch('app.actividades.router.services')
    def test_eliminar_evento(self, mock_services):
        mock_user = {"id": "user_id", "email": "user@example.com", "nombre": "User"}
        mock_services.eliminar_evento.return_value = {"mensaje": "Evento eliminado exitosamente"}
        
        response = eliminar_evento("60d5ec4b9b0d6542c8d23458", mock_user)
        self.assertEqual(response["mensaje"], "Evento eliminado exitosamente")

    @patch('app.usuarios.router.services')
    def test_actualizar_perfil(self, mock_services):
        mock_user = {"id": "user_id", "email": "user@example.com", "nombre": "User"}
        perfil_update = usuarios_schemas.PerfilUpdate(
            nombre="User Editado",
            imagen_url="http://example.com/image.png"
        )
        mock_services.actualizar_usuario_perfil.return_value = {
            "id": "user_id",
            "nombre": "User Editado",
            "email": "user@example.com",
            "imagen_url": "http://example.com/image.png"
        }
        
        response = actualizar_perfil(perfil_update, mock_user)
        self.assertEqual(response["id"], "user_id")
        self.assertEqual(response["nombre"], "User Editado")
        self.assertEqual(response["imagen_url"], "http://example.com/image.png")

if __name__ == "__main__":
    unittest.main()
