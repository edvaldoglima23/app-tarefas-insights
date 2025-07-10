#!/bin/bash

echo "🚀 DEPLOY COM SUPERUSUÁRIO - RAILWAY"
echo "=================================="

# Aguardar banco estar pronto
echo "⏳ Aguardando banco PostgreSQL..."
python wake_db.py

# Executar migrações
echo "📦 Executando migrações..."
python manage.py migrate --noinput

# Coletar arquivos estáticos
echo "📁 Coletando arquivos estáticos..."
python manage.py collectstatic --noinput

# FORÇAR criação do superusuário
echo "👤 Forçando criação do superusuário..."
python force_create_superuser.py

# Verificar se superusuário foi criado
echo "🔍 Verificando criação do superusuário..."
python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from django.contrib.auth.models import User
user = User.objects.filter(username='admin').first()
if user:
    print(f'✅ Superusuário existe: {user.username}')
    print(f'   - É superusuário: {user.is_superuser}')
    print(f'   - Está ativo: {user.is_active}')
    print(f'   - Senha válida: {user.check_password(\"admin123\")}')
else:
    print('❌ Superusuário NÃO encontrado!')
"

echo "🌟 Iniciando servidor..."
exec gunicorn core.wsgi:application --bind 0.0.0.0:$PORT 