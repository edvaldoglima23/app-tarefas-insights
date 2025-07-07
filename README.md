# App de Tarefas com Frases Motivacionais

## 📋 Descrição
Aplicação web para gerenciamento de tarefas com frases motivacionais diárias, desenvolvida com Django REST Framework e Next.js.

## 🚀 Tecnologias
- **Backend**: Django REST Framework
- **Frontend**: Next.js (em desenvolvimento)
- **Banco de dados**: PostgreSQL
- **Containerização**: Docker + Docker Compose

## 🏗️ Como rodar localmente

### Pré-requisitos
- Docker
- Docker Compose

### Instalação
1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd app-tarefas-insights
```

2. Suba os containers:
```bash
docker compose up
```

3. Execute as migrações (apenas na primeira vez):
```bash
docker compose exec web python manage.py migrate
```

4. Acesse: http://localhost:8000

## 📝 Status do Projeto
- [x] Setup inicial Django + Docker + PostgreSQL
- [ ] CRUD de tarefas
- [ ] Autenticação JWT
- [ ] Frontend Next.js
- [ ] API de frases motivacionais
- [ ] Deploy em produção

## 🎯 Objetivos
Este projeto faz parte de um teste técnico com foco em:
- Desenvolvimento full-stack
- Boas práticas de DevOps
- Arquitetura moderna
- Testes automatizados 