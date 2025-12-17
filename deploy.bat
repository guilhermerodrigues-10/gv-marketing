@echo off
REM Script para Build e Deploy no Portainer com Supabase
REM Execute: deploy.bat

echo ================================
echo GV Marketing - Deploy Script
echo ================================
echo.

REM Configuracoes
set DOCKER_USERNAME=gvmarketing
set FRONTEND_IMAGE=%DOCKER_USERNAME%/gv-marketing-frontend:latest
set BACKEND_IMAGE=%DOCKER_USERNAME%/gv-marketing-backend:latest

REM Verificar se Docker esta rodando
docker info >nul 2>&1
if errorlevel 1 (
    echo [X] Docker nao esta rodando. Inicie o Docker e tente novamente.
    pause
    exit /b 1
)

echo [OK] Docker esta rodando
echo.

REM Build Frontend
echo ================================
echo Building Frontend...
echo ================================
docker build -t %FRONTEND_IMAGE% .
if errorlevel 1 (
    echo [X] Falha ao fazer build do frontend
    pause
    exit /b 1
)
echo [OK] Frontend build concluido
echo.

REM Build Backend
echo ================================
echo Building Backend...
echo ================================
cd backend
docker build -t %BACKEND_IMAGE% .
if errorlevel 1 (
    echo [X] Falha ao fazer build do backend
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Backend build concluido
echo.

REM Push Frontend
echo ================================
echo Pushing Frontend to Docker Hub...
echo ================================
docker push %FRONTEND_IMAGE%
if errorlevel 1 (
    echo [X] Falha ao fazer push do frontend
    echo.
    echo Voce fez login no Docker Hub?
    echo Execute: docker login
    pause
    exit /b 1
)
echo [OK] Frontend enviado para Docker Hub
echo.

REM Push Backend
echo ================================
echo Pushing Backend to Docker Hub...
echo ================================
docker push %BACKEND_IMAGE%
if errorlevel 1 (
    echo [X] Falha ao fazer push do backend
    pause
    exit /b 1
)
echo [OK] Backend enviado para Docker Hub
echo.

REM Resumo
echo ================================
echo Deploy Completo!
echo ================================
echo.
echo [OK] Imagens publicadas:
echo    - %FRONTEND_IMAGE%
echo    - %BACKEND_IMAGE%
echo.
echo [i] Proximos passos:
echo    1. O Watchtower ira atualizar automaticamente em ate 60 segundos
echo    2. Ou atualize manualmente no Portainer
echo.
echo [!] Verifique o Portainer em: http://72.61.135.194:9000
echo [!] Aplicacao disponivel em: http://72.61.135.194:8080
echo.
echo Pronto!
echo.
pause
