from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from .models import Task
from .serializers import TaskSerializer
import json
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from django.db.models import QuerySet


class TaskAPITestCase(APITestCase):
    """
    Test suite for Task API endpoints
    """
    
    def setUp(self):
        """
        Set up test data and authentication
        """
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        
        self.task1 = Task.objects.create(
            title='Estudar Python',
            description='Aprender sobre testes automatizados',
            status='pending',
            user=self.user
        )
        
        self.task2 = Task.objects.create(
            title='Fazer exercícios',
            description='Praticar programação',
            status='completed',
            user=self.user
        )
        
        self.client.force_authenticate(user=self.user)
    
    def test_create_and_list_tasks(self):
        """
        Test task creation and listing functionality
        """
        new_task_data = {
            'title': 'Nova tarefa de teste',
            'description': 'Esta é uma tarefa criada no teste automático',
            'status': 'pending'
        }
        
        # Test task creation
        response = self.client.post('/api/tasks/', new_task_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], new_task_data['title'])
        self.assertEqual(response.data['description'], new_task_data['description'])
        self.assertEqual(response.data['status'], 'pending')
        self.assertEqual(response.data['user'], self.user.id)
        
        print(f"✓ Task created successfully: {response.data['title']}")
        
        # Test task listing
        response = self.client.get('/api/tasks/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)  # 2 from setUp + 1 created
        
        task_titles = [task['title'] for task in response.data]
        self.assertIn('Nova tarefa de teste', task_titles)
        self.assertIn('Estudar Python', task_titles)
        self.assertIn('Fazer exercícios', task_titles)
        
        print(f"✓ Task listing successful: {len(response.data)} tasks found")
    
    def test_toggle_task_status(self):
        """
        Test task status update functionality
        """
        task_to_toggle = self.task1
        original_status = task_to_toggle.status
        
        # Test status change from 'pending' to 'completed'
        update_data = {'status': 'completed'}
        response = self.client.patch(f'/api/tasks/{task_to_toggle.id}/', update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'completed')
        self.assertEqual(response.data['title'], task_to_toggle.title)
        
        # Verify database update
        task_to_toggle.refresh_from_db()
        self.assertEqual(task_to_toggle.status, 'completed')
        
        print(f"✓ Task status updated: {original_status} → {task_to_toggle.status}")
        
        # Test status change back to 'pending'
        update_data = {'status': 'pending'}
        response = self.client.patch(f'/api/tasks/{task_to_toggle.id}/', update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'pending')
        
        # Verify database update
        task_to_toggle.refresh_from_db()
        self.assertEqual(task_to_toggle.status, 'pending')
        
        print(f"✓ Task status reverted: completed → {task_to_toggle.status}")
    
    def test_user_can_only_see_own_tasks(self):
        """
        Test user task isolation - users should only see their own tasks
        """
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@test.com',
            password='otherpass123'
        )
        
        other_task = Task.objects.create(
            title='Tarefa secreta',
            description='Só o outro usuário deve ver isso',
            status='pending',
            user=other_user
        )
        
        response = self.client.get('/api/tasks/')
        
        # Should only see own tasks (2 tasks from setUp)
        self.assertEqual(len(response.data), 2)
        
        # Should not see other user's task
        task_titles = [task['title'] for task in response.data]
        self.assertNotIn('Tarefa secreta', task_titles)
        
        print(f"✓ User isolation verified: {len(response.data)} own tasks visible, other user's task hidden")


class TaskModelTestCase(TestCase):
    """
    Test suite for Task model
    """
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='modeltest',
            email='model@test.com',
            password='modelpass123'
        )
    
    def test_task_creation(self):
        """
        Test task model creation and validation
        """
        task = Task.objects.create(
            title='Teste do modelo',
            description='Testando criação de tarefa',
            status='pending',
            user=self.user
        )
        
        self.assertEqual(task.title, 'Teste do modelo')
        self.assertEqual(task.description, 'Testando criação de tarefa')
        self.assertEqual(task.status, 'pending')
        self.assertEqual(task.user, self.user)
        self.assertIsNotNone(task.created_at)
        
        # Test string representation
        self.assertEqual(str(task), 'Teste do modelo')
