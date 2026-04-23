from django.urls import path
from .views import RegisterView, LoginView, CityView, CollectIncomeView, ProfileView, PasswordResetView, MarketListingsView, MarketBuyView, MarketSellView, SocialLeaderboardView, SocialAuditView, SocialInvestView, ExchangeView, UpgradeBuildingView, OpenCaseView, AchievementsView, ClaimAchievementView, SyncMCCView

urlpatterns = [
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('auth/profile/', ProfileView.as_view()),
    path('auth/password-reset/', PasswordResetView.as_view()),
    
    path('game/city/', CityView.as_view()),
    # Фронт шлет постройку сюда
    path('game/build/', CityView.as_view()), 
    # Фронт шлет сбор дохода сюда
    path('game/collect-income/', CollectIncomeView.as_view()),
    path('game/exchange/', ExchangeView.as_view()),
    path('game/upgrade/', UpgradeBuildingView.as_view()),
    path('game/cases/open/', OpenCaseView.as_view()),
    path('game/achievements/', AchievementsView.as_view()),
    path('game/achievements/claim/', ClaimAchievementView.as_view()),

    path('bank/sync-mcc/', SyncMCCView.as_view()),


    
    path('market/listings/', MarketListingsView.as_view()),
    path('market/buy/', MarketBuyView.as_view()),
    path('market/sell/', MarketSellView.as_view()),
    
    path('social/leaderboard/', SocialLeaderboardView.as_view()),
    path('social/audit/', SocialAuditView.as_view()),
    path('social/invest/', SocialInvestView.as_view()),
]