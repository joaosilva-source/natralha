# 📋 Funcionalidades Disponíveis - Sem MongoDB

<!-- VERSION: v1.0.0 | DATE: 2025-01-23 | AUTHOR: VeloHub Development Team -->

## ✅ Funcionalidades Disponíveis

### APIs que Funcionam Sem MongoDB

#### 1. Health Check
- **Endpoint:** `GET /api/test`
- **Status:** ✅ Funcional
- **Descrição:** Verifica se o servidor está rodando

#### 2. Relatórios via WhatsApp
- **Endpoints:**
  - `POST /api/escalacoes/reports/send` - Enviar relatório
  - `POST /api/escalacoes/reports/send-with-image` - Enviar com imagem
  - `GET /api/escalacoes/reports/test` - Testar serviço
- **Status:** ✅ Funcional
- **Descrição:** Envio de relatórios formatados via WhatsApp

#### 3. Outras APIs
- APIs que não fazem operações de banco de dados

---

## ❌ Funcionalidades Não Disponíveis

### Requerem MongoDB

#### 1. Chatbot
- **Endpoints:** `/api/chatbot/*`
- **Status:** ❌ Não funcional
- **Motivo:** Depende de `Bot_perguntas`, `Artigos`, `Velonews` no MongoDB

#### 2. Módulo de Escalações
- **Endpoints:**
  - `/api/escalacoes/solicitacoes/*` - Criar/buscar solicitações
  - `/api/escalacoes/erros-bugs/*` - Criar/buscar erros
  - `/api/escalacoes/logs/*` - Logs de uso
- **Status:** ❌ Não funcional (parcial)
- **Motivo:** Depende de MongoDB para persistência
- **Exceção:** Envio de relatórios funciona (não salva no banco)

#### 3. Logs e Sessões
- **Endpoints:** Logs de atividade e sessões
- **Status:** ❌ Não funcional
- **Motivo:** Depende de MongoDB

#### 4. Status dos Módulos
- **Endpoints:** `/api/module-status/*`
- **Status:** ❌ Não funcional
- **Motivo:** Depende de MongoDB

#### 5. Feedback do Chatbot
- **Endpoints:** `/api/feedback/*`
- **Status:** ❌ Não funcional
- **Motivo:** Depende de MongoDB

---

## 🔧 Configuração no Render

### Variáveis de Ambiente (Sem MongoDB)

```env
# Obrigatórias
NODE_ENV=production
PORT=8080

# Google OAuth
GOOGLE_CLIENT_ID=278491073220-eb4ogvn3aifu0ut9mq3rvu5r9r9l3137.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=sua-google-client-secret

# APIs de IA
OPENAI_API_KEY=sk-sua-chave-openai
GEMINI_API_KEY=AIzaSy-sua-chave-gemini

# WhatsApp
WHATSAPP_API_URL=https://whatsapp-api-y40p.onrender.com
WHATSAPP_DEFAULT_JID=5511943952784@s.whatsapp.net

# CORS
CORS_ORIGIN=https://seu-frontend.com

# NÃO CONFIGURAR:
# MONGO_ENV= (deixar vazio ou não configurar)
```

---

## 📝 Notas Importantes

1. **Servidor Iniciará:** O backend iniciará normalmente mesmo sem MongoDB
2. **APIs Retornarão Erro:** APIs que dependem do MongoDB retornarão erro 503
3. **Relatórios WhatsApp:** Funcionam perfeitamente sem MongoDB
4. **Health Check:** Sempre funciona, independente do MongoDB

---

## 🔄 Se Precisar Adicionar MongoDB no Futuro

1. Configure `MONGO_ENV` no Render
2. Adicione IP do Render no MongoDB Atlas (Network Access)
3. Reinicie o serviço no Render

---

**Versão:** v1.0.0  
**Última atualização:** 2025-01-23  
**Autor:** VeloHub Development Team
