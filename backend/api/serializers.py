from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserBuilding, Profile, BuildingType

class UserSerializer(serializers.ModelSerializer):
    level = serializers.IntegerField(source='profile.level', read_only=True)
    coins = serializers.IntegerField(source='profile.coins', read_only=True)
    mtCoins = serializers.IntegerField(source='profile.mtCoins', read_only=True)
    promoCoins = serializers.IntegerField(source='profile.promoCoins', read_only=True)
    energy = serializers.IntegerField(source='profile.energy', read_only=True)
    realBalance = serializers.FloatField(source='profile.realBalance', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'level', 'coins', 'mtCoins', 'promoCoins', 'energy', 'realBalance']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['username', 'password', 'email']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserBuildingSerializer(serializers.ModelSerializer):
    type = serializers.SlugRelatedField(read_only=True, slug_field='slug')
    name = serializers.CharField(source='type.name', read_only=True)
    base_cost = serializers.IntegerField(source='type.base_cost', read_only=True)
    incomeRate = serializers.SerializerMethodField()
    maxCapacity = serializers.SerializerMethodField()

    def get_incomeRate(self, obj):
        return obj.type.incomeRate * (2 ** (obj.level - 1))

    def get_maxCapacity(self, obj):
        return obj.type.maxCapacity * (2 ** (obj.level - 1))

    class Meta:
        model = UserBuilding
        fields = ['id', 'type', 'name', 'x', 'y', 'level', 'maxCapacity', 'incomeRate', 'lastCollected', 'base_cost', 'rotated']
