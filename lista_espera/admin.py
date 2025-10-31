from django.contrib import admin
from .models import ListaEspera


@admin.register(ListaEspera)
class ListaEsperaAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo ListaEspera.
    """
    list_display = ('id', 'socio', 'clase', 'posicion', 'estado', 'fecha_ingreso', 'notificacion_enviada')
    list_filter = ('estado', 'fecha_ingreso', 'notificacion_enviada', 'clase__tipo')
    search_fields = ('socio__first_name', 'socio__last_name', 'socio__email', 'clase__nombre')
    date_hierarchy = 'fecha_ingreso'
    ordering = ('clase', 'posicion', 'fecha_ingreso')
    
    fieldsets = (
        ('Información de Lista de Espera', {
            'fields': ('socio', 'clase', 'posicion', 'estado')
        }),
        ('Fechas', {
            'fields': ('fecha_ingreso', 'fecha_asignacion', 'fecha_expiracion', 'fecha_actualizacion')
        }),
        ('Notificaciones', {
            'fields': ('notificacion_enviada',)
        }),
    )
    
    readonly_fields = ('posicion', 'fecha_ingreso', 'fecha_asignacion', 'fecha_expiracion', 'fecha_actualizacion')
    
    actions = ['asignar_cupos', 'cancelar_entradas']
    
    def asignar_cupos(self, request, queryset):
        """Asigna cupos disponibles a los seleccionados en lista de espera."""
        count = 0
        for entrada in queryset.filter(estado=ListaEspera.ESPERANDO):
            if entrada.asignar_cupo():
                count += 1
        self.message_user(request, f'{count} cupo(s) asignado(s).')
    asignar_cupos.short_description = "Asignar cupos disponibles"
    
    def cancelar_entradas(self, request, queryset):
        """Cancela las entradas de lista de espera seleccionadas."""
        count = 0
        for entrada in queryset:
            if entrada.cancelar():
                count += 1
        self.message_user(request, f'{count} entrada(s) cancelada(s).')
    cancelar_entradas.short_description = "Cancelar entradas"
