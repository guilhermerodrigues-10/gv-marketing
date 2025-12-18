@echo off
echo ========================================
echo   Deploy GV Marketing - tasks.gvmarketing.us
echo ========================================
echo.

echo [1/5] Parando containers antigos...
docker-compose down

echo.
echo [2/5] Puxando codigo atualizado do GitHub...
git pull origin main

echo.
echo [3/5] Fazendo build dos containers...
docker-compose build --no-cache

echo.
echo [4/5] Iniciando containers...
docker-compose up -d

echo.
echo [5/5] Verificando status...
docker-compose ps

echo.
echo ========================================
echo   Deploy concluido com sucesso!
echo ========================================
echo.
echo Acesse: http://tasks.gvmarketing.us
echo.
echo Para ver os logs:
echo   docker-compose logs -f
echo.
pause
