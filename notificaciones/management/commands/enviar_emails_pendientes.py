"""
Comando de gestión para enviar emails pendientes y reintentar fallidos.

Uso:
    python manage.py enviar_emails_pendientes
    python manage.py enviar_emails_pendientes --reintentar
    python manage.py enviar_emails_pendientes --max-intentos=5
"""
from django.core.management.base import BaseCommand
from notificaciones.email_service import (
    enviar_emails_pendientes,
    reintentar_emails_fallidos
)


class Command(BaseCommand):
    help = 'Envía emails pendientes de notificaciones y opcionalmente reintenta los fallidos'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--reintentar',
            action='store_true',
            help='También reintentar envío de emails fallidos'
        )
        parser.add_argument(
            '--max-intentos',
            type=int,
            default=3,
            help='Número máximo de intentos para emails fallidos (default: 3)'
        )
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Procesando emails pendientes...'))
        
        # Enviar pendientes
        enviados, fallidos = enviar_emails_pendientes()
        
        self.stdout.write(
            self.style.SUCCESS(f'Emails pendientes: {enviados} enviados, {fallidos} fallidos')
        )
        
        # Reintentar fallidos si se solicita
        if options['reintentar']:
            self.stdout.write(self.style.NOTICE('Reintentando emails fallidos...'))
            
            max_intentos = options['max_intentos']
            reenviados, abandonados = reintentar_emails_fallidos(max_intentos)
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Reintentos: {reenviados} enviados, {abandonados} abandonados'
                )
            )
        
        self.stdout.write(self.style.SUCCESS('Proceso completado.'))
