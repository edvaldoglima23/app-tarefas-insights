"""
Django settings for core project.
"""

import os
import sys

# Debug das variáveis ANTES de tudo
print("=" * 50)
print("DJANGO SETTINGS - DEBUG INICIAL")
print("=" * 50)

# Verificar todas as variáveis relacionadas ao banco
env_vars = ['DATABASE_URL', 'PGHOST', 'PGDATABASE', 'PGUSER', 'PGPASSWORD', 'PGPORT']
for var in env_vars:
    value = os.environ.get(var, 'NOT_FOUND')
    print(f"{var}: {value}")

print("=" * 50)

from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-eo)x)-)n*hxoz6esfbs6==a68)*3_-5s5vi445!2z*5o9psfmx')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost').split(',')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'tasks',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# Database - Configuração robusta
print("CONFIGURANDO DATABASE...")

DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    print(f"Usando DATABASE_URL: {DATABASE_URL[:50]}...")
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL)
    }
    # Configuração mais flexível para Railway
    DATABASES['default']['CONN_MAX_AGE'] = 60
    DATABASES['default']['OPTIONS'] = {
        'connect_timeout': 30,
    }
else:
    print("DATABASE_URL não encontrada, usando variáveis individuais...")
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('PGDATABASE', 'railway'),
            'USER': os.environ.get('PGUSER', 'postgres'),
            'PASSWORD': os.environ.get('PGPASSWORD', ''),
            'HOST': os.environ.get('PGHOST', 'localhost'),
            'PORT': os.environ.get('PGPORT', '5432'),
            'CONN_MAX_AGE': 60,
            'OPTIONS': {
                'connect_timeout': 30,
            },
        }
    }

print("Configuração final do banco:")
print(f"ENGINE: {DATABASES['default']['ENGINE']}")
print(f"NAME: {DATABASES['default']['NAME']}")
print(f"USER: {DATABASES['default']['USER']}")
print(f"HOST: {DATABASES['default']['HOST']}")
print(f"PORT: {DATABASES['default']['PORT']}")
print("=" * 50)

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# JWT Configuration
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}


if not DEBUG:
    CORS_ALLOWED_ORIGINS = [
        "https://app-tarefas-insights-cj84dicaz-edvaldo-limas-projects.vercel.app",
        "https://app-tarefas-insights.vercel.app",
        "https://app-tarefas-insights-git-main.vercel.app",
        "https://app-tarefas-insights-edvaldoglima23.vercel.app",
        
    ]
    
    CORS_ALLOW_ALL_ORIGINS = False
    CORS_ALLOWED_ORIGIN_REGEXES = [
        r"^https://app-tarefas-insights(-[a-z0-9]+)*-edvaldo-limas-projects\.vercel\.app$",
        r"^https://app-tarefas-insights(-[a-z0-9]+)?\.vercel\.app$",
    ]
else:
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "https://localhost:3000",
    ]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]