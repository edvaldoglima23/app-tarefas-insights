#!/usr/bin/env python3
"""
Script simples para criar superusuário usando comando nativo do Django
"""

import os
import subprocess
import sys

def create_superuser_simple():
    """Cria superusuário usando comando nativo do Django"""
    print("🚀 Criando superusuário com comando nativo do Django...")
    
    # Definir variáveis de ambiente para criação não-interativa
    env = os.environ.copy()
    env['DJANGO_SUPERUSER_USERNAME'] = 'admin'
    env['DJANGO_SUPERUSER_EMAIL'] = 'admin@example.com'
    env['DJANGO_SUPERUSER_PASSWORD'] = 'admin123'
    
    try:
        # Executar comando createsuperuser
        result = subprocess.run([
            'python', 'manage.py', 'createsuperuser', '--noinput'
        ], env=env, capture_output=True, text=True)
        
        print(f"📤 Saída do comando:")
        print(result.stdout)
        
        if result.stderr:
            print(f"⚠️ Avisos/Erros:")
            print(result.stderr)
        
        if result.returncode == 0:
            print("✅ Superusuário criado com sucesso!")
        else:
            print(f"❌ Erro ao criar superusuário (código: {result.returncode})")
            
    except Exception as e:
        print(f"🚨 Exceção: {e}")

if __name__ == "__main__":
    create_superuser_simple() 