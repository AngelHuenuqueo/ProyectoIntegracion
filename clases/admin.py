from django.contrib import admin
from .models import Clase


@admin.register(Clase)
class ClaseAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Clase.
    """
    list_display = ('nombre', 'tipo', 'fecha', 'hora_inicio', 'hora_fin', 'instructor', 'cupos_ocupados', 'cupos_totales', 'estado', 'porcentaje_ocupacion_display')
    list_filter = ('tipo', 'estado', 'fecha', 'permite_lista_espera')
    search_fields = ('nombre', 'descripcion', 'instructor__usuario__first_name', 'instructor__usuario__last_name')
    date_hierarchy = 'fecha'
    ordering = ('-fecha', 'hora_inicio')
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'tipo', 'descripcion', 'instructor')
        }),
        ('Fecha y Horario', {
            'fields': ('fecha', 'hora_inicio', 'hora_fin')
        }),
        ('Cupos', {
            'fields': ('cupos_totales', 'cupos_ocupados', 'permite_lista_espera')
        }),
        ('Estado', {
            'fields': ('estado',)
        }),
        ('Información Adicional', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('cupos_ocupados', 'fecha_creacion', 'fecha_actualizacion')
    
    def porcentaje_ocupacion_display(self, obj):
        """Muestra el porcentaje de ocupación."""
        return f"{obj.porcentaje_ocupacion:.1f}%"
    porcentaje_ocupacion_display.short_description = '% Ocupación'
    
    actions = ['marcar_como_completada', 'marcar_como_cancelada']
    
    def marcar_como_completada(self, request, queryset):
        """Marca las clases seleccionadas como completadas."""
        updated = queryset.update(estado=Clase.COMPLETADA)
        self.message_user(request, f'{updated} clase(s) marcada(s) como completada(s).')
    marcar_como_completada.short_description = "Marcar como completada"
    
    def marcar_como_cancelada(self, request, queryset):
        """Marca las clases seleccionadas como canceladas."""
        updated = queryset.update(estado=Clase.CANCELADA)
        self.message_user(request, f'{updated} clase(s) marcada(s) como cancelada(s).')
    marcar_como_cancelada.short_description = "Marcar como cancelada"
