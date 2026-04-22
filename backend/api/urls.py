from django.urls import path
from .views import RegisterView, LoginView, CityView

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    
    # Game
    path('game/city/', CityView.as_view()),
]