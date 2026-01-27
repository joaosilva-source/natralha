# 🧹 Limpeza do Repositório back-console

## 📋 **Comandos para Limpeza:**

### **1. Remover arquivos antigos:**
```bash
# Remover arquivos HTML antigos
rm artigos.html
rm bot-perguntas.html
rm velonews.html
rm index.html

# Remover imagens antigas
rm console.png
rm success.gif

# Remover pastas antigas
rm -rf css/
rm -rf js/
rm -rf public/
rm -rf api/
```

### **2. Criar nova estrutura:**
```bash
# Criar estrutura do novo backend
mkdir -p backend/config
mkdir -p backend/models
mkdir -p backend/routes
mkdir -p backend/middleware
mkdir -p backend/public
```

### **3. Arquivos a manter:**
- ✅ `package.json` (atualizar)
- ✅ `vercel.json` (atualizar)
- ✅ `README.md` (substituir)

## 🚀 **Nova Estrutura:**

```
back-console/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── collections.js
│   ├── middleware/
│   │   └── monitoring.js
│   ├── models/
│   │   ├── Artigos.js
│   │   ├── Velonews.js
│   │   └── BotPerguntas.js
│   ├── public/
│   │   └── monitor.html
│   ├── routes/
│   │   ├── artigos.js
│   │   ├── velonews.js
│   │   ├── botPerguntas.js
│   │   └── igp.js
│   └── server.js
├── package.json
├── vercel.json
├── README.md
├── env.example
└── DEPLOY_INSTRUCTIONS.md
```

## 📝 **Próximos Passos:**

1. **Executar comandos de limpeza**
2. **Copiar arquivos do novo backend**
3. **Atualizar package.json**
4. **Atualizar vercel.json**
5. **Substituir README.md**
6. **Fazer commit e push**

## 🔧 **Configuração Final:**

### **Variáveis de Ambiente:**
```bash
MONGODB_URI=mongodb+srv://lucasgravina:nKQu8bSN6iZl8FPo@velohubcentral.od7vwts.mongodb.net/?retryWrites=true&w=majority&appName=VelohubCentral
MONGODB_DB_NAME=console_conteudo
NODE_ENV=production
CORS_ORIGIN=https://front-console.vercel.app
```

### **URLs após Deploy:**
- **API:** `https://back-console.vercel.app`
- **Monitor Skynet:** `https://back-console.vercel.app/monitor`
- **Health Check:** `https://back-console.vercel.app/api/health`

---

**Status:** 🧹 Pronto para Limpeza  
**Repositório:** [admVeloHub/back-console](https://github.com/admVeloHub/back-console)  
**Versão:** 3.1.0
