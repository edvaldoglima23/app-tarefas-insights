from django.urls import path, include
from rest_framework.routs import Defaultrouter
from .views import TaskViewSet

router = Defaultrouter()
router.register(r'tasks', TaskViewSet, basename='task')

urlpatters = [
    path('api/', include(router.urls)),
]