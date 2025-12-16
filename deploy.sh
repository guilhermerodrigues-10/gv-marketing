#!/bin/bash

# Script para Build e Deploy no Portainer com Supabase
# Execute: bash deploy.sh

echo "🚀 GV Marketing - Deploy Script"
echo "================================"
echo ""

# Configurações
DOCKER_USERNAME="gvmarketing"
FRONTEND_IMAGE="${DOCKER_USERNAME}/gv-marketing-frontend:latest"
BACKEND_IMAGE="${DOCKER_USERNAME}/gv-marketing-backend:latest"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    log_error "Docker não está rodando. Inicie o Docker e tente novamente."
    exit 1
fi

log_info "Docker está rodando"

# Verificar login no Docker Hub
echo ""
echo "Verificando login no Docker Hub..."
if ! docker info | grep -q "Username"; then
    log_warning "Você precisa fazer login no Docker Hub"
    docker login
    if [ $? -ne 0 ]; then
        log_error "Falha no login do Docker Hub"
        exit 1
    fi
fi

log_info "Autenticado no Docker Hub"

# Build Frontend
echo ""
echo "📦 Building Frontend..."
echo "======================="
docker build -t $FRONTEND_IMAGE .
if [ $? -ne 0 ]; then
    log_error "Falha ao fazer build do frontend"
    exit 1
fi
log_info "Frontend build concluído"

# Build Backend
echo ""
echo "📦 Building Backend..."
echo "====================="
cd backend
docker build -t $BACKEND_IMAGE .
if [ $? -ne 0 ]; then
    log_error "Falha ao fazer build do backend"
    exit 1
fi
cd ..
log_info "Backend build concluído"

# Push Frontend
echo ""
echo "⬆️  Pushing Frontend to Docker Hub..."
echo "====================================="
docker push $FRONTEND_IMAGE
if [ $? -ne 0 ]; then
    log_error "Falha ao fazer push do frontend"
    exit 1
fi
log_info "Frontend enviado para Docker Hub"

# Push Backend
echo ""
echo "⬆️  Pushing Backend to Docker Hub..."
echo "===================================="
docker push $BACKEND_IMAGE
if [ $? -ne 0 ]; then
    log_error "Falha ao fazer push do backend"
    exit 1
fi
log_info "Backend enviado para Docker Hub"

# Resumo
echo ""
echo "✅ Deploy Completo!"
echo "==================="
echo ""
log_info "Imagens publicadas:"
echo "   - $FRONTEND_IMAGE"
echo "   - $BACKEND_IMAGE"
echo ""
log_info "Próximos passos:"
echo "   1. O Watchtower irá atualizar automaticamente em até 60 segundos"
echo "   2. Ou atualize manualmente no Portainer"
echo ""
log_warning "Verifique o Portainer em: http://72.61.135.194:9000"
log_warning "Aplicação disponível em: http://72.61.135.194:8080"
echo ""
echo "🎉 Pronto!"
