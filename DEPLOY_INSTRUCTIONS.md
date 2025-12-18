# 🚀 Deploy Instructions

## Status
- ✅ Código commitado e enviado para GitHub
- ⏳ GitHub Actions está fazendo build das novas imagens
- ⏳ Aguardando conclusão do build (~5-10 minutos)

## Alterações Aplicadas

1. **Traefik Priority Fix**: Aumentada prioridade do backend de 2 para 10
2. **Senha do usuário atualizada** no banco de dados para `guilherme@gvmarketing.us`

## Passos para Deploy

### 1. Aguardar Build do GitHub Actions

Acesse: https://github.com/guilhermerodrigues-10/gv-marketing/actions

Aguarde o workflow "Build and Push Docker Images" completar (ícone verde ✓)

### 2. Atualizar Stack no Servidor

Conecte-se ao servidor e execute:

```bash
# Baixar o novo docker-compose.traefik.yml do repositório
curl -o docker-compose.traefik.yml https://raw.githubusercontent.com/guilhermerodrigues-10/gv-marketing/main/docker-compose.traefik.yml

# Atualizar o stack (vai puxar as novas imagens automaticamente)
docker stack deploy -c docker-compose.traefik.yml gv-marketing

# Verificar se os serviços estão atualizando
docker service ls

# Acompanhar os logs do backend
docker service logs -f gv-marketing_backend

# Acompanhar os logs do frontend
docker service logs -f gv-marketing_frontend
```

### 3. Verificar Deploy

Após alguns minutos (tempo para puxar as novas imagens e reiniciar):

```bash
# Verificar status dos serviços
docker service ps gv-marketing_backend
docker service ps gv-marketing_frontend
```

Ambos devem estar com "Running" e "Current".

### 4. Testar Login

Acesse: https://tasks.gvmarketing.us

Credenciais:
- **Email**: `guilherme@gvmarketing.us`
- **Senha**: `GVMarketing2024!@Secure`

## Troubleshooting

### Se o erro 405 persistir:

```bash
# Verificar as labels do Traefik no backend
docker service inspect gv-marketing_backend --format '{{json .Spec.Labels}}' | jq

# Deve mostrar priority=10
```

### Se o serviço não atualizar:

```bash
# Forçar atualização do serviço
docker service update --force gv-marketing_backend
docker service update --force gv-marketing_frontend
```

### Verificar conectividade do backend:

```bash
# Testar dentro do container
docker exec -it $(docker ps -q -f name=gv-marketing_backend) sh -c "curl -X POST http://localhost:3001/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"guilherme@gvmarketing.us\",\"password\":\"GVMarketing2024!@Secure\"}'"
```

## Scripts de Diagnóstico Criados

Foram criados dois scripts úteis no diretório `backend/`:

1. **check-user.js**: Verifica usuários no banco e testa senhas
   ```bash
   node backend/check-user.js <email> <password>
   ```

2. **update-password.js**: Atualiza senha de um usuário
   ```bash
   node backend/update-password.js <email> <new-password>
   ```

## Observações

- O Watchtower pode automaticamente puxar e atualizar as imagens se estiver configurado
- Se usar Watchtower, pode demorar até 5 minutos para detectar as novas imagens
- O Traefik vai rotear automaticamente para as novas instâncias dos containers
