# Deploy no Portainer com Supabase

Este guia explica como fazer o deploy da aplicação GV Marketing no Portainer com integração ao Supabase.

## 📋 Pré-requisitos

1. ✅ Conta no Supabase com projeto criado
2. ✅ Servidor com Docker Swarm configurado
3. ✅ Portainer instalado e rodando
4. ✅ Conta no Docker Hub

## 🗄️ Passo 1: Configurar o Banco de Dados Supabase

### 1.1. Executar o Schema SQL

1. Acesse: https://supabase.com/dashboard/project/ncbmjkhoplgyfgxeqhmo/editor
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor e clique em **Run**

### 1.2. (Opcional) Inserir Dados de Teste

1. No mesmo SQL Editor
2. Copie o conteúdo de `lib/migrate-to-supabase.sql`
3. Cole e execute para ter dados iniciais

### 1.3. Verificar as Tabelas

1. Vá em **Table Editor** no menu lateral
2. Confirme que as tabelas foram criadas:
   - users
   - projects
   - tasks
   - notifications
   - board_columns
   - assets
   - etc.

## 🐳 Passo 2: Build e Push das Imagens Docker

### 2.1. Frontend

```bash
# Build da imagem do frontend
docker build -t guilhermerodrigues10/gv-marketing-frontend:latest .

# Push para Docker Hub
docker push guilhermerodrigues10/gv-marketing-frontend:latest
```

### 2.2. Backend

```bash
# Navegar para a pasta backend
cd backend

# Build da imagem do backend
docker build -t guilhermerodrigues10/gv-marketing-backend:latest .

# Push para Docker Hub
docker push guilhermerodrigues10/gv-marketing-backend:latest
```

## 🚀 Passo 3: Deploy no Portainer

### 3.1. Acessar o Portainer

