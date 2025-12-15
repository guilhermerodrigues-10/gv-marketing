# 🚀 Quick Start - Deploy Automático

Deploy automático no Portainer em **5 passos**!

## 📋 Checklist Rápido

### 1️⃣ GitHub Secrets (2 min)

Vá em: `Settings → Secrets and variables → Actions`

Adicione:
- `DOCKER_USERNAME` → seu username do Docker Hub
- `DOCKER_PASSWORD` → seu token do Docker Hub ([criar aqui](https://hub.docker.com/settings/security))

### 2️⃣ Portainer Stack (3 min)

No Portainer (`http://seu-ip:9000`):

1. **Stacks → Add stack**
2. Nome: `gv-marketing`
3. **Git Repository**:
   - URL: `https://github.com/guilhermerodrigues-10/gv-marketing`
   - Reference: `refs/heads/main`
   - Compose path: `portainer-stack.yml`
   - ✅ Automatic updates (5 min)

### 3️⃣ Variáveis de Ambiente

Na Stack, aba **Environment variables**:

```env
DOCKER_USERNAME=seu-usuario-docker
BACKEND_PORT=3001
FRONTEND_PORT=80
DB_HOST=xxx.supabase.co
DB_USER=postgres
DB_PASSWORD=sua-senha
JWT_SECRET=chave-secreta-jwt
FRONTEND_URL=http://seu-dominio.com
VITE_API_URL=http://seu-dominio.com:3001
ADMIN_EMAIL=admin@email.com
ADMIN_PASSWORD=senha-admin
```

### 4️⃣ Deploy

Clique em **Deploy the stack** ✅

### 5️⃣ Testar

```bash
# Fazer um commit
git add .
git commit -m "test: testing auto-deploy"
git push origin main

# Aguardar 1-2 min
# Ver no GitHub Actions: github.com/guilhermerodrigues-10/gv-marketing/actions

# Aguardar até 5 min (Watchtower ou Git pull do Portainer)

# Testar
curl http://seu-ip:3001/health
curl http://seu-ip/health
```

---

## ✅ Como Funciona

```
Você faz PUSH → GitHub Actions → Docker Hub → Watchtower/Portainer → Atualiza containers
     ⏱️ 0s          ⏱️ 1-2 min         ⏱️ 2-3 min         ⏱️ até 5 min
```

**Total: ~5 minutos do push até atualização!**

---

## 🔍 Monitorar

- **GitHub Actions**: Ver build → `github.com/guilhermerodrigues-10/gv-marketing/actions`
- **Docker Hub**: Ver imagens → `hub.docker.com/u/seu-usuario`
- **Portainer**: Ver containers → `Containers`
- **Logs Watchtower**: `docker logs -f gv-marketing-watchtower`

---

## 📚 Documentação Completa

Ver: [DEPLOY.md](./DEPLOY.md) para detalhes, troubleshooting e configurações avançadas.

---

## 🆘 Problemas Comuns

### Build falha no GitHub Actions
→ Verificar secrets configurados corretamente

### Containers não atualizam
→ Ver logs: `docker logs gv-marketing-watchtower`
→ Verificar imagens no Docker Hub

### Erro de conexão database
→ Verificar variáveis `DB_*` no Portainer

---

**Pronto! Todo commit na `main` = deploy automático! 🎉**
