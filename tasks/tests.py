from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from .models import Task
from .serializers import TaskSerializer
import json


class TaskAPITestCase(APITestCase):
    """
    Testes para os endpoints da API de tarefas
    """
    
    def setUp(self):
        """
        Configuração inicial para cada teste - como preparar o cenário
        """
        # Cria um usuário de teste
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        
        # Cria algumas tarefas de exemplo
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
        
        # Autentica o usuário para os testes
        self.client.force_authenticate(user=self.user)
    
    def test_create_and_list_tasks(self):
        """
        TESTE 1: Verifica se conseguimos criar uma nova tarefa e listar todas as tarefas
        É como testar se o botão "Adicionar tarefa" funciona direito!
        """
        print("\n🧪 TESTE 1: Criando e listando tarefas...")
        
        # Dados para criar uma nova tarefa
        new_task_data = {
            'title': 'Nova tarefa de teste',
            'description': 'Esta é uma tarefa criada no teste automático',
            'status': 'pending'
        }
        
        # 📝 PARTE 1: Tenta criar uma nova tarefa
        print("📝 Criando nova tarefa...")
        response = self.client.post('/api/tasks/', new_task_data, format='json')
        
        # Verifica se a criação foi bem-sucedida (status 201 = criado com sucesso)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], new_task_data['title'])
        self.assertEqual(response.data['description'], new_task_data['description'])
        self.assertEqual(response.data['status'], 'pending')
        self.assertEqual(response.data['user'], self.user.id)
        
        print(f"✅ Tarefa criada com sucesso: {response.data['title']}")
        
        # 📋 PARTE 2: Lista todas as tarefas
        print("📋 Listando todas as tarefas...")
        response = self.client.get('/api/tasks/')
        
        # Verifica se conseguiu listar (status 200 = sucesso)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Agora devemos ter 3 tarefas (2 do setUp + 1 que criamos)
        self.assertEqual(len(response.data), 3)
        
        # Verifica se nossa nova tarefa está na lista
        task_titles = [task['title'] for task in response.data]
        self.assertIn('Nova tarefa de teste', task_titles)
        self.assertIn('Estudar Python', task_titles)
        self.assertIn('Fazer exercícios', task_titles)
        
        print(f"✅ Listagem funcionou! Encontradas {len(response.data)} tarefas")
        print("🎉 TESTE 1 passou com sucesso!")
    
    def test_toggle_task_status(self):
        """
        TESTE 2: Verifica se conseguimos mudar o status de uma tarefa
        É como testar aquele botão que acabamos de arrumar!
        """
        print("\n🧪 TESTE 2: Testando mudança de status...")
        
        # Pega a tarefa que está 'pending'
        task_to_toggle = self.task1
        original_status = task_to_toggle.status
        print(f"📝 Tarefa inicial: '{task_to_toggle.title}' - Status: {original_status}")
        
        # 🔄 PARTE 1: Muda de 'pending' para 'completed'
        print("🔄 Mudando status de 'pending' para 'completed'...")
        
        update_data = {'status': 'completed'}
        response = self.client.patch(f'/api/tasks/{task_to_toggle.id}/', update_data, format='json')
        
        # Verifica se a atualização foi bem-sucedida
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'completed')
        self.assertEqual(response.data['title'], task_to_toggle.title)  # Título deve continuar igual
        
        print(f"✅ Status mudou para: {response.data['status']}")
        
        # Verifica se mudou no banco de dados também
        task_to_toggle.refresh_from_db()
        self.assertEqual(task_to_toggle.status, 'completed')
        
        # 🔄 PARTE 2: Muda de volta para 'pending'
        print("🔄 Mudando status de volta para 'pending'...")
        
        update_data = {'status': 'pending'}
        response = self.client.patch(f'/api/tasks/{task_to_toggle.id}/', update_data, format='json')
        
        # Verifica se a mudança de volta funcionou
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'pending')
        
        print(f"✅ Status mudou de volta para: {response.data['status']}")
        
        # Verifica se mudou no banco de dados também
        task_to_toggle.refresh_from_db()
        self.assertEqual(task_to_toggle.status, 'pending')
        
        print("🎉 TESTE 2 passou com sucesso!")
    
    def test_user_can_only_see_own_tasks(self):
        """
        TESTE BÔNUS: Verifica se um usuário só vê as próprias tarefas
        (teste de segurança!)
        """
        print("\n🧪 TESTE BÔNUS: Testando privacidade das tarefas...")
        
        # Cria outro usuário
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@test.com',
            password='otherpass123'
        )
        
        # Cria uma tarefa para o outro usuário
        other_task = Task.objects.create(
            title='Tarefa secreta',
            description='Só o outro usuário deve ver isso',
            status='pending',
            user=other_user
        )
        
        # Lista tarefas sendo o primeiro usuário
        response = self.client.get('/api/tasks/')
        
        # Deve ver apenas suas próprias tarefas (2 tarefas)
        self.assertEqual(len(response.data), 2)
        
        # Não deve ver a tarefa do outro usuário
        task_titles = [task['title'] for task in response.data]
        self.assertNotIn('Tarefa secreta', task_titles)
        
        print("✅ Usuário só vê as próprias tarefas - segurança OK!")
        print("🎉 TESTE BÔNUS passou com sucesso!")


class TaskModelTestCase(TestCase):
    """
    Testes para o modelo Task (testa o "cérebro" das tarefas)
    """
    
    def setUp(self):
        """Preparação para os testes do modelo"""
        self.user = User.objects.create_user(
            username='modeltest',
            email='model@test.com',
            password='modelpass123'
        )
    
    def test_task_creation(self):
        """
        Testa se conseguimos criar uma tarefa corretamente
        """
        print("\n🧪 TESTE: Criação de tarefa no modelo...")
        
        task = Task.objects.create(
            title='Teste do modelo',
            description='Testando criação de tarefa',
            status='pending',
            user=self.user
        )
        
        # Verifica se foi criada corretamente
        self.assertEqual(task.title, 'Teste do modelo')
        self.assertEqual(task.description, 'Testando criação de tarefa')
        self.assertEqual(task.status, 'pending')
        self.assertEqual(task.user, self.user)
        self.assertIsNotNone(task.created_at)  # Data deve ser preenchida automaticamente
        
        # Testa o método __str__
        self.assertEqual(str(task), 'Teste do modelo')
        
        print("✅ Tarefa criada corretamente no modelo!")
        print("🎉 Teste do modelo passou com sucesso!")
