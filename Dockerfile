# Dockerfile para Google Cloud Run - VeloHub V3
# VERSION: v1.3.0 | DATE: 2025-01-30 | AUTHOR: Lucas Gravina - VeloHub Development Team
# Multi-stage build para React + Node.js
# Updated: 2025-01-30 - Enhanced debug logs + Build verification

# Stage 1: Build do frontend React
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# Copiar package.json do frontend
COPY package*.json ./
RUN npm ci

# Copiar código do frontend
COPY public/ ./public/
COPY src/ ./src/
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Build do frontend com variáveis de ambiente
ARG REACT_APP_GOOGLE_CLIENT_ID
ARG REACT_APP_AUTHORIZED_DOMAIN
ARG REACT_APP_API_URL
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID
ENV REACT_APP_AUTHORIZED_DOMAIN=$REACT_APP_AUTHORIZED_DOMAIN
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Log das variáveis para debug
RUN echo "=== VARIÁVEIS DE AMBIENTE REACT ===" && \
    echo "REACT_APP_GOOGLE_CLIENT_ID: $REACT_APP_GOOGLE_CLIENT_ID" && \
    echo "REACT_APP_AUTHORIZED_DOMAIN: $REACT_APP_AUTHORIZED_DOMAIN" && \
    echo "REACT_APP_API_URL: $REACT_APP_API_URL" && \
    echo "Tamanho do CLIENT_ID: ${#REACT_APP_GOOGLE_CLIENT_ID}" && \
    echo "CLIENT_ID é vazio? $([ -z "$REACT_APP_GOOGLE_CLIENT_ID" ] && echo 'SIM' || echo 'NÃO')"
RUN npm run build

# Verificar se as variáveis foram substituídas no build
RUN echo "=== VERIFICANDO BUILD DO REACT ===" && \
    find build/static/js -name "*.js" -exec grep -l "REACT_APP_GOOGLE_CLIENT_ID" {} \; && \
    echo "Arquivos JS encontrados:" && \
    ls -la build/static/js/ && \
    echo "Verificando se CLIENT_ID foi substituído:" && \
    grep -r "278491073220" build/static/js/ || echo "CLIENT_ID não encontrado no build"

# Stage 2: Backend + Frontend build
FROM node:18-alpine AS production
WORKDIR /app

# Instalar dependências do backend
COPY backend/package*.json ./
RUN npm install --only=production && npm cache clean --force

# Copiar código do backend
COPY backend/ ./

# Copiar build do frontend
COPY --from=frontend-builder /app/build ./public

# Verificar estrutura de diretórios
RUN echo "=== ESTRUTURA DE DIRETÓRIOS ===" && ls -la && echo "=== CONTEÚDO DO PUBLIC ===" && ls -la public/

# Expor porta (Cloud Run usa PORT dinâmica)
EXPOSE 8080

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=8080

# Comando para iniciar o servidor
CMD ["node", "server.js"]
