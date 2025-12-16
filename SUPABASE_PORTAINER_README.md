# 🚀 GV Marketing - Deploy com Supabase + Portainer

## ✅ Checklist Rápido

### Antes do Deploy:

- [ ] 1. Executar `supabase-schema.sql` no Supabase SQL Editor
- [ ] 2. (Opcional) Executar `lib/migrate-to-supabase.sql` para dados de teste
- [ ] 3. Build e push das imagens Docker
- [ ] 4. Configurar variáveis no Portainer
- [ ] 5. Deploy da stack

---

## 📁 Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `supabase-schema.sql` | Schema completo do banco (EXECUTE PRIMEIRO!) |
| `lib/migrate-to-supabase.sql` | Dados iniciais de exemplo |
| `lib/supabase.ts` | Cliente Supabase configurado |
| `lib/supabase-helpers.ts` | Funções helper para CRUD |
| `lib/test-supabase.ts` | Teste automático de conexão |
| `.env.portainer` | Variáveis de ambiente para Portainer |
| `portainer-stack.yml` | Configuração do stack Docker |
| `Dockerfile` | Build do frontend |
| `backend/Dockerfile` | Build do backend |

---

## 🎯 Guias Disponíveis

1. **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Configuração do banco de dados
2. **[COMO_TESTAR.md](COMO_TESTAR.md)** - Como testar localmente
3. **[DEPLOY_PORTAINER_SUPABASE.md](DEPLOY_PORTAINER_SUPABASE.md)** - Deploy completo no Portainer
4. **[DEPLOY.md](DEPLOY.md)** - Deploy automático com GitHub Actions

---

## ⚡ Quick Start (Desenvolvimento)

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env (já está configurado!)
# As variáveis do Supabase já estão no .env

# 3. Executar SQL no Supabase
# Acesse: https://supabase.com/dashboard/project/ncbmjkhoplgyfgxeqhmo/editor
# Cole e execute o conteúdo de: supabase-schema.sql

# 4. Iniciar desenvolvimento
npm run dev

# 5. Verificar console do navegador
# Você verá: "🎉 Conexão com Supabase está funcionando perfeitamente!"
```

---

## 🐳 Quick Start (Produção Portainer)

```bash
# 1. Build e push frontend
docker build -t guilhermerodrigues10/gv-marketing-frontend:latest .
docker push guilhermerodrigues10/gv-marketing-frontend:latest

# 2. Build e push backend
cd backend
docker build -t guilhermerodrigues10/gv-marketing-backend:latest .
docker push guilhermerodrigues10/gv-marketing-backend:latest

# 3. No Portainer
# - Criar stack "gv-marketing"
# - Colar conteúdo de portainer-stack.yml
# - Adicionar variáveis de .env.portainer
# - Deploy!
```

---

## 🔑 Credenciais Configuradas

### Supabase (Desenvolvimento e Produção)

- **URL**: `https://ncbmjkhoplgyfgxeqhmo.supabase.co`
- **Anon Key**: Configurado em `.env` e `.env.portainer`
- **Service Role Key**: Configurado em `backend/.env` e `.env.portainer`

### Database (PostgreSQL via Supabase)

- **Host**: `aws-0-us-east-1.pooler.supabase.com`
- **Port**: `6543`
- **Database**: `postgres`
- **User**: `postgres.ncbmjkhoplgyfgxeqhmo`
- **Password**: Configurado nos arquivos `.env`

### Admin (Aplicação)

- **Email**: `admin@gvmarketing.com`
- **Senha**: `GVMarketing2024!@Secure`

---

## 📊 Status da Integração

### ✅ Configurado e Funcionando:

- [x] Cliente Supabase criado (`lib/supabase.ts`)
- [x] Helpers para CRUD prontos (`lib/supabase-helpers.ts`)
- [x] Teste automático de conexão (`lib/test-supabase.ts`)
- [x] Schema SQL completo (`supabase-schema.sql`)
- [x] Dados de exemplo (`lib/migrate-to-supabase.sql`)
- [x] Variáveis de ambiente configuradas
- [x] Dockerfiles atualizados
- [x] Portainer stack configurado

### ⚠️ Próximo Passo (Opcional):

- [ ] Migrar `AppContext.tsx` para usar Supabase ao invés de dados mock
- [ ] Atualmente o sistema usa dados em memória (mock)
- [ ] Para dados persistentes, modificar `contexts/AppContext.tsx`

---

## 🧪 Como Testar

### Desenvolvimento Local:

```bash
npm run dev
```

Abra o console do navegador (F12) e veja:

```
🔍 Testando conexão com Supabase...
✅ Cliente Supabase inicializado
✅ Tabelas encontradas no banco
🎉 Conexão com Supabase está funcionando perfeitamente!
```

### Produção (Portainer):

1. Acesse: `http://72.61.135.194:8080`
2. Abra o console (F12)
3. Mesma mensagem deve aparecer!

---

## 🛠️ Estrutura do Banco

### Tabelas Criadas:

1. **users** - Usuários do sistema
2. **projects** - Projetos
3. **project_members** - Membros dos projetos (many-to-many)
4. **tasks** - Tarefas
5. **task_assignees** - Atribuições de tarefas (many-to-many)
6. **subtasks** - Subtarefas
7. **attachments** - Anexos
8. **notifications** - Notificações
9. **board_columns** - Colunas do Kanban
10. **assets** - Biblioteca de assets

### Funcionalidades:

- ✅ Relacionamentos configurados
- ✅ Índices para performance
- ✅ Row Level Security (RLS) ativo
- ✅ Triggers para `updated_at`
- ✅ Políticas permissivas (ajustar para produção)

---

## 📚 Helpers Disponíveis

```typescript
import {
  userAPI,
  projectAPI,
  taskAPI,
  notificationAPI,
  columnAPI,
  assetAPI
} from './lib/supabase-helpers';

// Exemplos:
const users = await userAPI.getAll();
const projects = await projectAPI.getAll();
const tasks = await taskAPI.getAll();

await taskAPI.create({ ... });
await taskAPI.update(id, { status: 'done' });
await taskAPI.delete(id);
```

---

## 🔒 Segurança

### Desenvolvimento:
- ✅ Credenciais no `.env` (ignorado pelo git)
- ✅ Fallback hardcoded para facilitar setup

### Produção:
- ✅ Variáveis no Portainer (não no código)
- ✅ Service Role Key apenas no backend
- ⚠️ Ajustar políticas RLS para restringir acesso
- ⚠️ Configurar HTTPS/SSL

---

## 📞 Suporte

- **Documentação Supabase**: [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
- **Documentação Deploy**: [DEPLOY_PORTAINER_SUPABASE.md](DEPLOY_PORTAINER_SUPABASE.md)
- **Como Testar**: [COMO_TESTAR.md](COMO_TESTAR.md)

---

## 🎉 Tudo Pronto!

O Supabase está **100% configurado**. Você pode:

1. **Usar dados mock** (atual) - Sistema funciona em memória
2. **Migrar para Supabase** - Modificar `AppContext.tsx` para persistência real
3. **Modo híbrido** - Alguns dados no Supabase, outros em memória

**Escolha conforme sua necessidade!** 🚀
