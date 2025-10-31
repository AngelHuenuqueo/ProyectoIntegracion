from django.contrib import admin
from .models import Reserva


@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Reserva.
    """
    list_display = ('id', 'socio', 'clase', 'estado', 'fecha_reserva', 'puede_cancelar_display', 'notificacion_enviada')
    list_filter = ('estado', 'fecha_reserva', 'notificacion_enviada', 'clase__tipo')
    search_fields = ('socio__first_name', 'socio__last_name', 'socio__email', 'clase__nombre')
    date_hierarchy = 'fecha_reserva'
    ordering = ('-fecha_reserva',)
    
    fieldsets = (
        ('Información de Reserva', {
            'fields': ('socio', 'clase', 'estado')
        }),
        ('Fechas', {
            'fields': ('fecha_reserva', 'fecha_cancelacion', 'fecha_actualizacion')
        }),
        ('Notificaciones', {
            'fields': ('notificacion_enviada', 'notas')
        }),
    )
    
    readonly_fields = ('fecha_reserva', 'fecha_cancelacion', 'fecha_actualizacion')
    
    def puede_cancelar_display(self, obj):
        """Muestra si la reserva puede ser cancelada."""
        return obj.puede_cancelar()
    puede_cancelar_display.boolean = True
    puede_cancelar_display.short_description = 'Puede Cancelar'
    
    actions = ['cancelar_reservas', 'marcar_noshow', 'marcar_completada']
    
    def cancelar_reservas(self, request, queryset):
        """Cancela las reservas seleccionadas."""
        count = 0
        for reserva in queryset:
            if reserva.cancelar():
                count += 1
        self.message_user(request, f'{count} reserva(s) cancelada(s).')
    cancelar_reservas.short_description = "Cancelar reservas seleccionadas"
    
    def marcar_noshow(self, request, queryset):
        """Marca las reservas como no-show."""
        count = 0
        for reserva in queryset:
            if reserva.marcar_noshow():
                count += 1
        self.message_user(request, f'{count} reserva(s) marcada(s) como no-show.')
    marcar_noshow.short_description = "Marcar como No-Show"
    
    def marcar_completada(self, request, queryset):
        """Marca las reservas como completadas."""
        count = 0
        for reserva in queryset:
            if reserva.marcar_completada():
                count += 1
        self.message_user(request, f'{count} reserva(s) marcada(s) como completada(s).')
    marcar_completada.short_description = "Marcar como completada"
