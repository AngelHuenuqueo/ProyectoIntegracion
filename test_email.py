"""
Script de prueba para verificar el envío de emails.
Ejecutar con: python test_email.py
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

print("=" * 50)
print("PRUEBA DE ENVÍO DE EMAIL")
print("=" * 50)
print(f"Servidor: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
print(f"TLS: {settings.EMAIL_USE_TLS}")
print(f"SSL: {getattr(settings, 'EMAIL_USE_SSL', False)}")
print(f"Usuario: {settings.EMAIL_HOST_USER}")
print("=" * 50)

try:
    print("\nIntentando enviar email...")
    result = send_mail(
        subject='✅ Prueba Gimnasio Energía Total',
        message='¡Hola! Este es un correo de prueba del sistema de notificaciones del gimnasio. Si recibes este mensaje, la configuración de email está funcionando correctamente.',
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[settings.EMAIL_HOST_USER],
        fail_silently=False,
    )
    if result:
        print("✅ ¡EMAIL ENVIADO EXITOSAMENTE!")
        print(f"   Revisa tu bandeja de entrada: {settings.EMAIL_HOST_USER}")
    else:
        print("⚠️  El email no se envió (result=0)")
except Exception as e:
    print(f"❌ ERROR: {type(e).__name__}")
    print(f"   Detalle: {e}")
    print("\n💡 Posibles soluciones:")
    print("   1. Verifica que la App Password sea correcta")
    print("   2. Verifica tu conexión a internet")
    print("   3. Intenta desactivar el antivirus/firewall temporalmente")
