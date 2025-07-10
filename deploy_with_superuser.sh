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

# MÉTODO 1: Tentar criar superusuário com comando nativo
echo "👤 Método 1: Criando superusuário com comando nativo..."
export DJANGO_SUPERUSER_USERNAME=admin
export DJANGO_SUPERUSER_EMAIL=admin@example.com
export DJANGO_SUPERUSER_PASSWORD=admin123
python manage.py createsuperuser --noinput || echo "⚠️ Comando nativo falhou (pode ser que usuário já exista)"

# MÉTODO 2: Usar script customizado como backup
echo "👤 Método 2: Usando script customizado..."
python create_admin_simple.py

# MÉTODO 3: Usar script avançado como último recurso
echo "👤 Método 3: Usando script avançado..."
python force_create_superuser.py || echo "⚠️ Script avançado falhou"

# Verificar se superusuário foi criado
echo "🔍 Verificando criação do superusuário..."
python manage.py shell -c "
from django.contrib.auth.models import User
user = User.objects.filter(username='admin').first()
if user:
    print('✅ Superusuário existe: admin')
    print(f'   - É superusuário: {user.is_superuser}')
    print(f'   - Está ativo: {user.is_active}')
    print(f'   - Senha válida: {user.check_password(\"admin123\")}')
    print(f'   - Total usuários: {User.objects.count()}')
else:
    print('❌ Superusuário NÃO encontrado!')
    print(f'   - Total usuários: {User.objects.count()}')
    for u in User.objects.all():
        print(f'   - Usuário: {u.username}')
"

echo "🌟 Iniciando servidor..."
exec gunicorn core.wsgi:application --bind 0.0.0.0:$PORT 