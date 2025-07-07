# Checklist de Entrega - App de Tarefas com Frases Motivacionais

## 1. Setup Inicial
- [x] Criar repositório Git e README inicial
- [x] Configurar backend Django + Docker + PostgreSQL
- [x] Subir código para repositório remoto (GitHub)
- [ ] Configurar frontend Next.js
- [ ] Subir deploy inicial (Hello World) no Railway/Heroku (backend) e Vercel (frontend)
- [x] Documentar instruções básicas de setup no README

---

## 2. CRUD de Tarefas + Autenticação
- [x] Criar modelo de Tarefa no Django
- [x] Implementar endpoints CRUD (Create, Read, Update, Delete) para tarefas
- [x] Configurar autenticação JWT no backend
- [ ] Implementar login no frontend
- [ ] Implementar listagem de tarefas no frontend
- [ ] Adicionar pelo menos 1 teste automatizado no backend (ex: criação de tarefa)
- [ ] Documentar endpoints e exemplos de uso no README

---

## 3. Funcionalidades Extras
- [ ] Criar endpoint no backend para frase motivacional diária (Quotable API)
- [ ] Implementar dashboard de estatísticas no backend e frontend
- [ ] Adicionar filtros e busca no backend e frontend
- [ ] Adicionar mais 1 teste backend (ex: filtro) e 1 frontend (ex: renderização de frase)
- [ ] Documentar como usar as novas funcionalidades

---

## 4. Diferenciais
- [ ] Implementar exportação de tarefas para CSV (backend e frontend)
- [ ] Implementar dark mode no frontend
- [ ] Implementar real-time updates (WebSocket ou polling) (opcional)
- [ ] Adicionar mais 1 teste frontend (ex: dark mode)
- [ ] Documentar diferenciais no README

---

## 5. Finalização e Deploy
- [ ] Garantir que o deploy final está funcionando (backend e frontend)
- [ ] Atualizar README com:
  - [ ] Instruções de instalação local
  - [ ] Como rodar os testes
  - [ ] Endpoints/documentação da API
  - [ ] Links de deploy
  - [ ] Prints ou GIFs das principais telas
- [ ] Fazer revisão final do código e documentação

---

---

## 📊 Status Detalhado

### ✅ Implementado e Testado:
- **Backend Django**: Modelo Task com campos (title, description, status, created_at, user)
- **API REST**: Endpoints CRUD completos (/api/tasks/)
- **Autenticação JWT**: Login (/api/token/), refresh token, proteção de endpoints
- **Docker**: PostgreSQL + Django rodando em containers
- **Admin Django**: Interface administrativa funcional
- **Usuários de teste**: admin/admin123 e testuser/senha123

### 🔧 Configurações Técnicas:
- **JWT**: Access token (60min), Refresh token (1 dia), rotação automática
- **Banco**: PostgreSQL com volumes persistentes
- **Segurança**: Todos os endpoints protegidos por autenticação
- **CORS**: Configurado para desenvolvimento

### 🎯 Próximos Passos Prioritários:
1. **Frontend Next.js** (pasta vazia - precisa ser criado)
2. **Testes automatizados** (0 testes implementados)
3. **Deploy** (não configurado)
4. **Funcionalidades extras** (frases motivacionais, dashboard)

---

### Dicas Extras
- Faça commits pequenos e descritivos a cada etapa.
- Tire prints ou grave GIFs das funcionalidades para anexar ao README ou enviar ao recrutador.
- Se não conseguir terminar tudo, explique o que ficou faltando e como faria. 