from django.db import models
from django.utils import timezone


class Equipo(models.Model):
    """
    Modelo para representar equipos/máquinas del gimnasio.
    """
    
    # Categorías de equipamiento
    CARDIO = 'cardio'
    FUERZA = 'fuerza'
    PESO_LIBRE = 'peso_libre'
    FUNCIONAL = 'funcional'
    OTRO = 'otro'
    
    CATEGORIAS = [
        (CARDIO, 'Cardio'),
        (FUERZA, 'Fuerza'),
        (PESO_LIBRE, 'Peso Libre'),
        (FUNCIONAL, 'Funcional'),
        (OTRO, 'Otro'),
    ]
    
    # Estados del equipo
    DISPONIBLE = 'disponible'
    EN_USO = 'en_uso'
    MANTENIMIENTO = 'mantenimiento'
    FUERA_SERVICIO = 'fuera_servicio'
    
    ESTADOS = [
        (DISPONIBLE, 'Disponible'),
        (EN_USO, 'En Uso'),
        (MANTENIMIENTO, 'En Mantenimiento'),
        (FUERA_SERVICIO, 'Fuera de Servicio'),
    ]
    
    # Campos principales
    nombre = models.CharField(
        max_length=100,
        verbose_name='Nombre del Equipo'
    )
    
    categoria = models.CharField(
        max_length=20,
        choices=CATEGORIAS,
        default=FUERZA,
        verbose_name='Categoría'
    )
    
    marca = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Marca'
    )
    
    modelo = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Modelo'
    )
    
    numero_serie = models.CharField(
        max_length=100,
        blank=True,
        unique=True,
        null=True,
        verbose_name='Número de Serie'
    )
    
    descripcion = models.TextField(
        blank=True,
        verbose_name='Descripción'
    )
    
    imagen = models.ImageField(
        upload_to='equipos/',
        null=True,
        blank=True,
        verbose_name='Imagen del Equipo',
        help_text='Imagen o foto del equipo'
    )
    
    ubicacion = models.CharField(
        max_length=100,
        blank=True,
        help_text='Ej: Sala de Cardio, Sala de Pesas',
        verbose_name='Ubicación'
    )
    
    # Estado
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default=DISPONIBLE,
        verbose_name='Estado'
    )
    
    # Fechas
    fecha_compra = models.DateField(
        null=True,
        blank=True,
        verbose_name='Fecha de Compra'
    )
    
    ultimo_mantenimiento = models.DateField(
        null=True,
        blank=True,
        verbose_name='Último Mantenimiento'
    )
    
    proximo_mantenimiento = models.DateField(
        null=True,
        blank=True,
        verbose_name='Próximo Mantenimiento'
    )
    
    # Notas
    notas_mantenimiento = models.TextField(
        blank=True,
        verbose_name='Notas de Mantenimiento'
    )
    
    # Metadatos
    activo = models.BooleanField(
        default=True,
        verbose_name='Activo'
    )
    
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Creación'
    )
    
    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name='Fecha de Actualización'
    )
    
    class Meta:
        verbose_name = 'Equipo'
        verbose_name_plural = 'Equipos'
        ordering = ['categoria', 'nombre']
    
    def __str__(self):
        return f"{self.nombre} ({self.get_categoria_display()})"
    
    @property
    def necesita_mantenimiento(self):
        """Verifica si el equipo necesita mantenimiento próximamente."""
        if self.proximo_mantenimiento:
            return self.proximo_mantenimiento <= timezone.now().date()
        return False
