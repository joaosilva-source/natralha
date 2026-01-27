# 🔧 Configuração Completa do Render - Backend VeloHub

<!-- VERSION: v1.0.0 | DATE: 2025-01-23 | AUTHOR: VeloHub Development Team -->

## 📋 Guia Passo a Passo

Este documento contém **TODAS** as informações necessárias para configurar o backend VeloHub no Render.com.

## ⚠️ IMPORTANTE: Apenas Funcionalidades Baileys/WhatsApp

**Este projeto usa APENAS as funcionalidades do Baileys para envio de relatórios via WhatsApp.**

### ✅ Funcionalidades Disponíveis

- ✅ Health Check (`/api/test`)
- ✅ Envio de Relatórios via WhatsApp (`/api/escalacoes/reports/*`)
  - `POST /api/escalacoes/reports/send` - Enviar relatório de texto
  - `POST /api/escalacoes/reports/send-with-image` - Enviar relatório com imagem
  - `GET /api/escalacoes/reports/test` - Testar serviço

**Não requer MongoDB** - O serviço de relatórios funciona completamente sem banco de dados.

---

## 🚀 PASSO 1: Criar Conta e Conectar Repositório

### 1.1 Criar Conta

1. Acesse: **https://render.com**
2. Clique em **Get Started for Free**
3. Faça login com **GitHub** (recomendado)
4. Autorize o acesso ao repositório

### 1.2 Conectar Repositório

1. No dashboard, clique em **New +**
2. Selecione **Web Service**
3. Conecte o repositório: **joaosilva-source/natralha**
4. Escolha a branch: **main**

---

## ⚙️ PASSO 2: Configuração do Serviço

### 2.1 Configurações Básicas

Preencha os campos na interface do Render:

| Campo | Valor |
|-------|-------|
| **Name** | `velohub-backend` |
| **Region** | `Oregon (US West)` ou região mais próxima |
| **Branch** | `main` |
| **Root Directory** | `backend` ⚠️ **CRÍTICO** |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/test` |

### 2.2 Usar render.yaml (Recomendado)

**Opção mais fácil:** Marque a opção **"Use render.yaml"**

O Render detectará automaticamente o arquivo `render.yaml` na raiz do repositório e usará as configurações.

---

## 🔐 PASSO 3: Variáveis de Ambiente

⚠️ **IMPORTANTE:** Configure TODAS as variáveis abaixo no Render (Settings > Environment)

### 3.1 Variáveis Obrigatórias

```env
NODE_ENV=production
PORT=8080
```

**Nota:** O Render define `PORT` automaticamente, mas é bom deixar explícito.

---

### 3.2 Database - MongoDB

⚠️ **NÃO SERÁ USADO** - Este projeto não usa MongoDB.

O serviço de relatórios via WhatsApp funciona completamente sem banco de dados, usando apenas a API Baileys para envio de mensagens.

---

### 3.3 Google OAuth 2.0

```env
GOOGLE_CLIENT_ID=278491073220-eb4ogvn3aifu0ut9mq3rvu5r9r9l3137.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=sua-google-client-secret-aqui
```

**Como obter:**
1. Acesse: https://console.cloud.google.com/apis/credentials
2. Crie ou use credenciais OAuth 2.0 existentes
3. Copie Client ID e Client Secret

---

### 3.4 APIs de Inteligência Artificial

#### OpenAI (Opcional - Fallback)

```env
OPENAI_API_KEY=sk-sua-chave-openai-aqui
```

**Como obter:**
- Acesse: https://platform.openai.com/api-keys
- Crie uma nova API key

#### Google Gemini (Recomendado - IA Primária)

```env
GEMINI_API_KEY=AIzaSy-s;ua-chave-gemini-aqui
```

**Como obter:**
- Acesse: https://makersuite.google.com/app/apikey
- Crie uma nova API key

---

### 3.5 WhatsApp API - Baileys

```env
WHATSAPP_API_URL=https://whatsapp-api-y40p.onrender.com
WHATSAPP_DEFAULT_JID=5511943952784@s.whatsapp.net
```

**Explicação:**
- `WHATSAPP_API_URL`: URL da API Baileys (onde está rodando)
- `WHATSAPP_DEFAULT_JID`: Número padrão para envio de relatórios (11943952784 formatado)

**Formato JID:**
- Individual: `5511943952784@s.whatsapp.net`
- Grupo: `120363400851545835@g.us`

---

### 3.6 Google Sheets API (Opcional - Para Logs)

```env
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"seu-project-id","private_key_id":"sua-key-id","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"seu-service-account@seu-project.iam.gserviceaccount.com","client_id":"seu-client-id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/seu-service-account%40seu-project.iam.gserviceaccount.com"}
CHATBOT_LOG_SHEET_NAME=Log_IA_Usage
CHATBOT_SPREADSHEET_ID=1tnWusrOW-UXHFM8GT3o0Du93QDwv5G3Ylvgebof9wfQ
```

**Como obter:**
1. Google Cloud Console → IAM & Admin → Service Accounts
2. Criar Service Account
3. Baixar JSON de credenciais
4. Converter JSON para string (uma linha, escape de aspas)

**Nota:** `GOOGLE_CREDENTIALS` deve ser uma string JSON completa em uma linha.

---

### 3.7 CORS e Origins

```env
CORS_ORIGIN=https://seu-frontend.vercel.app
```

**Exemplos:**
- Frontend Vercel: `https://velohub-xxxxx.vercel.app`
- Frontend VeloHub: `https://velohub-278491073220.us-east1.run.app`
- Domínio customizado: `https://app.velohub.velotax.com.br`
- Localhost (desenvolvimento): `http://localhost:8080`

