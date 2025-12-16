# Dockerfile para Backend (Node.js + Express)
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências de produção
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Expor porta 3001
EXPOSE 3001

# Variáveis de ambiente (valores padrão - serão sobrescritos pelo Portainer)
ENV NODE_ENV=production
ENV PORT=3001

# Supabase Configuration
ENV SUPABASE_URL=https://hywyqckkahlxevvtzkfw.supabase.co
ENV SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5d3lxY2trYWhseGV2dnR6a2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDAyMTUsImV4cCI6MjA4MDk3NjIxNX0.Gc8rHZfSIWVNiyUP43eRqCLD6i80CPS7YiiZct0rmHg
ENV SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5d3lxY2trYWhseGV2dnR6a2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQwMDIxNSwiZXhwIjoyMDgwOTc2MjE1fQ.xcDbMgGn8MjOnGfx6l2xtK06l0toFELKw6pXnkwBZu0

# Supabase PostgreSQL
ENV DB_HOST=aws-0-us-west-2.pooler.supabase.com
ENV DB_PORT=6543
ENV DB_NAME=postgres
ENV DB_USER=postgres.hywyqckkahlxevvtzkfw
ENV DB_PASSWORD=1N6sup0mk3x5R0ym

# JWT & Auth
ENV JWT_SECRET=9b1af44452364c0ef77cf19d7b0fb495868320c2f7f31bf98ed8a00c5a9dc08b6aef35e6db6ef407daed9025c4b948128dbe685f48d91679c6885ccdb5639bda
ENV JWT_EXPIRES_IN=7d
ENV FRONTEND_URL=http://72.61.135.194:8080
ENV ADMIN_EMAIL=admin@gvmarketing.com
ENV ADMIN_PASSWORD=GVMarketing2024!@Secure

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Iniciar servidor
CMD ["node", "server.js"]
