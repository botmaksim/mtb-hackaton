from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserBuilding, Profile
from .serializers import UserBuildingSerializer, RegisterSerializer, UserSerializer

# --- АВТОРИЗАЦИЯ ---
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
        return Response({"error": "Invalid Credentials"}, status=401)

# --- ИГРОВАЯ ЛОГИКА ---
class CityView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        profile = request.user.profile
        buildings = UserBuilding.objects.filter(user=request.user)
        return Response({
            "coins": profile.coins,
            "mtCoins": profile.mtCoins,
            "promoCoins": profile.promoCoins,
            "buildings": UserBuildingSerializer(buildings, many=True).data
        })