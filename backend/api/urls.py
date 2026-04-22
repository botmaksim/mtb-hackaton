from django.urls import path
from .views import RegisterView, LoginView, CityView, CollectIncomeView

urlpatterns = [
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('game/city/', CityView.as_view()),
    # Фронт шлет постройку сюда
    path('game/build/', CityView.as_view()), 
    # Фронт шлет сбор дохода сюда
    path('game/collect-income/', CollectIncomeView.as_view()),
]