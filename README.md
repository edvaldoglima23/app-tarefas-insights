# 📋 App de Tarefas com Insights

> **Aplicação Full Stack para gerenciamento inteligente de tarefas com frases motivacionais e análise de produtividade**

![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=flat-square&logo=next.js)
![Django](https://img.shields.io/badge/Django-5.2.4-green?style=flat-square&logo=django)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?style=flat-square&logo=docker)

## 🚀 **Visão Geral**

Sistema moderno de gerenciamento de tarefas que combina **produtividade** com **motivação**, oferecendo insights detalhados sobre hábitos de trabalho e frases inspiracionais para manter o foco.

### ✨ **Principais Funcionalidades**

- 📝 **CRUD Completo de Tarefas** - Criar, editar, visualizar e excluir tarefas
- 📊 **Dashboard com Estatísticas** - Métricas de produtividade e análise temporal  
- 💡 **Frases Motivacionais** - Inspiração diária com API externa (Quotable)
- 🔍 **Sistema de Filtros** - Busca avançada por título, descrição e status
- 🌙 **Modo Escuro/Claro** - Interface adaptável com preferências do usuário
- 📈 **Export para CSV** - Relatórios detalhados para análise externa
- 🔐 **Autenticação JWT** - Sistema seguro de login e proteção de rotas
- 📱 **Design Responsivo** - Experiência otimizada para mobile e desktop

---

## 🛠️ **Stack Tecnológica**

### **Frontend**
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática para maior robustez
- **Tailwind CSS** - Estilização moderna e responsiva
- **Zustand** - Gerenciamento de estado global
- **Axios** - Cliente HTTP para comunicação com API

### **Backend**
- **Django 5.2.4** - Framework web robusto e escalável
- **Django REST Framework** - API RESTful profissional
- **JWT Authentication** - Autenticação segura baseada em tokens
- **PostgreSQL** - Banco de dados relacional confiável

### **DevOps & Ferramentas**
- **Docker Compose** - Containerização para desenvolvimento
- **Jest** - Testes automatizados no frontend
- **ESLint** - Qualidade de código JavaScript/TypeScript
- **Git** - Controle de versão

---

## 🏗️ **Arquitetura do Sistema**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   FRONTEND      │────│   BACKEND       │────│   DATABASE      │
│   (Next.js)     │    │   (Django)      │    │   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • React Pages   │    │ • REST API      │    │ • User Data     │
│ • Zustand Store │    │ • JWT Auth      │    │ • Tasks         │
│ • TypeScript    │    │ • ViewSets      │    │ • Statistics    │
│ • Tailwind CSS  │    │ • Serializers   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🚀 **Como Executar**

### **Pré-requisitos**
- [Docker](https://www.docker.com/get-started) e Docker Compose
- [Git](https://git-scm.com/) para clonar o repositório

### **1. Clonar o Repositório**
```bash
git clone <seu-repositorio>
cd app-tarefas-insights
```

### **2. Executar com Docker (Recomendado)**
```bash
# Subir todos os serviços
docker compose up

# Ou em background
docker compose up -d
```

### **3. Configurar o Banco de Dados (Primeira Execução)**
```bash
# Executar migrações
docker compose exec web python manage.py migrate

# Criar superusuário (opcional)
docker compose exec web python manage.py createsuperuser
```

### **4. Acessar a Aplicação**
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Backend**: [http://localhost:8000](http://localhost:8000)
- **Admin Django**: [http://localhost:8000/admin](http://localhost:8000/admin)

---

## 🧪 **Executar Testes**

### **Frontend (Jest + Testing Library)**
```bash
cd frontend
npm test                    # Executar todos os testes
npm run test:watch         # Modo watch para desenvolvimento
```

### **Backend (Django Test Suite)**
```bash
docker compose exec web python manage.py test
# ou
python manage.py test      # Se executando localmente
```

---

## 📱 **Funcionalidades Detalhadas**

### **🏠 Dashboard**
- Estatísticas em tempo real (total, concluídas, pendentes)
- Taxa de conclusão com visualização percentual
- Métricas temporais (hoje, semana, mês)
- Lista de tarefas recentes
- Banner motivacional com refresh manual

### **📋 Gerenciamento de Tarefas**
- **Criar**: Formulário intuitivo com título e descrição
- **Editar**: Modificação inline com scroll automático
- **Status**: Toggle rápido entre pendente/concluída
- **Excluir**: Confirmação de segurança
- **Filtros**: Busca textual e filtro por status

### **🔐 Autenticação**
- Login seguro com JWT tokens
- Refresh automático de tokens
- Proteção de rotas no frontend
- Logout com limpeza de estado

### **🎨 Interface**
- Design moderno com Tailwind CSS
- Modo escuro/claro automático
- Feedback visual para todas as ações
- Loading states profissionais
- Tratamento elegante de erros

---

## 🌐 **Endpoints da API**

### **Autenticação**
```
POST /api/token/           # Login (obter token)
POST /api/token/refresh/   # Refresh token
```

### **Tarefas**
```
GET    /api/tasks/              # Listar tarefas
POST   /api/tasks/              # Criar tarefa
GET    /api/tasks/{id}/         # Detalhar tarefa
PUT    /api/tasks/{id}/         # Atualizar tarefa
PATCH  /api/tasks/{id}/         # Atualização parcial
DELETE /api/tasks/{id}/         # Excluir tarefa
```

### **Funcionalidades Especiais**
```
GET /api/tasks/statistics/      # Estatísticas do usuário
GET /api/tasks/search/          # Busca avançada
GET /api/tasks/motivacional/    # Frase motivacional
GET /api/tasks/export_csv/      # Exportar CSV
```

---

## 🔧 **Configuração para Desenvolvimento**

### **Variáveis de Ambiente**

**Backend (Django)**
```env
DEBUG=True
SECRET_KEY=sua-chave-secreta
DJANGO_DB_HOST=localhost
DJANGO_DB_NAME=tarefas
DJANGO_DB_USER=user
DJANGO_DB_PASSWORD=senha123
```

**Frontend (Next.js)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### **Desenvolvimento Local (Sem Docker)**

**Backend:**
```bash
# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt

# Executar servidor
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📊 **Qualidade do Código**

### **Testes Implementados**
- ✅ **Backend**: Testes de API e modelos (TaskAPITestCase, TaskModelTestCase)
- ✅ **Frontend**: Testes de componentes e stores (LoadingSpinner, taskStore)

### **Boas Práticas**
- ✅ TypeScript para tipagem estática
- ✅ ESLint para qualidade de código
- ✅ Tratamento consistente de erros
- ✅ Loading states em todas as operações
- ✅ Validação de dados no frontend e backend
- ✅ Código limpo sem console.logs ou prints de debug

---

## 🚀 **Deploy em Produção**

### **Frontend (Vercel)**
1. Conectar repositório no [Vercel](https://vercel.com)
2. Configurar pasta raiz: `frontend`
3. Adicionar variável: `NEXT_PUBLIC_API_URL`

### **Backend (Railway)**
1. Conectar repositório no [Railway](https://railway.app)
2. Adicionar PostgreSQL database
3. Configurar variáveis de ambiente de produção

---

## 🤝 **Contribuição**

Este projeto segue padrões profissionais de desenvolvimento:

1. **Fork** o repositório
2. **Crie** uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. **Abra** um Pull Request

---

## 📄 **Licença**

Este projeto é desenvolvido para fins educacionais e demonstração de habilidades técnicas.

---

## 👨‍💻 **Autor**

**Desenvolvedor Full Stack**
- Especialista em Django REST Framework + Next.js
- Foco em UX/UI e arquitetura escalável
- Apaixonado por código limpo e boas práticas

---

## 🎯 **Próximas Funcionalidades**

- [ ] **Real-time updates** com WebSockets
- [ ] **Notificações push** para lembretes
- [ ] **Integração com Google Calendar**
- [ ] **Análise de produtividade com gráficos**
- [ ] **Sistema de tags** para categorização
- [ ] **API de compartilhamento** entre usuários

---

*Desenvolvido com ❤️ usando as melhores práticas de desenvolvimento Full Stack* 