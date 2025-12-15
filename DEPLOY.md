# Deploy Automático no Portainer com GitHub Actions

Este guia mostra como configurar o deploy automático da aplicação GV Marketing no Portainer usando GitHub Actions.

## Arquitetura

```
GitHub (push) → GitHub Actions → Docker Hub → Portainer → VPS
```

### Fluxo de Deploy

1. **Desenvolvedor faz push** para a branch `main`
2. **GitHub Actions** é acionado automaticamente
3. **Build das imagens** Docker (frontend e backend)
4. **Push para Docker Hub** com as tags `latest` e hash do commit
5. **Webhook notifica Portainer** ou Watchtower atualiza automaticamente
6. **Containers são atualizados** na VPS

---

## Pré-requisitos

### 1. Conta Docker Hub

Crie uma conta gratuita em [hub.docker.com](https://hub.docker.com)

### 2. Portainer Instalado na VPS

Se ainda não tiver:

```bash
# Criar volume para dados do Portainer
docker volume create portainer_data

# Instalar Portainer
docker run -d -p 9000:9000 -p 8000:8000 \
  --name=portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

Acesse: `http://seu-ip-vps:9000`

---

## Configuração Passo a Passo

### 1. Configurar Secrets no GitHub

No seu repositório GitHub, vá em **Settings → Secrets and variables → Actions** e adicione:

| Secret | Valor | Descrição |
|--------|-------|-----------|
| `DOCKER_USERNAME` | seu-usuario | Seu username do Docker Hub |
| `DOCKER_PASSWORD` | sua-senha | Seu password/token do Docker Hub |
| `PORTAINER_WEBHOOK_URL` | (opcional) | URL do webhook do Portainer |

**Como criar token Docker Hub:**
1. Acesse [hub.docker.com/settings/security](https://hub.docker.com/settings/security)
2. Clique em "New Access Token"
3. Dê um nome (ex: "GitHub Actions")
4. Copie o token gerado

### 2. Criar Stack no Portainer

1. **Acesse o Portainer** (`http://seu-ip-vps:9000`)
2. Clique em **Stacks → Add stack**
3. Nome: `gv-marketing`
4. Build method: **Git Repository** (recomendado) ou **Web editor**

#### Opção A: Git Repository (Recomendado)

- **Repository URL**: `https://github.com/guilhermerodrigues-10/gv-marketing`
- **Repository reference**: `refs/heads/main`
- **Compose path**: `portainer-stack.yml`
- **Automatic updates**: ✅ Ativar
- **Fetch interval**: 5 minutes (ou conforme preferir)

#### Opção B: Web Editor

Copie o conteúdo de `portainer-stack.yml` para o editor

### 3. Configurar Variáveis de Ambiente no Portainer

Na aba **Environment variables** da stack, adicione (use `.env.portainer.example` como referência):

```
DOCKER_USERNAME=seu-usuario-docker
BACKEND_PORT=3001
FRONTEND_PORT=80
DB_HOST=seu-projeto.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=sua-senha-supabase
JWT_SECRET=sua-chave-secreta-jwt
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://seu-dominio.com
VITE_API_URL=http://seu-dominio.com:3001
ADMIN_EMAIL=admin@gvmarketing.com
ADMIN_PASSWORD=senha-admin-segura
DROPBOX_ACCESS_TOKEN=seu-token-dropbox
```

### 4. Deploy da Stack

Clique em **Deploy the stack**

---

## Como Funciona o Auto-Deploy

### Método 1: Watchtower (Incluído na Stack) ⭐ Recomendado

O Watchtower já está incluído no `portainer-stack.yml` e monitora automaticamente:

- **Polling**: A cada 60 segundos verifica se há novas imagens no Docker Hub
- **Auto-update**: Quando detecta nova imagem com tag `:latest`, atualiza o container
- **Cleanup**: Remove imagens antigas automaticamente
- **Zero downtime**: Atualiza sem parar o serviço

**Não precisa configurar nada extra!** O Watchtower está pronto para usar.

### Método 2: Portainer Webhook (Opcional)

Se preferir usar webhook ao invés do Watchtower:

1. No Portainer, vá na Stack `gv-marketing`
2. Clique em **Webhooks**
3. Crie um novo webhook
4. Copie a URL gerada
5. Adicione como secret `PORTAINER_WEBHOOK_URL` no GitHub

---

## Testando o Deploy

### 1. Fazer uma Alteração

```bash
# Edite qualquer arquivo
echo "// Test deploy" >> src/App.tsx

# Commit e push
git add .
git commit -m "test: testing auto-deploy"
git push origin main
```

### 2. Acompanhar o Processo

1. **GitHub Actions**: `https://github.com/guilhermerodrigues-10/gv-marketing/actions`
   - Veja o build das imagens em tempo real
   - Aguarde status ✅ verde

2. **Docker Hub**: `https://hub.docker.com/u/seu-usuario`
   - Verifique se as imagens foram enviadas
   - Veja as tags `latest` e hash do commit

3. **Portainer (com Watchtower)**:
   - Aguarde até 60 segundos
   - Vá em **Containers**
   - Veja os containers sendo recriados automaticamente

4. **Portainer (com Webhook)**:
   - O webhook é chamado imediatamente após o push
   - Atualização instantânea

### 3. Verificar Aplicação

```bash
# Backend
curl http://seu-ip-vps:3001/health

# Frontend
curl http://seu-ip-vps/health
```

---

## Monitoramento

### Logs dos Containers

No Portainer:
1. **Containers → gv-marketing-backend/frontend**
2. Clique em **Logs**
3. Veja logs em tempo real

### Logs do Watchtower

```bash
docker logs -f gv-marketing-watchtower
```

### Status dos Containers

```bash
docker ps --filter name=gv-marketing
```

---

## Rollback (Reverter Versão)

### Método 1: Git Revert

```bash
# Reverter último commit
git revert HEAD
git push origin main

# GitHub Actions irá fazer build e deploy da versão anterior
```

### Método 2: Docker Tag Específica

No Portainer:

1. Edite a stack
2. Altere a tag da imagem:
   ```yaml
   image: ${DOCKER_USERNAME}/gv-marketing-backend:hash-do-commit-anterior
   ```
3. Update the stack

### Método 3: Portainer UI

1. **Containers → gv-marketing-backend**
2. **Recreate**
3. Escolha uma imagem anterior

---

## Configuração de Domínio (Opcional)

### Nginx Reverse Proxy

Se quiser usar domínio próprio:

```nginx
# /etc/nginx/sites-available/gvmarketing.com

server {
    listen 80;
    server_name gvmarketing.com www.gvmarketing.com;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL com Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d gvmarketing.com -d www.gvmarketing.com
```

---

## Troubleshooting

### Build Falha no GitHub Actions

```bash
# Verificar logs no GitHub
https://github.com/guilhermerodrigues-10/gv-marketing/actions

# Comum:
# - Erro de sintaxe nos Dockerfiles
# - Secrets não configurados
# - Problemas de build do npm
```

### Containers Não Atualizam

```bash
# Verificar se Watchtower está rodando
docker ps | grep watchtower

# Ver logs do Watchtower
docker logs gv-marketing-watchtower

# Forçar atualização manual
docker pull seu-usuario/gv-marketing-backend:latest
docker pull seu-usuario/gv-marketing-frontend:latest

# Recriar containers no Portainer
```

### Erro de Conexão com Database

```bash
# Verificar variáveis de ambiente
docker exec gv-marketing-backend env | grep DB_

# Testar conexão Supabase
docker exec gv-marketing-backend node -e "
  const { Pool } = require('pg');
  const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });
  pool.query('SELECT NOW()', (err, res) => {
    console.log(err || res.rows);
    process.exit();
  });
"
```

---

## Otimizações

### Cache de Build

O workflow já usa cache do Docker BuildKit para builds mais rápidos:

```yaml
cache-from: type=registry,ref=...
cache-to: type=registry,ref=...
```

### Recursos dos Containers

Para limitar uso de memória/CPU, adicione no `portainer-stack.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Healthchecks

Já configurados nos Dockerfiles e docker-compose. Portainer mostra status de saúde.

---

## Segurança

### Boas Práticas

✅ Usar tokens ao invés de senhas
✅ Secrets no GitHub (nunca no código)
✅ Variáveis de ambiente no Portainer
✅ Atualizar imagens base regularmente
✅ SSL/HTTPS em produção
✅ Firewall na VPS (apenas portas necessárias)

### Firewall VPS

```bash
# Permitir apenas portas necessárias
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 9000  # Portainer (opcional, pode fechar depois)
sudo ufw enable
```

---

## Custo

### Gratuito
- ✅ GitHub Actions: 2000 min/mês (plano free)
- ✅ Docker Hub: Imagens públicas ilimitadas
- ✅ Portainer Community: Grátis
- ✅ Supabase: Free tier generoso

### Pago
- 💰 VPS: $5-10/mês (Digital Ocean, Hetzner, etc)
- 💰 Domínio: ~$10/ano

---

## Comandos Úteis

```bash
# Ver todos os containers da stack
docker ps --filter name=gv-marketing

# Logs em tempo real
docker logs -f gv-marketing-backend
docker logs -f gv-marketing-frontend
docker logs -f gv-marketing-watchtower

# Parar stack
docker-compose -f portainer-stack.yml down

# Iniciar stack
docker-compose -f portainer-stack.yml up -d

# Limpar imagens antigas
docker image prune -a

# Ver uso de recursos
docker stats
```

---

## Próximos Passos

1. ✅ Push para GitHub
2. ✅ Configurar secrets no GitHub
3. ✅ Criar stack no Portainer
4. ✅ Testar primeiro deploy
5. 🔄 Configurar domínio (opcional)
6. 🔒 Ativar SSL (opcional)
7. 📊 Configurar monitoramento (opcional)

---

## Suporte

- **GitHub Issues**: [Reportar problemas](https://github.com/guilhermerodrigues-10/gv-marketing/issues)
- **Portainer Docs**: [docs.portainer.io](https://docs.portainer.io)
- **Docker Docs**: [docs.docker.com](https://docs.docker.com)

---

**Pronto! Agora todo push na branch `main` faz deploy automático! 🚀**
