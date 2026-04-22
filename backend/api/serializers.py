from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserBuilding, Profile, BuildingType

class UserSerializer(serializers.ModelSerializer):
    level = serializers.IntegerField(source='profile.level', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'level']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['username', 'password', 'email']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user) 
        return user

class UserBuildingSerializer(serializers.ModelSerializer):
    type = serializers.SlugRelatedField(read_only=True, slug_field='slug')
    name = serializers.CharField(source='type.name', read_only=True)
    incomeRate = serializers.IntegerField(source='type.incomeRate', read_only=True)
    maxCapacity = serializers.IntegerField(source='type.maxCapacity', read_only=True)

    class Meta:
        model = UserBuilding
        fields = ['id', 'type', 'name', 'x', 'y', 'level', 'maxCapacity', 'incomeRate', 'lastCollected']