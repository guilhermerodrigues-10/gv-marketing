# GV Marketing - Sistema de Gerenciamento

Sistema completo de gerenciamento de projetos e tarefas para agências de marketing.

## 📚 Estrutura do Projeto

```
gv-marketing/
├── backend/                 # API Node.js + Express + PostgreSQL
│   ├── src/
│   │   ├── config/         # Configurações (database)
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # Rotas da API
│   │   └── migrations/     # SQL migrations
│   ├── server.js           # Servidor principal
│   ├── package.json
│   └── README.md
├── src/                    # Frontend React + TypeScript
│   ├── components/
│   ├── pages/
│   ├── contexts/
│   └── lib/
├── public/
├── DEPLOY_VPS.md          # Guia de deploy em VPS
├── DROPBOX_SETUP.md       # Guia do Dropbox
└── README.md              # Este arquivo
```

## ✨ Funcionalidades

### ✅ Gerenciamento de Projetos
- CRUD completo de projetos
- Atribuição de membros
- Orçamento e cliente
- Cores customizadas

### ✅ Quadro Kanban
- Drag & drop de tarefas
- Status personalizados
- Visual feedback ao arrastar
- Filtros por projeto/usuário

### ✅ Tarefas
- Subtarefas
- Tags
- Anexos
- Prioridades
- Prazos com alertas
- Time tracker (cronômetro)

### ✅ Equipe
- 4 níveis de acesso (Admin, Gerente, Membro, Convidado)
- Permissões por role
- Avatar upload ou inicial
- Gerenciamento de usuários

### ✅ Biblioteca de Assets
- Upload de imagens, vídeos, documentos
- Integração com Dropbox
- Organização por projeto
- Busca e filtros
- Preview de mídia

### ✅ Calendário
- Visualização de tarefas por data
- Filtros por projeto
- Indicação de prazos

### ✅ Relatórios
- Gráficos de tarefas por status
- Tarefas por prioridade
- Timeline de atividades
- Estatísticas gerais

### ✅ Autenticação
- Login seguro com JWT
- Hash de senhas (bcrypt)
- Recuperação de senha (interface)
- Troca de senha

### ✅ UI/UX
- Dark mode
- Responsive (mobile, tablet, desktop)
- Notificações em tempo real
- Loading states

## 🚀 Como Rodar Localmente

### Frontend

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

Acesse: `http://localhost:3000`

### Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar .env (veja backend/.env.example)
cp .env.example .env

# Rodar migrations (cria tabelas e dados iniciais)
npm run migrate

# Rodar em desenvolvimento
npm run dev

# Produção
npm start
```

API: `http://localhost:3001`

**📖 Veja [backend/README.md](backend/README.md) para detalhes**

## 🗄️ Banco de Dados

- **PostgreSQL** 14+
- Schema completo com migrations
- Dados de seed incluídos
- 4 usuários de teste (senha: `123456`)

### Tabelas:
- users
- projects
- tasks
- subtasks
- tags
- attachments
- assets
- notifications
- project_members
- task_assignees
- asset_tags

## 🌐 Deploy em Produção (VPS)

O sistema está pronto para deploy em qualquer VPS.

**📖 Guia completo: [DEPLOY_VPS.md](DEPLOY_VPS.md)**

### Requisitos Mínimos:
- VPS com 1GB RAM
- Ubuntu 20.04+
- Node.js 18+
- PostgreSQL 14+
- Nginx

### Provedores Recomendados:
- DigitalOcean ($6/mês)
- Vultr ($6/mês)
- AWS Lightsail ($5/mês)

## 📦 Integrações

### Dropbox
- Upload e storage de arquivos
- Links compartilháveis
- Organização automática

**📖 Guia: [DROPBOX_SETUP.md](DROPBOX_SETUP.md)**

## 🔐 Segurança

✅ Autenticação JWT
✅ Senhas com hash bcrypt
✅ CORS configurado
✅ Rate limiting
✅ SQL injection protection (parameterized queries)
✅ XSS protection
✅ HTTPS ready

## 📡 API REST

### Endpoints Principais:

```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me

GET    /api/users
PUT    /api/users/:id
DELETE /api/users/:id

GET    /api/projects
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id

GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id

GET    /api/assets
POST   /api/assets
DELETE /api/assets/:id

GET    /api/notifications
PUT    /api/notifications/:id/read
```

## 👥 Usuários Padrão

Após rodar as migrations:

| Email | Senha | Role |
|-------|-------|------|
| alex@gvmarketing.com | 123456 | Admin |
| sara@gvmarketing.com | 123456 | Gerente |
| joao@gvmarketing.com | 123456 | Membro |
| maria@gvmarketing.com | 123456 | Membro |

## 🛠️ Stack Tecnológico

### Frontend
- **React** 18 + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navegação
- **Lucide React** - Ícones
- **Recharts** - Gráficos

### Backend
- **Node.js** 18+
- **Express** - Framework
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas

### Infraestrutura
- **Nginx** - Reverse proxy
- **PM2** - Process manager
- **Let's Encrypt** - SSL
- **Dropbox API** - Storage

## 📊 Performance

- API response time: < 100ms
- Frontend bundle: ~500KB (gzipped)
- Suporta 50-100 usuários simultâneos (VPS básica)
- Assets otimizados e cacheados

## 🧪 Testar a API

```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@gvmarketing.com","password":"123456"}'

# Listar projetos (com token)
curl http://localhost:3001/api/projects \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 📝 Configuração

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_DROPBOX_ACCESS_TOKEN=seu-token
```

### Backend (.env)
```env
PORT=3001
DB_HOST=localhost
DB_NAME=gv_marketing
DB_USER=postgres
DB_PASSWORD=sua-senha
JWT_SECRET=seu-secret
FRONTEND_URL=http://localhost:3000
```

## 🎯 Roadmap

Funcionalidades futuras:
- [ ] WebSockets (real-time)
- [ ] Sistema de email (NodeMailer)
- [ ] Exportar relatórios (PDF)
- [ ] Integração com Google Calendar
- [ ] Chat interno
- [ ] Versionamento de arquivos
- [ ] Aprovação de clientes
- [ ] Templates de projetos

## 🐛 Troubleshooting

### Frontend não conecta no backend
- Verifique se `VITE_API_URL` está correto no `.env`
- Certifique-se de que o backend está rodando

### Erro de CORS
- Configure `FRONTEND_URL` no backend `.env`
- Reinicie o servidor backend

### Assets não aparecem
- Configure Dropbox token (veja DROPBOX_SETUP.md)
- Verifique permissões do Dropbox App

### Erro de autenticação
- Verifique se `JWT_SECRET` está configurado
- Token pode ter expirado (padrão: 7 dias)

## 📄 Licença

MIT

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique os logs: `pm2 logs gv-marketing-api`
2. Consulte a documentação
3. Abra uma issue no repositório

---

**Desenvolvido para agências de marketing que precisam de um sistema completo, moderno e escalável.** 🚀
