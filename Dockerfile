# Dockerfile para Teste de Isolamento - Secret Manager
# VERSION: v1.0.0 | DATE: 2025-01-30 | AUTHOR: Lucas Gravina - VeloHub Development Team
# Teste para verificar se a Conta de Serviço consegue acessar secrets

FROM node:18-alpine
WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm install

# Copiar arquivo de teste
COPY test-secret.js .

# Comando para executar o teste
CMD ["node", "test-secret.js"]