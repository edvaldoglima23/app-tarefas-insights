from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from datetime import datetime, timedelta
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Retorna estatísticas das tarefas do usuário
        """
        user_tasks = self.get_queryset()
        
        
        total_tasks = user_tasks.count()
        completed_tasks = user_tasks.filter(status='completed').count()
        pending_tasks = user_tasks.filter(status='pending').count()
        
        
        today = datetime.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        tasks_today = user_tasks.filter(created_at__date=today).count()
        tasks_this_week = user_tasks.filter(created_at__date__gte=week_ago).count()
        tasks_this_month = user_tasks.filter(created_at__date__gte=month_ago).count()
        
        completed_today = user_tasks.filter(
            status='completed',
            created_at__date=today
        ).count()
        
       
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
       
        recent_tasks = user_tasks.order_by('-created_at')[:5]
        recent_tasks_data = TaskSerializer(recent_tasks, many=True).data
        
        statistics_data = {
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'pending_tasks': pending_tasks,
            'completion_rate': round(completion_rate, 1),
            'tasks_today': tasks_today,
            'tasks_this_week': tasks_this_week,
            'tasks_this_month': tasks_this_month,
            'completed_today': completed_today,
            'recent_tasks': recent_tasks_data
        }
        
        return Response(statistics_data)    