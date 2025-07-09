#!/usr/bin/env python
import os

print("=== VARIABLES DE AMBIENTE ===")
print("SECRET_KEY:", os.environ.get('SECRET_KEY', 'NOT FOUND'))
print("DEBUG:", os.environ.get('DEBUG', 'NOT FOUND'))
print("ALLOWED_HOSTS:", os.environ.get('ALLOWED_HOSTS', 'NOT FOUND'))
print("")
print("=== POSTGRESQL VARIABLES ===")
print("PGHOST:", os.environ.get('PGHOST', 'NOT FOUND'))
print("PGDATABASE:", os.environ.get('PGDATABASE', 'NOT FOUND'))
print("PGUSER:", os.environ.get('PGUSER', 'NOT FOUND'))
print("PGPASSWORD:", os.environ.get('PGPASSWORD', 'NOT FOUND'))
print("PGPORT:", os.environ.get('PGPORT', 'NOT FOUND'))
print("")
print("=== TODAS AS VARIAVEIS (filtradas) ===")
for key, value in os.environ.items():
    if any(keyword in key.upper() for keyword in ['PG', 'SECRET', 'DEBUG', 'ALLOW', 'DATABASE']):
        print(f"{key}: {value}") 