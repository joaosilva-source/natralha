# VERSION: v1.3.0 | DATE: 2025-01-27 | AUTHOR: VeloHub Development Team
# Dockerfile para Backend API - Render.com

FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências do backend
COPY backend/package*.json ./

# Instalar dependências
# Usar npm install em vez de npm ci para ser mais tolerante com package-lock.json desatualizado
RUN npm install --only=production --legacy-peer-deps || npm install --only=production

# Copiar código da aplicação (backend)
COPY backend/ ./

# Expor porta padrão
EXPOSE 8080

# Comando para iniciar a aplicação
CMD ["node", "server.js"]

