#!/bin/bash

# Script para inicializar certificados Let's Encrypt

DOMAIN="tasks.gvmarketing.us"
EMAIL="guilherme@gvmarketing.us"

# Criar diretórios se não existirem
mkdir -p certbot/conf
mkdir -p certbot/www

# Obter certificado
docker run --rm --entrypoint "\
  certbot certonly --webroot \
    -w /var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --staging \
    -d $DOMAIN" \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  certbot/certbot

echo "✅ Certificado obtido com sucesso!"
echo "Agora execute: docker-compose up -d"
