# Script para inicializar certificados Let's Encrypt (PowerShell)

$DOMAIN = "tasks.gvmarketing.us"
$EMAIL = "guilherme@gvmarketing.us"

# Criar diretórios se não existirem
New-Item -ItemType Directory -Force -Path "certbot\conf" | Out-Null
New-Item -ItemType Directory -Force -Path "certbot\www" | Out-Null

Write-Host "Obtendo certificado Let's Encrypt..."

# Obter certificado (staging para teste)
$certbotCmd = "certbot certonly --webroot -w /var/www/certbot --email $EMAIL --agree-tos --no-eff-email --staging -d $DOMAIN"

docker run --rm --entrypoint /bin/sh `
  -v "$((Get-Location).Path)\certbot\conf:/etc/letsencrypt" `
  -v "$((Get-Location).Path)\certbot\www:/var/www/certbot" `
  certbot/certbot `
  -c "$certbotCmd"

Write-Host "✅ Certificado obtido com sucesso!"
Write-Host "Agora execute: docker-compose up -d"
