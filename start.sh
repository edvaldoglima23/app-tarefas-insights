#!/bin/bash

echo "=== RAILWAY DEPLOY DEBUG ==="
echo "Starting deployment..."

# Debug das variáveis de ambiente
echo "=== CHECKING ENVIRONMENT VARIABLES ==="
python debug_env.py

echo "=== RUNNING DJANGO COMMANDS ==="

# Aplicar migrações
echo "Running migrations..."
python manage.py migrate

# Coletar arquivos estáticos
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Iniciar servidor
echo "Starting server on 0.0.0.0:$PORT"
python manage.py runserver 0.0.0.0:$PORT 