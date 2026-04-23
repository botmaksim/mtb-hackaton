from django.contrib import admin

from .models import Profile, UserBuilding, BuildingType, MarketItem, Friendship

admin.site.register(Profile)
admin.site.register(UserBuilding)
admin.site.register(BuildingType)
admin.site.register(MarketItem)
admin.site.register(Friendship)