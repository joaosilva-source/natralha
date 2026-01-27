# 🚀 Instruções de Deploy - Console de Conteúdo VeloHub v3.1.0

## 📋 **Configuração das Variáveis de Ambiente no Vercel**

### **Variáveis Obrigatórias:**
```
MONGODB_URI=mongodb+srv://lucasgravina:nKQu8bSN6iZl8FPo@velohubcentral.od7vwts.mongodb.net/?retryWrites=true&w=majority&appName=VelohubCentral
MONGODB_DB_NAME=console_conteudo
NODE_ENV=production
CORS_ORIGIN=https://front-console.vercel.app
```

### **Variáveis Opcionais:**
```
PORT=3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
JWT_SECRET=your-super-secret-jwt-key-here
API_KEY=your-api-key-here
```

## 🔧 **Como Configurar no Vercel:**

1. **Acesse o Dashboard do Vercel**
2. **Selecione seu projeto** "console-conteudo-backend"
3. **Vá para Settings > Environment Variables**
4. **Adicione cada variável** com os valores acima
5. **Certifique-se** que todas estão marcadas para "Production"

## 📡 **URLs do Projeto:**

### **API Endpoints:**
- **Base URL:** `https://seu-projeto.vercel.app`
- **Health Check:** `https://seu-projeto.vercel.app/api/health`
- **Monitor Skynet:** `https://seu-projeto.vercel.app/monitor`

### **Endpoints da API:**
- **Artigos:** `/api/artigos`
- **Velonews:** `/api/velonews`
- **Bot Perguntas:** `/api/bot-perguntas`
- **IGP:** `/api/igp`

## 🔍 **Monitor Skynet:**

Após o deploy, acesse o Monitor Skynet em:
```
https://seu-projeto.vercel.app/monitor
```

### **Funcionalidades do Monitor:**
- ✅ **Console em tempo real** (painel esquerdo)
- ✅ **Tráfego da API** (painel central)
- ✅ **JSON corrente** (painel direito)
- ✅ **WebSocket** para comunicação instantânea
- ✅ **Status de conexão** visual

## 🧪 **Testando o Deploy:**

### **1. Health Check:**
```bash
curl https://seu-projeto.vercel.app/api/health
```

### **2. Teste de Artigos:**
```bash
# GET
curl https://seu-projeto.vercel.app/api/artigos

# POST
curl -X POST https://seu-projeto.vercel.app/api/artigos \
  -H "Content-Type: application/json" \
  -d '{"title":"Teste","content":"Conteúdo teste","category":"teste"}'
```

### **3. Monitor Skynet:**
- Abra `https://seu-projeto.vercel.app/monitor`
- Faça requisições para a API
- Observe o monitoramento em tempo real

## 🔄 **Atualização do Frontend:**

Após o deploy, atualize o frontend com a nova URL:

```javascript
// src/services/api.js
const API_BASE_URL = 'https://seu-projeto.vercel.app/api';
```

## 📊 **Estrutura do MongoDB:**

O projeto criará automaticamente as seguintes coleções:
- `artigos` - Artigos do portal
- `velonews` - Notícias do ciclismo
- `bot_perguntas` - Perguntas do bot

## 🆘 **Troubleshooting:**

### **Erro de Conexão MongoDB:**
- Verifique se a `MONGODB_URI` está correta
- Confirme se o IP do Vercel está liberado no MongoDB Atlas
- Verifique se o usuário tem permissões

### **Erro CORS:**
- Confirme se `CORS_ORIGIN` está configurado corretamente
- Verifique se o frontend está usando a URL correta

### **Monitor não carrega:**
- Verifique se o WebSocket está funcionando
- Confirme se as variáveis de ambiente estão configuradas
- Verifique os logs do Vercel

## 📝 **Logs do Deploy:**

Para verificar os logs do deploy:
1. Acesse o Dashboard do Vercel
2. Vá para "Functions" 
3. Clique em "View Function Logs"

---

**Versão:** 3.1.0  
**Data:** 2024-12-19  
**Autor:** VeloHub Development Team
