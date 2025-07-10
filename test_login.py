#!/usr/bin/env python3
import requests
import json

# URL da API
BASE_URL = "https://web-production-02fc5.up.railway.app/api"

def test_login(username, password):
    """Testa login com credenciais específicas"""
    url = f"{BASE_URL}/token/"
    data = {"username": username, "password": password}
    
    try:
        response = requests.post(url, json=data)
        print(f"🔐 Testando {username}:{password}")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"   ✅ LOGIN SUCESSO!")
            print(f"   Token: {response.json()}")
            return True
        else:
            print(f"   ❌ Erro: {response.text}")
            return False
    except Exception as e:
        print(f"   🚨 Exceção: {e}")
        return False

# Testa diferentes combinações
print("🚀 Testando diferentes credenciais...\n")

credenciais = [
    ("admin", "admin123"),
    ("admin", "admin"),
    ("superuser", "admin123"),
    ("user", "admin123"),
    ("root", "admin123"),
]

for username, password in credenciais:
    if test_login(username, password):
        break
    print()

print("\n🔍 Testando se API está funcionando...")
try:
    response = requests.get(f"{BASE_URL}/tasks/")
    print(f"Status API: {response.status_code}")
    if response.status_code == 401:
        print("✅ API funcionando - requer autenticação")
    else:
        print(f"Resposta: {response.text[:200]}")
except Exception as e:
    print(f"❌ Erro na API: {e}") 