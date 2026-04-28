from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from .models import UserBuilding, Profile, BuildingType, MarketItem
from .serializers import UserBuildingSerializer, RegisterSerializer, UserSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.isA_valid():
            user = serializer.save()
            
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            username = request.data.get('username')
            user = User.objects.filter(username=username).first()
            if user:
                response.data['user'] = UserSerializer(user).data
        return response

class CityView(APIView):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.request.method == 'GET':
            user_id = self.request.query_params.get('user_id')
            if user_id == 'guest':
                return [AllowAny()]
        return super().get_permissions()
    
    def get(self, request):
        user_id = request.query_params.get('user_id')
        target_user = request.user
        if user_id:
            if user_id == 'guest':
                 return Response({"error": "Guest access not supported directly by id"}, status=404)
            try:
                from django.contrib.auth.models import User
                target_user = User.objects.get(id=user_id)
            except (User.DoesNotExist, ValueError):
                return Response({"error": "User not found"}, status=404)
                
        buildings = UserBuilding.objects.filter(user=target_user)
        return Response({
            "buildings": UserBuildingSerializer(buildings, many=True).data,
            "profile": UserSerializer(target_user).data
        })

    def post(self, request):
        # Исправлено: берем pos_x и pos_y из запроса фронтенда
        type_id = request.data.get('type_id')
        x = request.data.get('pos_x')
        y = request.data.get('pos_y')
        rotated = request.data.get('rotated', False)
        
        if x is None or y is None:
            return Response({"error": "Не указаны координаты здания"}, status=400)
            
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
                rotated=rotated,
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

            scaled_income = building.type.incomeRate * (2 ** (building.level - 1))
            scaled_capacity = building.type.maxCapacity * (2 ** (building.level - 1))

            seconds_passed = max(0, (now_ms - building.lastCollected) / 1000)
            generated = int(seconds_passed * (scaled_income / 10))
            
            # Ограничиваем вместимостью из модели типа здания
            generated = min(generated, scaled_capacity)
            
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

class UpgradeBuildingView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        building_id = request.data.get('building_id')
        try:
            building = UserBuilding.objects.get(id=building_id, user=request.user)
            profile = request.user.profile
            upgrade_cost = building.type.base_cost * (building.level + 1)
            
            if profile.coins < upgrade_cost:
                return Response({"error": "Недостаточно монет для улучшения"}, status=400)
                
            profile.coins -= upgrade_cost
            # Grant some promo coins on upgrade
            profile.promoCoins += 5
            profile.save()
            
            building.level += 1
            building.save()
            
            return Response({"success": True, "new_level": building.level, "coins": profile.coins, "promoCoins": profile.promoCoins})
        except (UserBuilding.DoesNotExist, ValidationError):
            return Response({"error": "Здание не найдено"}, status=404)

import random

class OpenCaseView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        case_id = request.data.get('case_id')
        profile = request.user.profile
        
        if case_id == 'normal':
            cost = 10
            if profile.mtCoins < cost:
                return Response({"error": "Недостаточно МТКоинов"}, status=400)
            
            profile.mtCoins -= cost
            
            # 80% chance for coins, 20% chance for promoCoins
            roll = random.random()
            if roll < 0.8:
                amount = random.randint(500, 2500)
                profile.coins += amount
                drop_data = {"drop_type": "coins", "amount": amount, "name": "Монеты"}
            else:
                amount = random.randint(1, 5)
                profile.promoCoins += amount
                drop_data = {"drop_type": "promoCoins", "amount": amount, "name": "Промо-коины"}
                
            profile.save()
            return Response({"success": True, "drop": drop_data})
            
        elif case_id == 'promo':
            cost = 50
            if profile.promoCoins < cost:
                return Response({"error": "Недостаточно Промокоинов"}, status=400)
                
            profile.promoCoins -= cost
            
            # 50% chance for KFC, 50% chance for Moneyback
            roll = random.random()
            if roll < 0.5:
                # Random code generator
                code = f"KFC-MTB-{random.randint(1000, 9999)}"
                drop_data = {"drop_type": "promocode", "name": "Промокод KFC", "text": code}
            else:
                code = f"CASHBACK-{random.randint(10, 50)}%"
                drop_data = {"drop_type": "promocode", "name": "Манибэк от МТБ", "text": code}
                
            profile.save()
            return Response({"success": True, "drop": drop_data})
            
        return Response({"error": "Неизвестный тип кейса"}, status=400)

class AchievementsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Return mocked achievements with condition logic
        achievements = [
            {"id": 'q1', "title": "Миллионер из трущоб", "desc": "Накопите 5,000 обычных коинов", "condition": request.user.profile.coins >= 5000, "reward": 50, "claimed": False},
            {"id": 'q2', "title": "Первая постройка", "desc": "Постройте хотя бы 1 здание", "condition": request.user.buildings.count() > 0, "reward": 100, "claimed": False},
        ]
        return Response({"achievements": achievements})

class ClaimAchievementView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        achievement_id = request.data.get('achievement_id')
        profile = request.user.profile
        # Mock validation, just hand out the reward
        if achievement_id == 'q1':
             profile.promoCoins += 50
        elif achievement_id == 'q2':
             profile.promoCoins += 100
        profile.save()
        return Response({"success": True})

