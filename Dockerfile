# Dockerfile para Frontend (React + Vite)
FROM node:18-alpine as builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Set environment variables for production build
ARG VITE_API_URL=http://72.61.135.194:3001
ARG VITE_SUPABASE_URL=https://hywyqckkahlxevvtzkfw.supabase.co
ARG VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5d3lxY2trYWhseGV2dnR6a2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDAyMTUsImV4cCI6MjA4MDk3NjIxNX0.Gc8rHZfSIWVNiyUP43eRqCLD6i80CPS7YiiZct0rmHg

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

# Build da aplicação
RUN npm run build

# Estágio de produção com Nginx
FROM nginx:alpine

# Copiar build do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