**Nota:** O código já aceita automaticamente domínios `.vercel.app` e `.vercel.sh` via regex. Você só precisa configurar `CORS_ORIGIN` se usar domínio customizado.

---

### 3.8 Ponto Mais API (Opcional)

```env
PONTO_MAIS_API_KEY=sua-chave-ponto-mais
PONTO_MAIS_COMPANY_ID=seu-company-id
```

**Apenas se usar integração com Ponto Mais.**

---

### 3.9 Configurações de Cache

```env
CHATBOT_CACHE_TIMEOUT=300000
```

**Valor padrão:** 300000ms (5 minutos)

---

## 📋 RESUMO COMPLETO DE VARIÁVEIS

Copie e cole todas as variáveis abaixo no Render (substitua pelos valores reais):

```env
# ===========================================
# OBRIGATÓRIAS
# ===========================================
NODE_ENV=production
PORT=8080

# ===========================================
# DATABASE
# ===========================================
# MongoDB NÃO será usado - NÃO configurar MONGO_ENV
# Deixar esta seção vazia ou comentada

# ===========================================
# GOOGLE OAUTH
# ===========================================
GOOGLE_CLIENT_ID=278491073220-eb4ogvn3aifu0ut9mq3rvu5r9r9l3137.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=sua-google-client-secret-aqui

# ===========================================
# APIS DE IA
# ===========================================
OPENAI_API_KEY=sk-sua-chave-openai-aqui
GEMINI_API_KEY=AIzaSy-sua-chave-gemini-aqui

# ===========================================
# WHATSAPP
# ===========================================
WHATSAPP_API_URL=https://whatsapp-api-y40p.onrender.com
WHATSAPP_DEFAULT_JID=5511943952784@s.whatsapp.net

# ===========================================
# GOOGLE SHEETS (OPCIONAL)
# ===========================================
GOOGLE_CREDENTIALS={"type":"service_account",...}
CHATBOT_LOG_SHEET_NAME=Log_IA_Usage
CHATBOT_SPREADSHEET_ID=1tnWusrOW-UXHFM8GT3o0Du93QDwv5G3Ylvgebof9wfQ

# ===========================================
# CORS
# ===========================================
CORS_ORIGIN=https://seu-frontend.com

# ===========================================
# PONTO MAIS (OPCIONAL)
# ===========================================
PONTO_MAIS_API_KEY=sua-chave-ponto-mais
PONTO_MAIS_COMPANY_ID=seu-company-id

# ===========================================
# CACHE
# ===========================================
CHATBOT_CACHE_TIMEOUT=300000
```

---

## ✅ PASSO 4: Verificar Configuração

### 4.1 Checklist Antes do Deploy

- [ ] Repositório conectado: `joaosilva-source/natralha`
- [ ] Branch: `main`
- [ ] Root Directory: `backend` ⚠️
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Health Check: `/api/test`
- [ ] Todas as variáveis de ambiente configuradas
- [ ] `MONGO_ENV` NÃO configurado (MongoDB não será usado)
- [ ] `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` configurados
- [ ] `WHATSAPP_API_URL` apontando para API Baileys ativa

