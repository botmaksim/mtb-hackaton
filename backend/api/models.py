import uuid
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    level = models.IntegerField(default=1)
    coins = models.BigIntegerField(default=1000)
    mtCoins = models.BigIntegerField(default=0)
    promoCoins = models.BigIntegerField(default=0)
    energy = models.IntegerField(default=100)
    realBalance = models.FloatField(default=1500.0)
    avatar_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"Игрок {self.user.username}"

class BuildingType(models.Model):
    slug = models.SlugField(unique=True) # например, 'res_2x2_1'
    name = models.CharField(max_length=100)
    incomeRate = models.IntegerField(default=10)
    maxCapacity = models.IntegerField(default=1000)
    base_cost = models.IntegerField(default=500)

    def __str__(self):
        return self.name

class UserBuilding(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='buildings')
    type = models.ForeignKey(BuildingType, on_delete=models.PROTECT)
    x = models.IntegerField()
    y = models.IntegerField()
    level = models.IntegerField(default=1)
    lastCollected = models.BigIntegerField()
    rotated = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.type.name} ({self.user.username})"
    
class MarketItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='market_items')
    resource_type = models.CharField(max_length=50) # 'promoCoins', 'skin', 'booster'
    amount = models.IntegerField(default=1)
    price = models.IntegerField(default=10) # in mtCoins
    created_at = models.DateTimeField(auto_now_add=True)

class Friendship(models.Model):
    user = models.ForeignKey(User, related_name='friends', on_delete=models.CASCADE)
    friend = models.ForeignKey(User, related_name='friends_with', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

from django.db.models.signals import post_migrate

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()    

def populate_default_buildings(sender, **kwargs):
    if sender.name == 'api':
        default_types = [
            {'slug': 'decor', 'name': 'Декор', 'incomeRate': 1, 'maxCapacity': 100, 'base_cost': 50},
            {'slug': 'tree', 'name': 'Декоративное дерево', 'incomeRate': 1, 'maxCapacity': 100, 'base_cost': 50},
            {'slug': 'bush', 'name': 'Декоративный куст', 'incomeRate': 1, 'maxCapacity': 100, 'base_cost': 50},
            {'slug': 'road_pedestrian', 'name': 'Пешеходная дорога', 'incomeRate': 0, 'maxCapacity': 0, 'base_cost': 50},
            {'slug': 'road_auto', 'name': 'Автомоб. дорога', 'incomeRate': 0, 'maxCapacity': 0, 'base_cost': 50},
            
            {'slug': 'res_2x2_1', 'name': 'Жилое здание A', 'incomeRate': 10, 'maxCapacity': 1000, 'base_cost': 500},
            {'slug': 'res_2x3_1', 'name': 'Жилой комплекс B1', 'incomeRate': 15, 'maxCapacity': 1500, 'base_cost': 750},
            {'slug': 'res_2x3_2', 'name': 'Жилой комплекс B2', 'incomeRate': 15, 'maxCapacity': 1500, 'base_cost': 750},
            {'slug': 'res_2x4_1', 'name': 'Жилая башня C', 'incomeRate': 20, 'maxCapacity': 2000, 'base_cost': 1000},
            
            {'slug': 'com_3x3_1', 'name': 'Торговый центр 3х3', 'incomeRate': 50, 'maxCapacity': 5000, 'base_cost': 2000},
            {'slug': 'com_2x4_1', 'name': 'Торговая улица A', 'incomeRate': 40, 'maxCapacity': 4000, 'base_cost': 1800},
            {'slug': 'com_2x4_2', 'name': 'Торговая галерея B', 'incomeRate': 40, 'maxCapacity': 4000, 'base_cost': 1800},
            {'slug': 'com_2x3_1', 'name': 'Супермаркет', 'incomeRate': 30, 'maxCapacity': 3000, 'base_cost': 1500},
            
            {'slug': 'hypermarket', 'name': 'Гипермаркет', 'incomeRate': 100, 'maxCapacity': 10000, 'base_cost': 5000},
        ]
        from .models import BuildingType
        for bt in default_types:
            BuildingType.objects.get_or_create(slug=bt['slug'], defaults=bt)

def create_admin_account(sender, **kwargs):
    if sender.name == 'api':
        from django.contrib.auth.models import User
        if not User.objects.filter(username='admin').exists():
            user = User.objects.create_superuser('admin', 'admin@example.com', 'admin')
            # Grant admin some starting capital for testing out stuff easily
            profile = user.profile
            profile.coins = 100000
            profile.mtCoins = 5000
            profile.promoCoins = 1000
            profile.level = 10
            profile.save()

post_migrate.connect(populate_default_buildings)
post_migrate.connect(create_admin_account)