#!/usr/bin/env python3
"""
Script para forçar criação de superusuário no Railway
Este script deve ser executado DENTRO do ambiente do Railway
"""

import os
import sys

# PRIMEIRO: Configurar o Django settings ANTES de qualquer import
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# SEGUNDO: Configurar o Django
import django
django.setup()

# TERCEIRO: Agora sim importar os modelos
from django.contrib.auth.models import User

def create_superuser():
    """Cria superusuário se não existir"""
    username = 'admin'
    password = 'admin123'
    email = 'admin@example.com'
    
    print(f"🚀 Verificando se usuário '{username}' existe...")
    
    # Verificar se já existe
    if User.objects.filter(username=username).exists():
        print(f"✅ Usuário '{username}' já existe!")
        user = User.objects.get(username=username)
        print(f"   - É superusuário: {user.is_superuser}")
        print(f"   - Está ativo: {user.is_active}")
        print(f"   - Email: {user.email}")
        
        # Atualizar senha se necessário
        if not user.check_password(password):
            print(f"🔄 Atualizando senha do usuário...")
            user.set_password(password)
            user.save()
            print(f"✅ Senha atualizada!")
        else:
            print(f"✅ Senha já está correta!")
    else:
        print(f"🔨 Criando novo superusuário '{username}'...")
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print(f"✅ Superusuário criado com sucesso!")
    
    print(f"\n📊 Estatísticas do banco:")
    print(f"   - Total de usuários: {User.objects.count()}")
    print(f"   - Superusuários: {User.objects.filter(is_superuser=True).count()}")
    
    # Listar todos os usuários
    print(f"\n👥 Todos os usuários:")
    for u in User.objects.all():
        print(f"   - {u.username} (super: {u.is_superuser}, ativo: {u.is_active})")

if __name__ == "__main__":
    try:
        create_superuser()
        print("\n🎉 Script executado com sucesso!")
    except Exception as e:
        print(f"\n❌ Erro no script: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1) 