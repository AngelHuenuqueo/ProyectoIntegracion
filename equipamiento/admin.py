from django.contrib import admin
from .models import Equipo


@admin.register(Equipo)
class EquipoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'categoria', 'marca', 'estado', 'ubicacion', 'activo']
    list_filter = ['categoria', 'estado', 'activo', 'ubicacion']
    search_fields = ['nombre', 'marca', 'modelo', 'numero_serie']
    ordering = ['categoria', 'nombre']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'categoria', 'descripcion')
        }),
        ('Detalles del Equipo', {
            'fields': ('marca', 'modelo', 'numero_serie', 'ubicacion')
        }),
        ('Estado', {
            'fields': ('estado', 'activo')
        }),
        ('Mantenimiento', {
            'fields': ('fecha_compra', 'ultimo_mantenimiento', 'proximo_mantenimiento', 'notas_mantenimiento')
        }),
    )
