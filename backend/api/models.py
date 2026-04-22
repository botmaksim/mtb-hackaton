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

    def __str__(self):
        return f"{self.type.name} ({self.user.username})"
    
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()    