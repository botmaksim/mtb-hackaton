from django.test import TestCase
from django.contrib.auth.models import User
from .models import Profile, BuildingType, UserBuilding

class CityLogicTest(TestCase):
    def setUp(self):
        # Create user
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.profile = self.user.profile
        self.profile.coins = 1000
        self.profile.mtCoins = 100
        self.profile.save()

        # Create some building types
        self.b_type = BuildingType.objects.create(
            slug='res_test',
            name='Test Building',
            incomeRate=10,
            maxCapacity=1000,
            base_cost=500
        )

    def test_building_creation(self):
        building = UserBuilding.objects.create(
            user=self.user,
            type=self.b_type,
            x=0,
            y=0,
            lastCollected=1000
        )
        self.assertEqual(UserBuilding.objects.count(), 1)
        self.assertEqual(building.user, self.user)
