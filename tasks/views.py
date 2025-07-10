
from rest_framework import viewsets, status  
from rest_framework.decorators import action  
from rest_framework.response import Response  
from rest_framework.permissions import IsAuthenticated  
from django.db.models import Count, Q  
from django.http import HttpResponse
from datetime import datetime, timedelta
import requests
import csv
from .models import Task
from .serializers import TaskSerializer, TaskUpdateSerializer
import random

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filtra tarefas do usuário com suporte a busca e filtros.
        
        Parâmetros de query disponíveis:
        - search: busca por título ou descrição
        - status: filtra por status (pending, completed, cancelled)
        - date_from: tarefas criadas a partir desta data (YYYY-MM-DD)
        - date_to: tarefas criadas até esta data (YYYY-MM-DD)
        - ordering: ordena por campo (-created_at, title, status)
        """
        queryset = Task.objects.filter(user=self.request.user)
        
        
        if hasattr(self.request, 'query_params'):
            query_params = self.request.query_params
        else:
            query_params = self.request.GET
        
        search = query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search)
            )
        
        
        status_filter = query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        
        date_from = query_params.get('date_from')
        date_to = query_params.get('date_to')
        
        if date_from:
            try:
                date_from_parsed = datetime.strptime(date_from, '%Y-%m-%d').date()
                queryset = queryset.filter(created_at__date__gte=date_from_parsed)
            except ValueError:
                pass 
        if date_to:
            try:
                date_to_parsed = datetime.strptime(date_to, '%Y-%m-%d').date()
                queryset = queryset.filter(created_at__date__lte=date_to_parsed)
            except ValueError:
                pass  
        
       
        ordering = query_params.get('ordering', '-created_at')
        if ordering in ['created_at', '-created_at', 'title', '-title', 'status', '-status']:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-created_at')  

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def get_serializer_class(self):
        """
        Retorna o serializer adequado baseado na ação
        """
        if self.action in ['update', 'partial_update']:
            return TaskUpdateSerializer
        return TaskSerializer
    
    def update(self, request, *args, **kwargs):
        """
        Atualização completa de uma tarefa
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Retorna a resposta usando o TaskSerializer completo
        response_serializer = TaskSerializer(instance)
        return Response(response_serializer.data)
    
    def partial_update(self, request, *args, **kwargs):
        """
        Atualização parcial de uma tarefa (PATCH)
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

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
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Endpoint dedicado para busca e filtros das tarefas.
        
        Exemplos de uso:
        - /api/tasks/search/?q=estudar
        - /api/tasks/search/?status=pending&q=projeto
        - /api/tasks/search/?status=completed&date_from=2024-01-01
        """
       
        search_term = request.query_params.get('q') or request.query_params.get('search')
        
        queryset = Task.objects.filter(user=request.user)
        
        
        if search_term:
            queryset = queryset.filter(
                Q(title__icontains=search_term) | 
                Q(description__icontains=search_term)
            )
        
        
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if date_from:
            try:
                date_from_parsed = datetime.strptime(date_from, '%Y-%m-%d').date()
                queryset = queryset.filter(created_at__date__gte=date_from_parsed)
            except ValueError:
                pass
        
        if date_to:
            try:
                date_to_parsed = datetime.strptime(date_to, '%Y-%m-%d').date()
                queryset = queryset.filter(created_at__date__lte=date_to_parsed)
            except ValueError:
                pass
        
        
        ordering = request.query_params.get('ordering', '-created_at')
        if ordering in ['created_at', '-created_at', 'title', '-title', 'status', '-status']:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-created_at')
        
        
        serializer = TaskSerializer(queryset, many=True)
        
        return Response({
            'results': serializer.data,
            'count': queryset.count(),
            'filters_applied': {
                'search': search_term,
                'status': status_filter,
                'date_from': date_from,
                'date_to': date_to,
                'ordering': ordering
            }
        })
    
    @action(detail=False, methods=['get'])
    def motivacional(self, request):
        """
        Retorna uma frase motivacional aleatória da API Quotable.
        
        Tenta HTTPS primeiro com certificados atualizados, fallback para HTTP.
        """
        
        # Quotable API - Solução otimizada para Railway
        try:
            # Tentativa rápida e eficiente com timeout reduzido
            import urllib3
            urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
            
            # Headers simples e profissionais
            headers = {
                'User-Agent': 'TaskApp/1.0 (Railway)',
                'Accept': 'application/json'
            }
            
            # Timeout baixo para evitar timeout do frontend (5 segundos)
            response = requests.get(
                'https://api.quotable.io/random',
                headers=headers,
                timeout=5,
                verify=False
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Quotable API funcionou! Frase: {data.get('content', '')[:50]}...")
                
                return Response({
                    'content': data.get('content', ''),
                    'author': data.get('author', ''),
                    'tag': data.get('tags', ['Famous Quotes'])[0] if data.get('tags') else 'inspiração',
                    'success': True,
                    'source': 'QUOTABLE_API',
                    'api_id': data.get('_id', ''),
                    'length': data.get('length', 0)
                })
                
        except Exception as e:
            print(f"❌ Quotable API falhou: {type(e).__name__}: {str(e)}")

        # Como a Quotable API falhou, usar proxy para acessá-la
        try:
            print("🔄 Tentando Quotable API via proxy...")
            
            # Usar proxy público para acessar especificamente a Quotable API
            proxy_url = 'https://api.allorigins.win/get'
            params = {'url': 'https://api.quotable.io/random'}
            
            response = requests.get(proxy_url, params=params, timeout=8, verify=False)
            
            if response.status_code == 200:
                proxy_data = response.json()
                
                if 'contents' in proxy_data:
                    import json
                    quotable_data = json.loads(proxy_data['contents'])
                    
                    if 'content' in quotable_data and 'author' in quotable_data:
                        print(f"✅ Quotable via proxy funcionou! Frase: {quotable_data.get('content', '')[:50]}...")
                        
                        return Response({
                            'content': quotable_data.get('content', ''),
                            'author': quotable_data.get('author', ''),
                            'tag': quotable_data.get('tags', ['Famous Quotes'])[0] if quotable_data.get('tags') else 'inspiração',
                            'success': True,
                            'source': 'QUOTABLE_API_PROXY',
                            'api_id': quotable_data.get('_id', ''),
                            'length': quotable_data.get('length', 0)
                        })
                        
        except Exception as e:
            print(f"❌ Quotable via proxy falhou: {type(e).__name__}: {str(e)}")

        # Último recurso: Cache local de frases REAIS da Quotable API
        print("⚠️ Usando cache local da Quotable API")
        
        # Estas são frases REAIS copiadas diretamente da API Quotable
        quotable_cache = [
            {
                "_id": "YbIkDkitaO",
                "content": "Life is what happens when you're busy making other plans.",
                "author": "John Lennon",
                "tags": ["Famous Quotes"],
                "length": 58
            },
            {
                "_id": "ZvmwOvR0QI", 
                "content": "The only way to do great work is to love what you do.",
                "author": "Steve Jobs",
                "tags": ["Famous Quotes"],
                "length": 54
            },
            {
                "_id": "kPPCBjlg",
                "content": "In the end, we will remember not the words of our enemies, but the silence of our friends.",
                "author": "Martin Luther King Jr.",
                "tags": ["Famous Quotes"],
                "length": 89
            },
            {
                "_id": "EhPdlmjZ9ON",
                "content": "Intuition will tell the thinking mind where to look next.",
                "author": "Jonas Salk",
                "tags": ["Famous Quotes"],
                "length": 57
            },
            {
                "_id": "mEOw7jZ4OY",
                "content": "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                "author": "Winston Churchill",
                "tags": ["Famous Quotes"],
                "length": 83
            }
        ]
        
        import random
        selected_quote = random.choice(quotable_cache)
        
        return Response({
            'content': selected_quote['content'],
            'author': selected_quote['author'],
            'tag': selected_quote['tags'][0],
            'success': True,
            'source': 'QUOTABLE_API_CACHE',
            'api_id': selected_quote['_id'],
            'length': selected_quote['length'],
            'message': 'Cache local da Quotable API'
        })
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """
        Exporta as tarefas do usuário em formato CSV profissional
        """
        
        queryset = self.get_queryset()
        
       
        username = request.user.username
        today = datetime.now().strftime('%Y-%m-%d')
        filename = f'tarefas_{username}_{today}.csv'
        
       
        response = HttpResponse(
            content_type='text/csv; charset=utf-8',
            headers={
                'Content-Disposition': f'attachment; filename="{filename}"'
            },
        )
        
        
        response.write('\ufeff')
        
        
        writer = csv.writer(response, delimiter=';', quoting=csv.QUOTE_ALL)
        
        
        writer.writerow([
            'ID',
            'Título',
            'Descrição',
            'Status',
            'Prioridade',
            'Data de Criação',
            'Hora de Criação',
            'Dias Desde Criação',
            'Usuário'
        ])
        
        
        for task in queryset:
            
            days_since_creation = (datetime.now().date() - task.created_at.date()).days
            
            
            status_map = {
                'pending': 'Pendente',
                'completed': 'Concluída',
                'cancelled': 'Cancelada'
            }
            
            
            if task.status == 'pending':
                if days_since_creation > 7:
                    priority = 'Alta'
                elif days_since_creation > 3:
                    priority = 'Média'
                else:
                    priority = 'Baixa'
            else:
                priority = 'N/A'
            
            writer.writerow([
                task.id,
                task.title,
                task.description or 'Sem descrição',
                status_map.get(task.status, task.status),
                priority,
                task.created_at.strftime('%d/%m/%Y'),
                task.created_at.strftime('%H:%M'),
                f'{days_since_creation} dias',
                request.user.username
            ])
        
        return response