"""
Tests unitarios para la app de reservas.
"""
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta, time, date
from usuarios.models import Usuario, Instructor
from clases.models import Clase
from .models import Reserva


class ReservaModelTest(TestCase):
    """Tests para el modelo Reserva."""
    
    def setUp(self):
        """Crear datos de prueba."""
        # Crear usuario socio
        self.socio = Usuario.objects.create_user(
            username='socio_test',
            email='socio@gimnasio.com',
            password='SocioPass123!',
            first_name='Juan',
            last_name='Socio',
            rol=Usuario.SOCIO,
            estado_membresia=Usuario.ACTIVA
        )
        
        # Crear instructor
        self.usuario_instructor = Usuario.objects.create_user(
            username='instructor_test',
            email='inst@gimnasio.com',
            password='InstPass123!',
            first_name='Carlos',
            last_name='Instructor',
            rol=Usuario.INSTRUCTOR
        )
        self.instructor = Instructor.objects.create(
            usuario=self.usuario_instructor,
            especialidades='Spinning',
            activo=True
        )
        
        # Crear clase futura
        self.clase = Clase.objects.create(
            nombre='Spinning Matutino',
            tipo=Clase.SPINNING,
            descripcion='Clase de spinning para principiantes',
            instructor=self.instructor,
            fecha=date.today() + timedelta(days=1),
            hora_inicio=time(9, 0),
            hora_fin=time(10, 0),
            cupos_totales=20,
            cupos_ocupados=0,
            estado=Clase.ACTIVA
        )
        
        # Crear reserva
        self.reserva = Reserva.objects.create(
            socio=self.socio,
            clase=self.clase,
            estado=Reserva.CONFIRMADA
        )
        self.clase.cupos_ocupados = 1
        self.clase.save()
    
    def test_crear_reserva(self):
        """Test: Crear una reserva correctamente."""
        self.assertEqual(self.reserva.socio, self.socio)
        self.assertEqual(self.reserva.clase, self.clase)
        self.assertEqual(self.reserva.estado, Reserva.CONFIRMADA)
    
    def test_cancelar_reserva(self):
        """Test: Cancelar una reserva libera el cupo."""
        cupos_antes = self.clase.cupos_ocupados
        
        resultado = self.reserva.cancelar()
        
        self.assertTrue(resultado)
        self.assertEqual(self.reserva.estado, Reserva.CANCELADA)
        self.assertIsNotNone(self.reserva.fecha_cancelacion)
        
        self.clase.refresh_from_db()
        self.assertEqual(self.clase.cupos_ocupados, cupos_antes - 1)
    
    def test_cancelar_reserva_ya_cancelada(self):
        """Test: Cancelar una reserva ya cancelada retorna True."""
        self.reserva.estado = Reserva.CANCELADA
        self.reserva.save()
        
        resultado = self.reserva.cancelar()
        
        self.assertTrue(resultado)
    
    def test_marcar_noshow(self):
        """Test: Marcar no-show incrementa contador del socio."""
        noshow_antes = self.socio.total_noshow
        
        resultado = self.reserva.marcar_noshow()
        
        self.assertTrue(resultado)
        self.assertEqual(self.reserva.estado, Reserva.NOSHOW)
        
        self.socio.refresh_from_db()
        self.assertEqual(self.socio.total_noshow, noshow_antes + 1)
    
    def test_marcar_completada(self):
        """Test: Marcar reserva como completada."""
        resultado = self.reserva.marcar_completada()
        
        self.assertTrue(resultado)
        self.assertEqual(self.reserva.estado, Reserva.COMPLETADA)
    
    def test_puede_cancelar_con_tiempo(self):
        """Test: Puede cancelar con más de 1 hora de anticipación."""
        # La clase es mañana, así que tiene tiempo
        self.assertTrue(self.reserva.puede_cancelar())
    
    def test_no_puede_cancelar_sin_tiempo(self):
        """Test: No puede cancelar con menos de 1 hora de anticipación."""
        # Cambiar clase para que sea en 30 minutos
        ahora = timezone.now()
        self.clase.fecha = ahora.date()
        self.clase.hora_inicio = (ahora + timedelta(minutes=30)).time()
        self.clase.hora_fin = (ahora + timedelta(minutes=90)).time()
        self.clase.save()
        
        self.assertFalse(self.reserva.puede_cancelar())
    
    def test_str_representation(self):
        """Test: Representación en string de la reserva."""
        expected = f"{self.socio.get_full_name()} - {self.clase.nombre} ({self.reserva.get_estado_display()})"
        self.assertEqual(str(self.reserva), expected)


class ReservaDuplicadaTest(TestCase):
    """Tests para validación de reservas duplicadas."""
    
    def setUp(self):
        """Crear datos de prueba."""
        self.socio = Usuario.objects.create_user(
            username='socio2',
            email='socio2@gimnasio.com',
            password='SocioPass123!',
            rol=Usuario.SOCIO,
            estado_membresia=Usuario.ACTIVA
        )
        
        self.clase = Clase.objects.create(
            nombre='Yoga',
            tipo=Clase.YOGA,
            fecha=date.today() + timedelta(days=1),
            hora_inicio=time(10, 0),
            hora_fin=time(11, 0),
            cupos_totales=15,
            cupos_ocupados=0,
            estado=Clase.ACTIVA
        )
    
    def test_puede_reservar_clase_cancelada_previamente(self):
        """Test: Puede reservar una clase que fue cancelada previamente."""
        # Crear y cancelar reserva
        reserva1 = Reserva.objects.create(
            socio=self.socio,
            clase=self.clase,
            estado=Reserva.CANCELADA
        )
        
        # Debería poder crear nueva reserva
        reserva2 = Reserva.objects.create(
            socio=self.socio,
            clase=self.clase,
            estado=Reserva.CONFIRMADA
        )
        
        self.assertIsNotNone(reserva2.id)
        self.assertEqual(reserva2.estado, Reserva.CONFIRMADA)
