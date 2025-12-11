# GV Marketing - Backend API

Backend Node.js + Express + PostgreSQL para o sistema de gerenciamento de marketing.

## 📋 Tecnologias

- **Node.js** 18+
- **Express** 4.x - Framework web
- **PostgreSQL** 14+ - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas

## 🚀 Setup Local

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Banco de Dados

Instale PostgreSQL e crie o banco:

```bash
# Linux/Mac
sudo -u postgres psql
CREATE DATABASE gv_marketing;
\q

# Windows (via psql)
psql -U postgres
CREATE DATABASE gv_marketing;
\q
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o `.env` com suas configurações:

```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=gv_marketing
DB_USER=postgres
DB_PASSWORD=sua-senha-aqui

JWT_SECRET=seu-secret-super-seguro-aqui

FRONTEND_URL=http://localhost:3000
```

### 4. Rodar Migrations

```bash
npm run migrate
```

Isso irá:
- Criar todas as tabelas
- Inserir dados iniciais (seed)
- Criar 4 usuários de teste (senha: `123456`)

### 5. Iniciar Servidor

**Desenvolvimento (com auto-reload):**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

O servidor estará rodando em `http://localhost:3001`

## 📡 Endpoints da API

### Autenticação

```
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
```

### Usuários

```
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

### Projetos

```
GET    /api/projects
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
```

### Tarefas

```
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

### Assets

```
GET    /api/assets
POST   /api/assets
DELETE /api/assets/:id
```

### Notificações

```
GET /api/notifications
PUT /api/notifications/:id/read
```

## 🔐 Autenticação

Todas as rotas (exceto login/register) requerem autenticação via JWT.

**Header:**
```
Authorization: Bearer <token>
```

**Exemplo de Login:**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@gvmarketing.com",
    "password": "123456"
  }'
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Alex Silva",
    "email": "alex@gvmarketing.com",
    "role": "Admin"
  }
}
```

## 👥 Usuários de Teste

Após rodar as migrations, você terá 4 usuários:

| Email | Senha | Role |
|-------|-------|------|
| alex@gvmarketing.com | 123456 | Admin |
| sara@gvmarketing.com | 123456 | Gerente |
| joao@gvmarketing.com | 123456 | Membro |
| maria@gvmarketing.com | 123456 | Membro |

## 🗄️ Schema do Banco de Dados

```
users
├── id (UUID)
├── name
├── email (unique)
├── password_hash
├── role
└── avatar_url

projects
├── id (UUID)
├── name
├── client_name
├── budget
└── color

tasks
├── id (UUID)
├── title
├── description
├── status
├── priority
├── due_date
├── project_id (FK)
├── time_tracked
└── is_tracking

assets
├── id (UUID)
├── name
├── url
├── path
├── type
├── project_id (FK)
└── uploaded_by (FK)
```

## 🐛 Troubleshooting

### Erro: "database does not exist"

```bash
# Crie o banco manualmente
sudo -u postgres psql
CREATE DATABASE gv_marketing;
```

### Erro: "password authentication failed"

Verifique se a senha no `.env` está correta:
```env
DB_PASSWORD=sua-senha-do-postgres
```

### Erro: "connect ECONNREFUSED"

Verifique se o PostgreSQL está rodando:
```bash
# Linux/Mac
sudo service postgresql status

# Windows
# Verifique no Services (services.msc)
```

### Erro: "JWT_SECRET is not defined"

Certifique-se de ter o `.env` configurado:
```bash
cp .env.example .env
# Edite o .env com seus valores
```

## 📝 Logs

O servidor imprime logs úteis:

```
✅ Database connected successfully
🚀 Server running on http://localhost:3001
📊 Environment: development
🔗 API: http://localhost:3001/api
```

## 🧪 Testando a API

Use o Thunder Client (VS Code), Postman, ou curl:

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

## 📚 Próximos Passos

Após configurar o backend:

1. Configure o frontend para usar a API
2. Atualize a URL da API no frontend
3. Teste login e operações CRUD
4. Deploy na VPS (veja DEPLOY.md)
