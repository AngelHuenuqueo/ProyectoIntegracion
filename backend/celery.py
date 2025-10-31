"""
Configuración de Celery para el proyecto Gimnasio Energía Total.
"""
import os
from celery import Celery

# Configurar el módulo de settings de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

# Usar una cadena aquí significa que el worker no tiene que serializar
# el objeto de configuración a los procesos hijos.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Cargar módulos de tareas de todas las apps registradas de Django.
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
