# VERSION: v1.4.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
# Dockerfile para Backend API + Frontend - Google Cloud Run

FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# ===========================================
# ETAPA 1: Build do Frontend
# ===========================================

# Copiar package.json da raiz (tem script build:frontend)
COPY package*.json ./

# Copiar arquivos do frontend
COPY front/package*.json ./front/
COPY front/ ./front/

# Instalar dependências do frontend e buildar
WORKDIR /app/front
RUN npm install --legacy-peer-deps
RUN NODE_OPTIONS='--max-old-space-size=4096' npm run build

# O build cria arquivos em ../public (relativo ao front/), ou seja, /app/public
# Verificar se os arquivos foram criados
RUN ls -la ../public/ || echo "⚠️ Pasta public não encontrada após build"

# ===========================================
# ETAPA 2: Setup do Backend
# ===========================================

WORKDIR /app

# Copiar arquivos de dependências do backend
COPY backend/package*.json ./

# Instalar dependências do backend
RUN npm install --only=production --legacy-peer-deps || npm install --only=production

# Copiar código da aplicação (backend)
COPY backend/ ./

# O build do frontend criou os arquivos em /app/public
# O servidor serve de ../public (relativo ao backend em /app), ou seja, /app/public
# Então os arquivos já estão no lugar certo

# Expor porta padrão
EXPOSE 8080

# Comando para iniciar a aplicação
CMD ["node", "server.js"]

