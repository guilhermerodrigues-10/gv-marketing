# GV Marketing - Deploy Automático com Portainer

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         DESENVOLVEDOR                            │
│                                                                   │
│  git add . && git commit -m "feat: nova feature"                │
│  git push origin main                                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GITHUB REPOSITORY                           │
│                                                                   │
│  ✅ Commit detectado na branch main                             │
│  🚀 Trigger: GitHub Actions Workflow                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GITHUB ACTIONS                              │
│                                                                   │
│  📦 Build Backend  (Node.js + Express)                          │
│  📦 Build Frontend (React + Vite + Nginx)                       │
│  🏷️  Tag: latest + commit hash                                  │
│  ⏱️  Tempo: 1-2 minutos                                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DOCKER HUB                                 │
│                                                                   │
│  📦 usuario/gv-marketing-backend:latest                         │
│  📦 usuario/gv-marketing-frontend:latest                        │
│  💾 Imagens disponíveis publicamente                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VPS + PORTAINER                               │
│                                                                   │
│  ┌──────────────────────────────────────────────────┐           │
│  │  WATCHTOWER (Auto-update)                        │           │
│  │  ├─ Poll: a cada 60s verifica Docker Hub         │           │
│  │  ├─ Detecta: nova imagem :latest                 │           │
│  │  └─ Atualiza: containers automaticamente         │           │
│  └──────────────────────────────────────────────────┘           │
│                           │                                       │
│                           ▼                                       │
│  ┌──────────────────────────────────────────────────┐           │
│  │  CONTAINERS                                       │           │
│  │  ├─ gv-marketing-backend:3001                    │           │
│  │  ├─ gv-marketing-frontend:80                     │           │
│  │  └─ gv-marketing-watchtower                      │           │
│  └──────────────────────────────────────────────────┘           │
│                           │                                       │
│                           ▼                                       │
│  ┌──────────────────────────────────────────────────┐           │
│  │  NGINX (no container frontend)                   │           │
│  │  └─ Servir React SPA                             │           │
│  └──────────────────────────────────────────────────┘           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL)                         │
│                                                                   │
│  🗄️  Database em nuvem (Supabase)                               │
│  ✅ Sem necessidade de container local                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Fluxo Completo (Timeline)

| Tempo | Etapa | O que acontece |
|-------|-------|----------------|
| **0s** | Push | Desenvolvedor faz `git push origin main` |
| **5s** | GitHub | Detecta push e inicia GitHub Actions |
| **1-2min** | Build | GitHub Actions builda e publica imagens no Docker Hub |
| **2-3min** | Publicação | Imagens ficam disponíveis no Docker Hub |
| **3-8min** | Detecção | Watchtower ou Portainer detecta nova imagem |
| **8-10min** | Deploy | Containers são atualizados na VPS |
| **10min** | ✅ Pronto | Aplicação atualizada e funcionando! |

---

## 🎯 Duas Formas de Auto-Deploy

### Opção 1: Watchtower (Recomendado) ⭐

**Vantagens:**
- ✅ Já incluído no `portainer-stack.yml`
- ✅ Totalmente automático
- ✅ Zero configuração extra
- ✅ Monitora todas as imagens marcadas
- ✅ Funciona mesmo se Portainer cair

**Como funciona:**
1. Watchtower verifica Docker Hub a cada 60s
2. Detecta imagem nova com tag `:latest`
3. Faz pull da imagem
4. Para container antigo
5. Inicia container novo
6. Remove imagem antiga

**Desvantagens:**
- ⏱️ Delay de até 60s para detectar

### Opção 2: Portainer Git Auto-Pull

**Vantagens:**
- ✅ Integrado no Portainer
- ✅ Puxa do GitHub diretamente
- ✅ Controle via UI

**Como funciona:**
1. Portainer faz git pull a cada X minutos (configurável)
2. Detecta mudança no `portainer-stack.yml`
3. Recria os containers

**Desvantagens:**
- ⏱️ Delay configurável (mínimo 1 min)
- ⚠️ Depende do Portainer estar rodando

---

## 📁 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| [.github/workflows/deploy.yml](.github/workflows/deploy.yml) | GitHub Actions workflow para CI/CD |
| [portainer-stack.yml](portainer-stack.yml) | Stack do Portainer com Watchtower |
| [.env.portainer.example](.env.portainer.example) | Template de variáveis de ambiente |
| [DEPLOY.md](DEPLOY.md) | Documentação completa e detalhada |
| [QUICKSTART-DEPLOY.md](QUICKSTART-DEPLOY.md) | Guia rápido em 5 passos |

---

## 🚀 Como Começar

