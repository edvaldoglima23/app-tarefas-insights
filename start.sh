#!/bin/bash

echo "=== RAILWAY DEPLOY DEBUG ==="
echo "Starting deployment..."

# Debug das variáveis de ambiente
echo "=== CHECKING ENVIRONMENT VARIABLES ==="
python debug_env.py

echo "=== RUNNING DJANGO COMMANDS ==="

# Aguardar um pouco e depois tentar acordar o banco
echo "Waking up database..."
python wake_db.py

if [ $? -ne 0 ]; then
    echo "❌ Failed to wake database, trying anyway..."
fi

# Aplicar migrações com timeout
echo "Running migrations with timeout..."
timeout 180 python manage.py migrate || {
    echo "❌ Migration failed or timed out"
    exit 1
}

# Coletar arquivos estáticos
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Iniciar servidor
echo "Starting server on 0.0.0.0:$PORT"
python manage.py runserver 0.0.0.0:$PORT 