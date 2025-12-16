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

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3001
ENV DB_HOST=aws-0-us-west-2.pooler.supabase.com
ENV DB_PORT=6543
ENV DB_NAME=postgres
ENV DB_USER=postgres.hywyqckkahlxevvtzkfw
ENV DB_PASSWORD=2my8fVBNVpcMD1Mt
ENV JWT_SECRET=9b1af44452364c0ef77cf19d7b0fb495868320c2f7f31bf98ed8a00c5a9dc08b6aef35e6db6ef407daed9025c4b948128dbe685f48d91679c6885ccdb5639bda
ENV JWT_EXPIRES_IN=7d
ENV FRONTEND_URL=http://72.61.135.194
ENV ADMIN_EMAIL=admin@gvmarketing.com
ENV ADMIN_PASSWORD=GVMarketing2024!@Secure

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Iniciar servidor
CMD ["node", "server.js"]