### Setup Inicial (uma vez só)

1. **Configurar GitHub Secrets** (2 min)
   ```
   Settings → Secrets → Actions
   - DOCKER_USERNAME
   - DOCKER_PASSWORD
   ```

2. **Criar Stack no Portainer** (3 min)
   ```
   Stacks → Add stack → Git Repository
   - Repo: https://github.com/guilhermerodrigues-10/gv-marketing
   - File: portainer-stack.yml
   - Auto-update: ✅
   ```

3. **Configurar Variáveis de Ambiente** (2 min)
   - Copiar de `.env.portainer.example`
   - Colar na Stack do Portainer

4. **Deploy!** (1 clique)
   - Clicar em "Deploy the stack"

### Uso Diário (automático!)

```bash
# Desenvolver normalmente
git add .
git commit -m "feat: nova feature"
git push origin main

# Aguardar ~5-10 min
# ✅ Deploy automático concluído!
```

---

## 🔍 Verificação

### Health Checks

```bash
# Backend
curl http://seu-ip-vps:3001/health

# Frontend
curl http://seu-ip-vps/health

# Status containers
docker ps --filter name=gv-marketing
```

### Logs em Tempo Real

```bash
# Backend
docker logs -f gv-marketing-backend

# Frontend
docker logs -f gv-marketing-frontend

# Watchtower (auto-deploy)
docker logs -f gv-marketing-watchtower
```

---

## 🛠️ Manutenção

### Atualizar Manualmente (forçar)

```bash
# Fazer pull das imagens mais recentes
docker pull seu-usuario/gv-marketing-backend:latest
docker pull seu-usuario/gv-marketing-frontend:latest

# Recriar containers no Portainer UI
# Ou via CLI:
docker-compose -f portainer-stack.yml up -d --force-recreate
```

### Rollback para Versão Anterior

**Opção 1: Git Revert**
```bash
git revert HEAD
git push origin main
# Aguardar deploy automático
```

**Opção 2: Tag Específica**
```yaml
# Editar portainer-stack.yml
image: ${DOCKER_USERNAME}/gv-marketing-backend:hash-commit-anterior
```

---

## 📊 Monitoramento

### GitHub Actions

Ver builds: `https://github.com/guilhermerodrigues-10/gv-marketing/actions`

### Docker Hub

Ver imagens: `https://hub.docker.com/u/seu-usuario`

### Portainer

Ver containers: `http://seu-ip-vps:9000`

### Watchtower Logs

```bash
docker logs -f gv-marketing-watchtower

# Output esperado:
# time="..." level=info msg="Checking for new images"
# time="..." level=info msg="Found new image for gv-marketing-backend"
# time="..." level=info msg="Stopping container gv-marketing-backend"
# time="..." level=info msg="Starting container gv-marketing-backend"
```

---

## 🔐 Segurança

### Checklist

- ✅ Secrets no GitHub (nunca no código)
- ✅ Variáveis de ambiente no Portainer
- ✅ JWT secret forte e único
- ✅ Firewall na VPS
- ✅ SSL/HTTPS (recomendado para produção)
- ✅ Senhas fortes para admin

### Firewall VPS

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3001  # Backend (ou usar reverse proxy)
sudo ufw enable
```

---

## 💰 Custos

| Serviço | Custo | Plano |
|---------|-------|-------|
| GitHub Actions | Grátis | 2000 min/mês |
| Docker Hub | Grátis | Imagens públicas |
| Portainer | Grátis | Community Edition |
| Supabase | Grátis | Free tier |
| **VPS** | **$5-10/mês** | DigitalOcean, Hetzner |
| Domínio | ~$10/ano | Opcional |

**Total: ~$5-10/mês apenas pela VPS**

---

## 🆘 Suporte

### Documentação

- **Quick Start**: [QUICKSTART-DEPLOY.md](QUICKSTART-DEPLOY.md)
- **Guia Completo**: [DEPLOY.md](DEPLOY.md)
- **Portainer Docs**: https://docs.portainer.io
- **GitHub Actions**: https://docs.github.com/actions

### Issues

Problemas? Abra uma issue: https://github.com/guilhermerodrigues-10/gv-marketing/issues

---

## ✅ Próximos Passos

1. ✅ Configurar secrets no GitHub
2. ✅ Criar stack no Portainer
3. ✅ Fazer primeiro deploy
4. 🔄 Testar com commit de teste
5. 📊 Configurar monitoramento (opcional)
6. 🔒 Adicionar SSL (recomendado)
7. 🌐 Configurar domínio próprio (opcional)

---

**Deploy automático configurado! Cada push = deploy automático em ~5-10 min! 🚀🎉**
