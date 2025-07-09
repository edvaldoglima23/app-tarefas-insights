#!/usr/bin/env python
import os
import time
import psycopg2
from psycopg2 import OperationalError

def wake_database():
    host = os.environ.get('PGHOST')
    database = os.environ.get('PGDATABASE')
    user = os.environ.get('PGUSER')
    password = os.environ.get('PGPASSWORD')
    port = os.environ.get('PGPORT', 5432)
    
    print(f"🔄 Attempting to wake database at {host}...")
    
    max_attempts = 5
    wait_time = 15
    
    for attempt in range(1, max_attempts + 1):
        try:
            print(f"Attempt {attempt}/{max_attempts}...")
            
            conn = psycopg2.connect(
                host=host,
                database=database,
                user=user,
                password=password,
                port=port,
                connect_timeout=30
            )
            
            # Executar uma query simples para "acordar" o banco
            cursor = conn.cursor()
            cursor.execute("SELECT 1;")
            result = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            print(f"✅ Database is awake! Response: {result}")
            return True
            
        except OperationalError as e:
            print(f"❌ Attempt {attempt} failed: {str(e)[:100]}...")
            if attempt < max_attempts:
                print(f"⏳ Waiting {wait_time} seconds before retry...")
                time.sleep(wait_time)
            else:
                print("💥 All attempts failed!")
                return False
    
    return False

if __name__ == "__main__":
    success = wake_database()
    exit(0 if success else 1) 