1. Acesse seu Portainer (ex: http://SEU_IP:9000)
2. Vá em **Stacks** no menu lateral

### 3.2. Criar/Atualizar Stack

1. Se é a primeira vez:
   - Clique em **Add Stack**
   - Nome: `gv-marketing`

2. Se já existe o stack:
   - Clique no stack existente
   - Clique em **Editor**

### 3.3. Colar o Conteúdo

1. Cole o conteúdo do arquivo `portainer-stack.yml`
2. Role para baixo até **Environment variables**

### 3.4. Configurar Variáveis de Ambiente

Cole as seguintes variáveis (ou copie de `.env.portainer`):

```env
DOCKER_USERNAME=guilhermerodrigues10
VITE_API_URL=http://72.61.135.194:3001

# Supabase Frontend
VITE_SUPABASE_URL=https://ncbmjkhoplgyfgxeqhmo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jYm1qa2hvcGxneWZneGVxaG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NzMwMzgsImV4cCI6MjA4MTA0OTAzOH0.t6_KI2oF6u7jmFwu8R_Av16vcBe5qgUTYgr9p1u4Ux4

# Supabase Backend
SUPABASE_URL=https://ncbmjkhoplgyfgxeqhmo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jYm1qa2hvcGxneWZneGVxaG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NzMwMzgsImV4cCI6MjA4MTA0OTAzOH0.t6_KI2oF6u7jmFwu8R_Av16vcBe5qgUTYgr9p1u4Ux4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jYm1qa2hvcGxneWZneGVxaG1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ3MzAzOCwiZXhwIjoyMDgxMDQ5MDM4fQ.M7ncPSY5LeJU2JOyKdPZoCUrDXrXUwQ5GSJQMjhY-C4

# Database
DB_HOST=aws-0-us-east-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.ncbmjkhoplgyfgxeqhmo
DB_PASSWORD=7plWYb2gPnYWUban

# Dropbox (opcional)
DROPBOX_ACCESS_TOKEN=
```

### 3.5. Deploy

1. Clique em **Deploy the stack** (ou **Update the stack**)
2. Aguarde o Portainer fazer o pull das imagens e iniciar os containers

## ✅ Passo 4: Verificar o Deploy

### 4.1. Verificar Containers

1. Vá em **Containers** no Portainer
2. Confirme que os 3 containers estão rodando:
   - ✅ `gv-marketing_backend`
   - ✅ `gv-marketing_frontend`
   - ✅ `gv-marketing_watchtower`

### 4.2. Verificar Logs

1. Clique em cada container
2. Vá em **Logs**
3. Verifique se não há erros

### 4.3. Testar a Aplicação

1. Acesse: http://72.61.135.194:8080
2. Abra o DevTools (F12) → Console
3. Verifique o teste automático do Supabase:

```
🔍 Testando conexão com Supabase...
✅ Cliente Supabase inicializado
✅ Tabelas encontradas no banco
🎉 Conexão com Supabase está funcionando perfeitamente!
```

### 4.4. Fazer Login

1. Use as credenciais padrão:
   - Email: `admin@gvmarketing.com`
   - Senha: `GVMarketing2024!@Secure`

## 🔄 Atualizações Automáticas

O Watchtower está configurado para:
- ✅ Verificar novas imagens a cada 60 segundos
- ✅ Atualizar automaticamente os containers
- ✅ Limpar imagens antigas

Para fazer uma nova versão:

```bash
# 1. Fazer alterações no código
# 2. Build e push
docker build -t guilhermerodrigues10/gv-marketing-frontend:latest .
docker push guilhermerodrigues10/gv-marketing-frontend:latest

# 3. Aguardar o Watchtower atualizar (máximo 60 segundos)
```

## 🔧 Troubleshooting

### Problema: Container não inicia

**Solução:**
1. Verifique os logs do container
2. Confirme que as variáveis de ambiente estão corretas
3. Verifique se as imagens foram baixadas corretamente

### Problema: Erro de conexão com Supabase

**Solução:**
1. Verifique se executou o SQL (`supabase-schema.sql`)
2. Confirme as credenciais no `.env.portainer`
3. Teste a conexão diretamente no Supabase SQL Editor

### Problema: Frontend não carrega

**Solução:**
1. Verifique se o backend está rodando
2. Confirme a variável `VITE_API_URL`
3. Verifique os logs do Nginx no container frontend

### Problema: Watchtower não atualiza

**Solução:**
1. Verifique os logs do Watchtower
2. Confirme que a label `com.centurylinklabs.watchtower.enable=true` está nos containers
3. Verifique se o intervalo de polling está configurado

## 📊 Monitoramento

### Health Checks

Ambos os containers têm health checks configurados:

- **Backend**: `http://localhost:3001/health`
- **Frontend**: `http://localhost/health`

### Verificar Status

```bash
# Via Portainer
Containers → Clique no container → Stats

# Via Docker CLI
docker ps
docker stats
```

## 🔐 Segurança

### Boas Práticas

1. ✅ Nunca commite `.env` com credenciais reais
2. ✅ Use secrets do Docker Swarm para produção
3. ✅ Configure HTTPS com certificado SSL
4. ✅ Restrinja as políticas RLS do Supabase
5. ✅ Use firewall para limitar acesso às portas

### Configurar HTTPS (Recomendado)

Use um reverse proxy como Nginx ou Traefik para adicionar SSL:

```yaml
# Exemplo com Traefik
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.frontend.rule=Host(`gvmarketing.com`)"
  - "traefik.http.routers.frontend.tls=true"
  - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
```

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Portainer](https://docs.portainer.io)
- [Docker Swarm](https://docs.docker.com/engine/swarm/)
- [Watchtower](https://containrrr.dev/watchtower/)

## 🆘 Suporte

Se tiver problemas:

1. Verifique os logs dos containers
2. Consulte a documentação do Supabase
3. Verifique o console do navegador para erros de frontend
4. Teste a conexão com o banco de dados

## ✨ Próximos Passos

Após o deploy bem-sucedido:

1. 📝 Configure backup automático do Supabase
2. 🔒 Configure políticas RLS mais restritivas
3. 📈 Configure monitoramento com Prometheus/Grafana
4. 🌐 Configure domínio personalizado com HTTPS
5. 📧 Configure notificações de erro (Sentry, etc)
