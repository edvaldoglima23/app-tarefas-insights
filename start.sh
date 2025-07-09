#!/bin/bash

# Aplicar migrações
python manage.py migrate

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Iniciar servidor
python manage.py runserver 0.0.0.0:$PORT 