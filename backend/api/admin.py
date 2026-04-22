from django.contrib import admin

from .models import Profile, UserBuilding, BuildingType

admin.site.register(Profile)
admin.site.register(UserBuilding)
admin.site.register(BuildingType)