---

## 🚀 PASSO 5: Deploy

### 5.1 Iniciar Deploy

1. Clique em **Create Web Service**
2. O Render começará o build automaticamente
3. **Aguarde 5-10 minutos** para o build completar

### 5.2 Monitorar Build

- Acesse a aba **Logs** para ver o progresso
- Verifique se há erros
- Confirme que `npm install` executou com sucesso
- Verifique se o servidor iniciou: `✅ Servidor backend rodando na porta`

---

## ✅ PASSO 6: Verificar Deploy

### 6.1 Obter URL

Após o deploy, você receberá uma URL como:
```
https://velohub-backend.onrender.com
```

### 6.2 Testar Endpoints

#### Health Check
```bash
curl https://velohub-backend.onrender.com/api/test
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Servidor funcionando!"
}
```

#### Teste de Relatórios
```bash
curl https://velohub-backend.onrender.com/api/escalacoes/reports/test
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Serviço de relatórios está funcionando",
  "timestamp": "2025-01-23T...",
  "config": {
    "defaultJid": "11943952784@s.whatsapp.net",
    "whatsappApiUrl": "Configurado"
  }
}
```

---

## 🔄 PASSO 7: Configurar Auto-Deploy

### 7.1 Ativar Auto-Deploy

1. Vá em **Settings** do serviço
2. Em **Auto-Deploy**, certifique-se de que está **ativado**
3. Escolha a branch: `main`

**Resultado:** Toda vez que você fizer push no GitHub, o Render fará deploy automaticamente.

---

## 🔐 PASSO 8: Configurar Domínio Customizado (Opcional)

### 8.1 Adicionar Domínio

1. Vá em **Settings** > **Custom Domains**
2. Clique em **Add Custom Domain**
3. Digite seu domínio (ex: `api.velohub.com`)
4. Siga as instruções de DNS

### 8.2 Configurar DNS

No seu provedor DNS, adicione:

```
Tipo: CNAME
Nome: api (ou subdomínio desejado)
Valor: velohub-backend.onrender.com
TTL: 3600 (ou padrão)
```

---

## ⚙️ PASSO 9: Configurações Avançadas

### 9.1 Plano de Serviço

**Free Tier:**
- ✅ Grátis
- ⚠️ Sleep após 15 min de inatividade
- ⚠️ Primeira requisição após sleep pode levar 30-60s

**Starter Plan ($7/mês):**
- ✅ Sem sleep
- ✅ Mais recursos
- ✅ Melhor performance
- ✅ Recomendado para produção

**Como alterar:**
1. Settings > Plan
2. Escolha o plano desejado

### 9.2 Health Checks

Configure em **Settings** > **Health Check**:

- **Path:** `/api/test`
- **Interval:** 30 segundos
- **Timeout:** 10 segundos

### 9.3 Escalabilidade

No **Settings** > **Scaling**:

- **Instance Count:** 1 (padrão)
- **Auto-Scaling:** Desativado (padrão)

Para produção, considere aumentar conforme necessário.

---

## 🐛 Troubleshooting

### Problema: Build Falha

**Sintomas:**
- Erro no log: `npm install` falhou
- Dependências não encontradas

**Solução:**
1. Verifique os logs de build
2. Confirme que `backend/package.json` existe
3. Verifique se todas as dependências estão listadas
4. Tente fazer `npm install` localmente para testar

### Problema: Serviço Não Inicia

**Sintomas:**
- Build OK, mas serviço não inicia
- Erro: "Cannot find module"

**Solução:**
1. Verifique os logs de runtime
2. Confirme que `Root Directory` está como `backend`
3. Verifique se `Start Command` está correto: `npm start`
4. Confirme que `backend/package.json` tem script `start`

### Problema: WhatsApp Desconectado

**Sintomas:**
- Erro ao enviar relatórios: "WhatsApp desconectado" ou "Erro ao enviar mensagem"

