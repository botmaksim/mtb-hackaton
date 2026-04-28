from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_admin(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    if not User.objects.filter(username='admin').exists():
        User.objects.create(
            username='admin',
            email='admin@mtbank.by',
            password=make_password('admin123'),
            is_staff=True,
            is_superuser=True
        )

def remove_admin(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    User.objects.filter(username='admin').delete()

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_userbuilding_rotated'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.RunPython(create_admin, remove_admin)
    ]
