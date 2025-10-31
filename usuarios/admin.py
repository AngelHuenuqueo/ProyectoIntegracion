from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Instructor


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    """
    Configuración del admin para el modelo Usuario.
    """
    list_display = ('username', 'email', 'get_full_name', 'rol', 'estado_membresia', 'noshow_mes_actual', 'esta_bloqueado')
    list_filter = ('rol', 'estado_membresia', 'is_staff', 'is_active', 'fecha_inicio_membresia')
    search_fields = ('username', 'first_name', 'last_name', 'email', 'telefono')
    ordering = ('-fecha_creacion',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Información del Gimnasio', {
            'fields': ('rol', 'telefono', 'estado_membresia', 'fecha_inicio_membresia', 'fecha_fin_membresia')
        }),
        ('Control de No-Shows', {
            'fields': ('total_noshow', 'noshow_mes_actual', 'bloqueado_hasta')
        }),
        ('Fechas', {
            'fields': ('fecha_creacion', 'fecha_actualizacion')
        }),
    )
    
    readonly_fields = ('fecha_creacion', 'fecha_actualizacion', 'esta_bloqueado')
    
    def esta_bloqueado(self, obj):
        """Muestra si el usuario está bloqueado."""
        return obj.esta_bloqueado()
    esta_bloqueado.boolean = True
    esta_bloqueado.short_description = 'Bloqueado'


@admin.register(Instructor)
class InstructorAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Instructor.
    """
    list_display = ('usuario', 'especialidades', 'activo', 'fecha_creacion')
    list_filter = ('activo', 'fecha_creacion')
    search_fields = ('usuario__first_name', 'usuario__last_name', 'especialidades')
    ordering = ('-fecha_creacion',)
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('usuario', 'especialidades', 'activo')
        }),
        ('Detalles', {
            'fields': ('biografia', 'foto')
        }),
        ('Fechas', {
            'fields': ('fecha_creacion',)
        }),
    )
    
    readonly_fields = ('fecha_creacion',)
