"""
Comando para crear datos de prueba para el sistema del gimnasio.
Uso: python manage.py crear_datos_prueba
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, time, date
from usuarios.models import Usuario, Instructor
from clases.models import Clase
from reservas.models import Reserva
from lista_espera.models import ListaEspera
from notificaciones.models import Notificacion


class Command(BaseCommand):
    help = 'Crea datos de prueba para el sistema del gimnasio'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limpiar',
            action='store_true',
            help='Elimina todos los datos existentes antes de crear nuevos',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Iniciando creación de datos de prueba...'))
        
        # Limpiar datos si se especifica
        if options['limpiar']:
            self.limpiar_datos()
        
        # Crear datos
        self.crear_usuarios()
        self.crear_administradores()
        self.crear_instructores()
        self.crear_clases()
        self.crear_reservas()
        self.crear_notificaciones()
        
        self.stdout.write(self.style.SUCCESS('\n✅ ¡Datos de prueba creados exitosamente!'))
        self.mostrar_resumen()

    def limpiar_datos(self):
        """Elimina todos los datos de prueba."""
        self.stdout.write(self.style.WARNING('\n🗑️  Limpiando datos existentes...'))
        
        Notificacion.objects.all().delete()
        ListaEspera.objects.all().delete()
        Reserva.objects.all().delete()
        Clase.objects.all().delete()
        Instructor.objects.all().delete()
        Usuario.objects.filter(is_superuser=False).delete()
        
        self.stdout.write(self.style.SUCCESS('✓ Datos eliminados'))

    def crear_usuarios(self):
        """Crea usuarios de prueba (socios)."""
        self.stdout.write('\n👥 Creando socios...')
        
        socios_data = [
            {'username': 'juan.perez', 'first_name': 'Juan', 'last_name': 'Pérez', 'email': 'juan.perez@email.com'},
            {'username': 'maria.garcia', 'first_name': 'María', 'last_name': 'García', 'email': 'maria.garcia@email.com'},
            {'username': 'carlos.lopez', 'first_name': 'Carlos', 'last_name': 'López', 'email': 'carlos.lopez@email.com'},
            {'username': 'ana.martinez', 'first_name': 'Ana', 'last_name': 'Martínez', 'email': 'ana.martinez@email.com'},
            {'username': 'pedro.sanchez', 'first_name': 'Pedro', 'last_name': 'Sánchez', 'email': 'pedro.sanchez@email.com'},
            {'username': 'laura.rodriguez', 'first_name': 'Laura', 'last_name': 'Rodríguez', 'email': 'laura.rodriguez@email.com'},
            {'username': 'diego.fernandez', 'first_name': 'Diego', 'last_name': 'Fernández', 'email': 'diego.fernandez@email.com'},
            {'username': 'sofia.torres', 'first_name': 'Sofía', 'last_name': 'Torres', 'email': 'sofia.torres@email.com'},
            {'username': 'miguel.ramirez', 'first_name': 'Miguel', 'last_name': 'Ramírez', 'email': 'miguel.ramirez@email.com'},
            {'username': 'valentina.castro', 'first_name': 'Valentina', 'last_name': 'Castro', 'email': 'valentina.castro@email.com'},
        ]
        
        for data in socios_data:
            usuario, created = Usuario.objects.get_or_create(
                username=data['username'],
                defaults={
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'email': data['email'],
                    'rol': Usuario.SOCIO,
                    'estado_membresia': Usuario.ACTIVA,
                    'telefono': '+56912345678',
                    'fecha_inicio_membresia': date.today() - timedelta(days=90),
                    'fecha_fin_membresia': date.today() + timedelta(days=275),
                }
            )
            if created:
                usuario.set_password('prueba123')
                usuario.save()
                self.stdout.write(self.style.SUCCESS(f'  ✓ Socio creado: {usuario.get_full_name()}'))

    def crear_administradores(self):
        """Crea administradores de prueba."""
        self.stdout.write('\n👨‍💼 Creando administradores...')
        
        administradores_data = [
            {
                'username': 'admin.gimnasio',
                'first_name': 'Admin',
                'last_name': 'Principal',
                'email': 'admin@energiatotal.com',
            },
            {
                'username': 'admin.recepcion',
                'first_name': 'Recepción',
                'last_name': 'Admin',
                'email': 'recepcion@energiatotal.com',
            },
        ]
        
        for data in administradores_data:
            usuario, created = Usuario.objects.get_or_create(
                username=data['username'],
                defaults={
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'email': data['email'],
                    'rol': Usuario.ADMINISTRADOR,
                    'estado_membresia': Usuario.ACTIVA,
                    'telefono': '+56900000000',
                    'is_staff': True,  # Puede acceder al admin de Django
                }
            )
            if created:
                usuario.set_password('admin123')
                usuario.save()
                self.stdout.write(self.style.SUCCESS(f'  ✓ Administrador creado: {usuario.get_full_name()} - Username: {usuario.username}'))

    def crear_instructores(self):
        """Crea instructores de prueba."""
        self.stdout.write('\n👨‍🏫 Creando instructores...')
        
        instructores_data = [
            {
                'username': 'instructor.spinning',
                'first_name': 'Roberto',
                'last_name': 'Spinning',
                'email': 'roberto.spinning@energiatotal.com',
                'especialidades': 'Spinning, Cardio'
            },
            {
                'username': 'instructor.yoga',
                'first_name': 'Carmen',
                'last_name': 'Yoga',
                'email': 'carmen.yoga@energiatotal.com',
                'especialidades': 'Yoga, Pilates'
            },
            {
                'username': 'instructor.fitness',
                'first_name': 'Andrés',
                'last_name': 'Fitness',
                'email': 'andres.fitness@energiatotal.com',
                'especialidades': 'Musculación, Funcional'
            },
        ]
        
        for data in instructores_data:
            # Crear usuario
            usuario, created = Usuario.objects.get_or_create(
                username=data['username'],
                defaults={
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'email': data['email'],
                    'rol': Usuario.INSTRUCTOR,
                    'estado_membresia': Usuario.ACTIVA,
                    'telefono': '+56987654321',
                }
            )
            if created:
                usuario.set_password('prueba123')
                usuario.save()
            
            # Crear perfil de instructor
            instructor, created = Instructor.objects.get_or_create(
                usuario=usuario,
                defaults={
                    'especialidades': data['especialidades'],
                    'biografia': f'Instructor profesional de {data["especialidades"]}',
                    'activo': True
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Instructor creado: {usuario.get_full_name()} - {data["especialidades"]}'))

    def crear_clases(self):
        """Crea clases de prueba."""
        self.stdout.write('\n📅 Creando clases...')
        
        # Obtener instructores
        instructores = list(Instructor.objects.all())
        
        if not instructores:
            self.stdout.write(self.style.ERROR('  ✗ No hay instructores disponibles'))
            return
        
        # Clases para la próxima semana
        hoy = date.today()
        
        clases_data = [
            # Lunes
            {'nombre': 'Spinning Matinal', 'tipo': Clase.SPINNING, 'dia': 0, 'hora_inicio': time(7, 0), 'hora_fin': time(8, 0), 'cupos': 15},
            {'nombre': 'Yoga Relax', 'tipo': Clase.YOGA, 'dia': 0, 'hora_inicio': time(10, 0), 'hora_fin': time(11, 0), 'cupos': 20},
            {'nombre': 'Pilates Core', 'tipo': Clase.PILATES, 'dia': 0, 'hora_inicio': time(18, 0), 'hora_fin': time(19, 0), 'cupos': 12},
            
            # Martes
            {'nombre': 'Cardio Intenso', 'tipo': Clase.CARDIO, 'dia': 1, 'hora_inicio': time(8, 0), 'hora_fin': time(9, 0), 'cupos': 18},
            {'nombre': 'Musculación', 'tipo': Clase.MUSCULACION, 'dia': 1, 'hora_inicio': time(19, 0), 'hora_fin': time(20, 0), 'cupos': 10},
            
            # Miércoles
            {'nombre': 'Spinning Power', 'tipo': Clase.SPINNING, 'dia': 2, 'hora_inicio': time(7, 0), 'hora_fin': time(8, 0), 'cupos': 15},
            {'nombre': 'Yoga Flow', 'tipo': Clase.YOGA, 'dia': 2, 'hora_inicio': time(11, 0), 'hora_fin': time(12, 0), 'cupos': 20},
            
            # Jueves
            {'nombre': 'Pilates Avanzado', 'tipo': Clase.PILATES, 'dia': 3, 'hora_inicio': time(9, 0), 'hora_fin': time(10, 0), 'cupos': 12},
            {'nombre': 'Cardio Dance', 'tipo': Clase.CARDIO, 'dia': 3, 'hora_inicio': time(18, 30), 'hora_fin': time(19, 30), 'cupos': 20},
            
            # Viernes
            {'nombre': 'Spinning Extreme', 'tipo': Clase.SPINNING, 'dia': 4, 'hora_inicio': time(7, 30), 'hora_fin': time(8, 30), 'cupos': 15},
            {'nombre': 'Yoga Restaurativo', 'tipo': Clase.YOGA, 'dia': 4, 'hora_inicio': time(17, 0), 'hora_fin': time(18, 0), 'cupos': 18},
            
            # Sábado
            {'nombre': 'Musculación Full Body', 'tipo': Clase.MUSCULACION, 'dia': 5, 'hora_inicio': time(9, 0), 'hora_fin': time(10, 30), 'cupos': 15},
            {'nombre': 'Pilates Mat', 'tipo': Clase.PILATES, 'dia': 5, 'hora_inicio': time(11, 0), 'hora_fin': time(12, 0), 'cupos': 12},
        ]
        
        for clase_data in clases_data:
            # Calcular la fecha (próximos días)
            dias_hasta = clase_data['dia']
            fecha_clase = hoy + timedelta(days=dias_hasta + 1)
            
            # Asignar instructor según el tipo
            if clase_data['tipo'] in [Clase.SPINNING, Clase.CARDIO]:
                instructor = instructores[0]
            elif clase_data['tipo'] in [Clase.YOGA, Clase.PILATES]:
                instructor = instructores[1] if len(instructores) > 1 else instructores[0]
            else:
                instructor = instructores[2] if len(instructores) > 2 else instructores[0]
            
            clase, created = Clase.objects.get_or_create(
                nombre=clase_data['nombre'],
                fecha=fecha_clase,
                hora_inicio=clase_data['hora_inicio'],
                defaults={
                    'tipo': clase_data['tipo'],
                    'descripcion': f'Clase de {clase_data["nombre"]}',
                    'instructor': instructor,
                    'hora_fin': clase_data['hora_fin'],
                    'cupos_totales': clase_data['cupos'],
                    'cupos_ocupados': 0,
                    'estado': Clase.ACTIVA,
                    'permite_lista_espera': True,
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Clase creada: {clase.nombre} - {fecha_clase} {clase.hora_inicio}'))

    def crear_reservas(self):
        """Crea reservas de prueba."""
        self.stdout.write('\n📝 Creando reservas...')
        
        socios = list(Usuario.objects.filter(rol=Usuario.SOCIO))
        clases = list(Clase.objects.filter(estado=Clase.ACTIVA))
        
        if not socios or not clases:
            self.stdout.write(self.style.ERROR('  ✗ No hay socios o clases disponibles'))
            return
        
        # Crear algunas reservas
        count = 0
        for i, clase in enumerate(clases[:8]):  # Primeras 8 clases
            # Reservar 3-5 cupos por clase
            num_reservas = min(5, len(socios), clase.cupos_totales)
            
            for j in range(num_reservas):
                socio = socios[(i * 3 + j) % len(socios)]
                
                # Verificar que no exista ya una reserva
                if not Reserva.objects.filter(socio=socio, clase=clase).exists():
                    reserva = Reserva.objects.create(
                        socio=socio,
                        clase=clase,
                        estado=Reserva.CONFIRMADA,
                        notificacion_enviada=True
                    )
                    clase.incrementar_cupo()
                    count += 1
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {count} reservas creadas'))
        
        # Crear algunas entradas en lista de espera para clases con pocos cupos
        self.stdout.write('\n⏳ Creando listas de espera...')
        clases_pilates = Clase.objects.filter(tipo=Clase.PILATES, estado=Clase.ACTIVA)
        
        count_espera = 0
        try:
            for clase in clases_pilates[:2]:  # Primeras 2 clases de Pilates
                # Llenar la clase casi completa
                cupos_a_reservar = clase.cupos_totales - 2 - clase.cupos_ocupados
                for i in range(cupos_a_reservar):
                    socio = socios[(clase.cupos_ocupados + i) % len(socios)]
                    if not Reserva.objects.filter(socio=socio, clase=clase).exists():
                        Reserva.objects.create(
                            socio=socio,
                            clase=clase,
                            estado=Reserva.CONFIRMADA
                        )
                        clase.incrementar_cupo()
                
                # Agregar a lista de espera
                for j in range(3):
                    socio_idx = (clase.cupos_totales + j) % len(socios)
                    socio = socios[socio_idx]
                    if not ListaEspera.objects.filter(socio=socio, clase=clase).exists():
                        try:
                            ListaEspera.objects.create(
                                socio=socio,
                                clase=clase,
                                estado=ListaEspera.ESPERANDO
                            )
                            count_espera += 1
                        except:
                            pass
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'  ! Error creando listas de espera: {e}'))
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {count_espera} entradas en lista de espera creadas'))

    def crear_notificaciones(self):
        """Crea notificaciones de prueba."""
        self.stdout.write('\n🔔 Creando notificaciones...')
        
        socios = Usuario.objects.filter(rol=Usuario.SOCIO)[:5]
        clases = Clase.objects.all()[:3]
        
        count = 0
        for socio in socios:
            for clase in clases:
                Notificacion.objects.create(
                    usuario=socio,
                    tipo=Notificacion.RESERVA_CONFIRMADA,
                    canal=Notificacion.EMAIL,
                    titulo=f'Reserva confirmada - {clase.nombre}',
                    mensaje=f'Tu reserva para {clase.nombre} el {clase.fecha} ha sido confirmada.',
                    estado=Notificacion.ENVIADA,
                    datos_adicionales={
                        'clase_id': clase.id,
                        'clase_nombre': clase.nombre,
                    }
                )
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {count} notificaciones creadas'))

    def mostrar_resumen(self):
        """Muestra un resumen de los datos creados."""
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('📊 RESUMEN DE DATOS CREADOS'))
        self.stdout.write('='*50)
        
        total_usuarios = Usuario.objects.filter(is_superuser=False).count()
        total_socios = Usuario.objects.filter(rol=Usuario.SOCIO).count()
        total_administradores = Usuario.objects.filter(rol=Usuario.ADMINISTRADOR).count()
        total_instructores = Instructor.objects.count()
        total_clases = Clase.objects.count()
        total_reservas = Reserva.objects.count()
        total_espera = ListaEspera.objects.count()
        total_notificaciones = Notificacion.objects.count()
        
        self.stdout.write(f'\n👥 Usuarios totales: {total_usuarios}')
        self.stdout.write(f'   - Socios: {total_socios}')
        self.stdout.write(f'   - Administradores: {total_administradores}')
        self.stdout.write(f'   - Instructores: {total_instructores}')
        self.stdout.write(f'\n📅 Clases: {total_clases}')
        self.stdout.write(f'📝 Reservas: {total_reservas}')
        self.stdout.write(f'⏳ Lista de espera: {total_espera}')
        self.stdout.write(f'🔔 Notificaciones: {total_notificaciones}')
        
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('\n🎉 ¡Listo! Puedes probar el sistema en:'))
        self.stdout.write(self.style.SUCCESS('   http://127.0.0.1:8000/admin\n'))
        self.stdout.write('Credenciales de prueba:')
        self.stdout.write('   Socio: juan.perez / prueba123')
        self.stdout.write('   Admin: admin.gimnasio / admin123')
        self.stdout.write('='*50 + '\n')
