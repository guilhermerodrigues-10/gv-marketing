#!/bin/bash

echo "🚀 Iniciando deploy do GV Marketing..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Parar containers existentes
echo -e "${YELLOW}📦 Parando containers antigos...${NC}"
docker-compose down

# Puxar código atualizado do GitHub
echo -e "${YELLOW}📥 Puxando código atualizado do GitHub...${NC}"
git pull origin main

# Rebuild dos containers
echo -e "${YELLOW}🔨 Fazendo build dos containers...${NC}"
docker-compose build --no-cache

# Iniciar containers
echo -e "${YELLOW}▶️  Iniciando containers...${NC}"
docker-compose up -d

# Verificar status
echo -e "${YELLOW}🔍 Verificando status dos containers...${NC}"
docker-compose ps

# Logs
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo -e "${YELLOW}📋 Para ver os logs em tempo real:${NC}"
echo -e "   docker-compose logs -f"
echo ""
echo -e "${GREEN}🌐 Acesse: http://tasks.gvmarketing.us${NC}"
