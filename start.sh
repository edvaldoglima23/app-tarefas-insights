#!/bin/bash

echo "=== RAILWAY DEPLOY DEBUG ==="
echo "Starting deployment..."

# Debug das variáveis de ambiente
echo "=== CHECKING ENVIRONMENT VARIABLES ==="
python debug_env.py

echo "=== RUNNING DJANGO COMMANDS ==="

# Aguardar um pouco para o PostgreSQL estar pronto
echo "Waiting for database to be ready..."
sleep 10

# Tentar conectar no banco com timeout
echo "Testing database connection..."
timeout 30 python -c "
import os
import psycopg2
try:
    conn = psycopg2.connect(
        host=os.environ.get('PGHOST'),
        database=os.environ.get('PGDATABASE'),
        user=os.environ.get('PGUSER'),
        password=os.environ.get('PGPASSWORD'),
        port=os.environ.get('PGPORT', 5432),
        connect_timeout=20
    )
    print('✅ Database connection successful!')
    conn.close()
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    exit(1)
"

# Aplicar migrações com timeout
echo "Running migrations with timeout..."
timeout 120 python manage.py migrate || {
    echo "❌ Migration failed or timed out"
    exit 1
}

# Coletar arquivos estáticos
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Iniciar servidor
echo "Starting server on 0.0.0.0:$PORT"
python manage.py runserver 0.0.0.0:$PORT 