class ExchangeView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        from_currency = request.data.get('from_currency')
        to_currency = request.data.get('to_currency')
        try:
            amount = int(request.data.get('amount', 0))
        except (ValueError, TypeError):
            return Response({"error": "Неверная сумма"}, status=400)
        
        if amount <= 0:
            return Response({"error": "Сумма должна быть больше нуля"}, status=400)
            
        profile = request.user.profile
        
        # MTCoins -> Coins (e.g., 1 mtCoin = 100 coins)
        if from_currency.lower() == 'mtcoins' and to_currency.lower() == 'coins':
            if profile.mtCoins < amount:
                return Response({"error": "Недостаточно MTCoins"}, status=400)
            profile.mtCoins -= amount
            profile.coins += (amount * 100)
            profile.save()
            return Response({"success": True, "new_mtCoins": profile.mtCoins, "new_coins": profile.coins})
            
        return Response({"error": "Такой обмен не поддерживается"}, status=400)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({ "user": UserSerializer(request.user).data })

class PasswordResetView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        return Response({"message": "If the email was valid, a reset link was sent."})

class MarketListingsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        items = MarketItem.objects.all().order_by('-created_at')
        data = [{
            "id": i.id, 
            "seller": i.user.username, 
            "seller_id": i.user.id,
            "resource_type": i.resource_type, 
            "amount": i.amount, 
            "price": i.price,
            "name": f"{i.amount} {i.resource_type}",
            "description": "Свободный рынок",
            "color": "emerald" if i.resource_type == 'promoCoins' else "orange"
        } for i in items]
        return Response({"listings": data})

class MarketBuyView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        listing_id = request.data.get('listing_id')
        try:
            item = MarketItem.objects.get(id=listing_id)
            if item.user == request.user:
                return Response({"error": "Вы не можете купить свой собственный предмет"}, status=400)

            buyer_profile = request.user.profile
            seller_profile = item.user.profile
            
            if buyer_profile.mtCoins < item.price:
                return Response({"error": "Недостаточно MTCoins"}, status=400)
            
            buyer_profile.mtCoins -= item.price
            seller_profile.mtCoins += item.price
            
            if item.resource_type == 'promoCoins':
                buyer_profile.promoCoins += item.amount
            elif item.resource_type == 'skin':
                pass # Skin apply logic
                
            buyer_profile.save()
            seller_profile.save()
            item.delete()
            return Response({"success": True})
        except MarketItem.DoesNotExist:
            return Response({"error": "Предмет не найден"}, status=404)

class MarketSellView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        res_type = request.data.get('resource_type')
        try:
            amount = int(request.data.get('amount', 1))
            price = int(request.data.get('price', 10))
        except (ValueError, TypeError):
            return Response({"error": "Неверные данные"}, status=400)

        if amount <= 0 or price <= 0:
            return Response({"error": "Количество и цена должны быть больше нуля"}, status=400)
        
        profile = request.user.profile
        if res_type == 'promoCoins':
            if profile.promoCoins < amount:
                return Response({"error": "Недостаточно ресурсов"}, status=400)
            profile.promoCoins -= amount
            profile.save()
            
        MarketItem.objects.create(user=request.user, resource_type=res_type, amount=amount, price=price)
        return Response({"success": True})

class SocialLeaderboardView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        users = Profile.objects.all().order_by('-level', '-coins')[:50]
        leaderboard = []
        for i, p in enumerate(users):
            leaderboard.append({
                "id": p.user.id,
                "name": p.user.username,
                "rank": i + 1,
                "score": p.coins,
                "investable": True, # Dummy logic
                "isMe": p.user.id == request.user.id
            })
        return Response({"leaderboard": leaderboard})

class SocialAuditView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        target_id = request.data.get('target_id')
        try:
            target_profile = Profile.objects.get(user__id=target_id)
            if target_profile.user == request.user:
                return Response({"error": "Нельзя отправить промоутера самому себе"}, status=400)
            
            # Переманивание клиентов - крадем часть монет из-за конкуренции
            penalty = target_profile.coins // 10
            target_profile.coins -= penalty
            target_profile.save()
            
            # Начисляем часть штрафа отправителю
            profile = request.user.profile
            profile.coins += penalty
            profile.save()
            
            return Response({"success": True, "message": f"Промоутер направлен! Переманено {penalty} коинов прибыли конкурента."})
        except Profile.DoesNotExist:
            return Response({"error": "Цель не найдена"}, status=404)

class SyncMCCView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        profile = request.user.profile
        mcc = request.data.get('mcc', '7832')
        
        if mcc == '5814':
            # Кофейня - бафф на скорость постройки/энергию
            profile.energy += 50
            profile.save()
            return Response({
                "success": True, 
                "message": "Синхронизация успешна! Найдена транзакция (МСС 5814 - Кофейня). Получен бафф Бодрость!",
                "reward": 0
            })
        else:
            # Кино/Развлечения - лутбокс/коины
            reward_amount = 5
            profile.mtCoins += reward_amount
            profile.save()
            return Response({
                "success": True, 
                "message": "Синхронизация успешна! Найдена транзакция (МСС 7832 - Кино).",
                "reward": reward_amount
            })

class SocialInvestView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        # Dummy behavior for forced cooperation
        friend_id = request.data.get('friend_id')
        try:
            amount = int(request.data.get('amount', 0))
        except (ValueError, TypeError):
            return Response({"error": "Неверная сумма"}, status=400)
            
        if amount <= 0:
            return Response({"error": "Сумма должна быть больше нуля"}, status=400)
            
        profile = request.user.profile
        if profile.coins < amount:
            return Response({"error": "Недостаточно средств"}, status=400)
            
        try:
            target_profile = Profile.objects.get(user__id=friend_id)
        except Profile.DoesNotExist:
            return Response({"error": "Пользователь не найден"}, status=404)
            
        profile.coins -= amount
        profile.save()
        
        target_profile.coins += amount
        target_profile.save()
        
        return Response({"success": True, "message": "Инвестиция прошла успешно"})
