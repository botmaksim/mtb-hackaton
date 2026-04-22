from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserBuilding, Profile, BuildingType
from .serializers import UserBuildingSerializer, RegisterSerializer, UserSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data
            })
        return Response({"error": "Invalid credentials"}, status=401)

class CityView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        buildings = UserBuilding.objects.filter(user=request.user)
        return Response({
            "buildings": UserBuildingSerializer(buildings, many=True).data,
            "profile": UserSerializer(request.user).data
        })

    def post(self, request):
        # Исправлено: берем pos_x и pos_y из запроса фронтенда
        type_id = request.data.get('type_id')
        x = request.data.get('pos_x')
        y = request.data.get('pos_y')
        
        try:
            b_type = BuildingType.objects.get(slug=type_id)
            profile = request.user.profile
            
            if profile.coins < b_type.base_cost:
                return Response({"error": "Недостаточно средств"}, status=400)
            
            new_building = UserBuilding.objects.create(
                user=request.user,
                type=b_type,
                x=x,
                y=y,
                lastCollected=int(timezone.now().timestamp() * 1000)
            )

            profile.coins -= b_type.base_cost
            profile.save()

            return Response(UserBuildingSerializer(new_building).data, status=201)
        except BuildingType.DoesNotExist:
            return Response({"error": "Тип здания не найден"}, status=404)

class CollectIncomeView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        building_id = request.data.get('building_id')
        try:
            building = UserBuilding.objects.get(id=building_id, user=request.user)
            now_ms = int(timezone.now().timestamp() * 1000)

            seconds_passed = max(0, (now_ms - building.lastCollected) / 1000)
            generated = int(seconds_passed * (building.type.incomeRate / 10))
            
            # Ограничиваем вместимостью из модели типа здания
            generated = min(generated, building.type.maxCapacity)
            
            profile = request.user.profile
            if generated > 0:
                profile.coins += generated
                profile.save()
                building.lastCollected = now_ms
                building.save()
                
            return Response({
                "new_balance": profile.coins,
                "collected": generated,
                "lastCollected": building.lastCollected
            })
        except UserBuilding.DoesNotExist:
            return Response({"error": "Здание не найдено"}, status=404)