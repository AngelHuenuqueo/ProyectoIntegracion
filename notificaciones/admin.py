from django.contrib import admin
from .models import Notificacion


@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Notificacion.
    """
    list_display = ('id', 'usuario', 'tipo', 'canal', 'estado', 'titulo', 'fecha_creacion', 'fecha_envio')
    list_filter = ('tipo', 'canal', 'estado', 'fecha_creacion')
    search_fields = ('usuario__first_name', 'usuario__last_name', 'usuario__email', 'titulo', 'mensaje')
    date_hierarchy = 'fecha_creacion'
    ordering = ('-fecha_creacion',)
    
    fieldsets = (
        ('Destinatario', {
            'fields': ('usuario',)
        }),
        ('Contenido', {
            'fields': ('tipo', 'canal', 'titulo', 'mensaje')
        }),
        ('Estado', {
            'fields': ('estado', 'intentos_envio', 'error_mensaje')
        }),
        ('Fechas', {
            'fields': ('fecha_creacion', 'fecha_envio', 'fecha_lectura')
        }),
        ('Datos Adicionales', {
            'fields': ('datos_adicionales',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('fecha_creacion', 'fecha_envio', 'fecha_lectura', 'intentos_envio')
    
    actions = ['marcar_como_enviada', 'marcar_como_leida']
    
    def marcar_como_enviada(self, request, queryset):
        """Marca las notificaciones como enviadas."""
        count = 0
        for notificacion in queryset.filter(estado=Notificacion.PENDIENTE):
            notificacion.marcar_como_enviada()
            count += 1
        self.message_user(request, f'{count} notificación(es) marcada(s) como enviada(s).')
    marcar_como_enviada.short_description = "Marcar como enviada"
    
    def marcar_como_leida(self, request, queryset):
        """Marca las notificaciones como leídas."""
        count = 0
        for notificacion in queryset.filter(estado=Notificacion.ENVIADA):
            if notificacion.marcar_como_leida():
                count += 1
        self.message_user(request, f'{count} notificación(es) marcada(s) como leída(s).')
    marcar_como_leida.short_description = "Marcar como leída"