**Solução:**
1. Verifique se `WHATSAPP_API_URL` está correto e acessível
2. Confirme que a API Baileys está rodando e conectada ao WhatsApp
3. Teste a API diretamente: `curl https://sua-api-baileys.com/ping` ou `/status`
4. Verifique se o WhatsApp está conectado na API Baileys (QR code escaneado)
5. Confirme que `WHATSAPP_DEFAULT_JID` está no formato correto: `5511943952784@s.whatsapp.net`


### Problema: Timeout nas Requisições

**Sintomas:**
- Requisições demoram muito ou dão timeout

**Solução:**
1. Free tier tem timeout de 30 segundos
2. Considere upgrade para Starter plan
3. Otimize rotas lentas
4. Use cache quando possível

### Problema: Sleep Mode (Free Tier)

**Sintomas:**
- Primeira requisição após inatividade demora 30-60s

**Solução:**
- Isso é normal no Free tier
- Upgrade para Starter plan remove sleep
- Ou configure um ping automático para manter ativo

---

## 📊 Monitoramento

### Logs em Tempo Real

1. Acesse **Logs** no dashboard do Render
2. Veja logs em tempo real
3. Filtre por nível: Info, Warning, Error
4. Use busca para encontrar erros específicos

### Métricas

No dashboard, veja:

- **CPU Usage:** Uso de CPU
- **Memory Usage:** Uso de memória
- **Request Count:** Número de requisições
- **Response Time:** Tempo médio de resposta

### Alertas

Configure alertas em **Settings** > **Alerts**:

- CPU acima de 80%
- Memória acima de 80%
- Erros HTTP 5xx

---

## 🔄 Configurar CORS para Vercel

### Opção 1: Automático (Recomendado)

O código já está configurado para aceitar automaticamente domínios do Vercel:
- `*.vercel.app` - Deployments de produção
- `*.vercel.sh` - Preview deployments

**Não é necessário fazer nada!** O frontend no Vercel funcionará automaticamente.

### Opção 2: Domínio Customizado

Se usar domínio customizado no Vercel, adicione no Render:

```env
CORS_ORIGIN=https://app.velohub.com
```

Ou atualize o código `backend/server.js` para incluir seu domínio específico.

### Verificar CORS

O arquivo `backend/server.js` já contém:
```javascript
/\.vercel\.app$/, // Vercel (qualquer subdomínio)
/\.vercel\.sh$/, // Vercel preview deployments
```

Isso significa que qualquer domínio do Vercel será aceito automaticamente!

---

## 📝 Checklist Final

- [ ] Conta Render criada
- [ ] Repositório conectado: `joaosilva-source/natralha`
- [ ] Web Service criado
- [ ] Root Directory: `backend` ✅
- [ ] Build Command: `npm install` ✅
- [ ] Start Command: `npm start` ✅
- [ ] Health Check: `/api/test` ✅
- [ ] Todas as variáveis de ambiente configuradas ✅
- [ ] Build bem-sucedido ✅
- [ ] Serviço iniciado corretamente ✅
- [ ] Health check funcionando ✅
- [ ] Testes de endpoints passando ✅
- [ ] CORS atualizado com URL do Render ✅
- [ ] Auto-deploy configurado ✅
- [ ] Monitoramento ativo ✅

---

## 🔗 Links Úteis

- **Render Dashboard:** https://dashboard.render.com
- **Render Docs:** https://render.com/docs
- **Render Status:** https://status.render.com
- **Repositório:** https://github.com/joaosilva-source/natralha

---

## 💡 Dicas Importantes

1. **Root Directory:** Sempre `backend` (não raiz do projeto)
2. **Variáveis Sensíveis:** Nunca commite no código, sempre use variáveis de ambiente
3. **MongoDB:** NÃO será usado - não configure `MONGO_ENV`
4. **Funcionalidade Principal:** Apenas envio de relatórios via WhatsApp (Baileys)
5. **WHATSAPP_API_URL:** Deve apontar para a API Baileys rodando (ex: Render, Railway, etc.)
6. **WHATSAPP_DEFAULT_JID:** Formato: `5511943952784@s.whatsapp.net` (código país + DDD + número)
7. **Free Tier:** Entra em sleep após 15 min - primeira requisição pode demorar
8. **Logs:** Sempre verifique os logs para diagnosticar problemas
9. **Health Check:** Configure corretamente para o Render saber quando o serviço está saudável

---

**Versão:** v1.0.0  
**Última atualização:** 2025-01-23  
**Autor:** VeloHub Development Team
