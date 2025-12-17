"""
Tests unitarios para la app de usuarios.
"""
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from .models import Usuario, Instructor


class UsuarioModelTest(TestCase):
    """Tests para el modelo Usuario."""
    
    def setUp(self):
        """Crear usuario de prueba."""
        self.usuario = Usuario.objects.create_user(
            username='testuser',
            email='test@gimnasio.com',
            password='TestPassword123!',
            first_name='Test',
            last_name='User',
            rol=Usuario.SOCIO,
            estado_membresia=Usuario.ACTIVA
        )
    
    def test_crear_usuario(self):
        """Test: Crear un usuario correctamente."""
        self.assertEqual(self.usuario.username, 'testuser')
        self.assertEqual(self.usuario.email, 'test@gimnasio.com')
        self.assertEqual(self.usuario.rol, Usuario.SOCIO)
        self.assertEqual(self.usuario.estado_membresia, Usuario.ACTIVA)
    
    def test_usuario_puede_reservar_activo(self):
        """Test: Usuario con membresía activa puede reservar."""
        self.assertTrue(self.usuario.puede_reservar())
    
    def test_usuario_no_puede_reservar_inactivo(self):
        """Test: Usuario con membresía inactiva no puede reservar."""
        self.usuario.estado_membresia = Usuario.INACTIVA
        self.usuario.save()
        self.assertFalse(self.usuario.puede_reservar())
    
    def test_usuario_no_puede_reservar_suspendido(self):
        """Test: Usuario suspendido no puede reservar."""
        self.usuario.estado_membresia = Usuario.SUSPENDIDA
        self.usuario.save()
        self.assertFalse(self.usuario.puede_reservar())
    
    def test_incrementar_noshow(self):
        """Test: Incrementar contador de no-shows."""
        self.assertEqual(self.usuario.total_noshow, 0)
        self.assertEqual(self.usuario.noshow_mes_actual, 0)
        
        self.usuario.incrementar_noshow()
        
        self.assertEqual(self.usuario.total_noshow, 1)
        self.assertEqual(self.usuario.noshow_mes_actual, 1)
    
    def test_bloqueo_por_tres_noshow(self):
        """Test: Usuario bloqueado después de 3 no-shows en el mes."""
        # Simular 3 no-shows
        for _ in range(3):
            self.usuario.incrementar_noshow()
        
        self.assertTrue(self.usuario.esta_bloqueado())
        self.assertEqual(self.usuario.estado_membresia, Usuario.SUSPENDIDA)
        self.assertIsNotNone(self.usuario.bloqueado_hasta)
    
    def test_usuario_bloqueado_no_puede_reservar(self):
        """Test: Usuario bloqueado no puede reservar."""
        self.usuario.bloqueado_hasta = timezone.now() + timedelta(days=30)
        self.usuario.save()
        
        self.assertTrue(self.usuario.esta_bloqueado())
        self.assertFalse(self.usuario.puede_reservar())
    
    def test_resetear_noshow_mensual(self):
        """Test: Resetear contador mensual de no-shows."""
        self.usuario.noshow_mes_actual = 2
        self.usuario.save()
        
        self.usuario.resetear_noshow_mensual()
        
        self.assertEqual(self.usuario.noshow_mes_actual, 0)
    
    def test_str_representation(self):
        """Test: Representación en string del usuario."""
        expected = f"{self.usuario.get_full_name()} ({self.usuario.get_rol_display()})"
        self.assertEqual(str(self.usuario), expected)


class InstructorModelTest(TestCase):
    """Tests para el modelo Instructor."""
    
    def setUp(self):
        """Crear instructor de prueba."""
        self.usuario_instructor = Usuario.objects.create_user(
            username='instructor1',
            email='instructor@gimnasio.com',
            password='InstructorPass123!',
            first_name='Carlos',
            last_name='Instructor',
            rol=Usuario.INSTRUCTOR
        )
        self.instructor = Instructor.objects.create(
            usuario=self.usuario_instructor,
            especialidades='Spinning, Yoga',
            biografia='Instructor certificado con 5 años de experiencia.',
            activo=True
        )
    
    def test_crear_instructor(self):
        """Test: Crear un instructor correctamente."""
        self.assertEqual(self.instructor.usuario.username, 'instructor1')
        self.assertEqual(self.instructor.especialidades, 'Spinning, Yoga')
        self.assertTrue(self.instructor.activo)
    
    def test_str_representation(self):
        """Test: Representación en string del instructor."""
        expected = f"Instructor: {self.usuario_instructor.get_full_name()}"
        self.assertEqual(str(self.instructor), expected)
