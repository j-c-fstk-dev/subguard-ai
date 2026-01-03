from celery import Celery
from app.core.config import settings

# Create Celery app
celery_app = Celery(
    "subguard_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.tasks.email_tasks",
        "app.tasks.analysis_tasks",
        "app.tasks.notification_tasks"
    ]
)

# Configure Celery
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_routes={
        'app.tasks.email_tasks.*': {'queue': 'email'},
        'app.tasks.analysis_tasks.*': {'queue': 'analysis'},
        'app.tasks.notification_tasks.*': {'queue': 'notification'},
    },
    task_annotations={
        'app.tasks.email_tasks.scan_user_emails': {'rate_limit': '10/m'},
    }
)

# Optional: Add beat schedule for periodic tasks
celery_app.conf.beat_schedule = {
    'daily-email-scan': {
        'task': 'app.tasks.email_tasks.daily_email_scan',
        'schedule': 86400.0,  # Every 24 hours
    },
    'weekly-analysis': {
        'task': 'app.tasks.analysis_tasks.weekly_analysis',
        'schedule': 604800.0,  # Every 7 days
    },
}