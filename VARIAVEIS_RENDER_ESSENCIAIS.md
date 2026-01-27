# 🔐 Variáveis de Ambiente para o Render - RESUMO DIRETO

<!-- VERSION: v1.0.0 | DATE: 2025-01-23 | AUTHOR: VeloHub Development Team -->

## ⚡ VARIÁVEIS OBRIGATÓRIAS

Copie e cole estas no Render (Settings > Environment):

```env
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://nathaliavillanova:TgoHptnjdfLOgrN1@velohubcentral.od7vwts.mongodb.net/?appName=VelohubCentral
WHATSAPP_API_URL=https://whatsapp-api-y40p.onrender.com
WHATSAPP_DEFAULT_JID=5511943952784@s.whatsapp.net
```

**Isso é o MÍNIMO para funcionar!**

---

## 📋 VARIÁVEIS COMPLETAS (Se precisar de tudo)

```env
# ===========================================
# OBRIGATÓRIAS
# ===========================================
NODE_ENV=production
PORT=8080

# ===========================================
# MONGODB (OBRIGATÓRIO)
# ===========================================
MONGODB_URI=mongodb+srv://nathaliavillanova:TgoHptnjdfLOgrN1@velohubcentral.od7vwts.mongodb.net/?appName=VelohubCentral

# ===========================================
# WHATSAPP (OBRIGATÓRIO para relatórios)
# ===========================================
WHATSAPP_API_URL=https://whatsapp-api-y40p.onrender.com
WHATSAPP_DEFAULT_JID=5511943952784@s.whatsapp.net

# ===========================================
# GOOGLE OAUTH (Se usar login Google)
# ===========================================
GOOGLE_CLIENT_ID=278491073220-eb4ogvn3aifu0ut9mq3rvu5r9r9l3137.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=sua-google-client-secret-aqui

# ===========================================
# APIS DE IA (Opcional)
# ===========================================
OPENAI_API_KEY=sk-sua-chave-openai-aqui
GEMINI_API_KEY=AIzaSy-sua-chave-gemini-aqui

# ===========================================
# CORS (Opcional - só se usar domínio customizado)
# ===========================================
CORS_ORIGIN=https://seu-dominio-customizado.com
```

---

## ✅ CHECKLIST RÁPIDO

- [ ] `NODE_ENV=production`
- [ ] `PORT=8080`
- [ ] `MONGODB_URI` (URI de conexão do MongoDB)
- [ ] `WHATSAPP_API_URL` (URL da API Baileys)
- [ ] `WHATSAPP_DEFAULT_JID` (número formatado: `5511943952784@s.whatsapp.net`)
- [ ] `GOOGLE_CLIENT_ID` (se usar login Google)
- [ ] `GOOGLE_CLIENT_SECRET` (se usar login Google)

**O resto é opcional!**

---

## 📝 NOTAS IMPORTANTES

- ✅ `MONGODB_URI` - **OBRIGATÓRIO** - Use esta variável (não `MONGO_ENV`)
- ⚠️ `MONGO_ENV` - Aceito como fallback, mas prefira `MONGODB_URI`
- ❌ `GOOGLE_CREDENTIALS` - Só se precisar de Google Sheets
- ❌ `PONTO_MAIS_*` - Só se usar Ponto Mais
- ❌ `CHATBOT_*` - Só se usar chatbot

---

## 💡 RESUMO ULTRA RÁPIDO

**Mínimo para funcionar:**
```env
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://nathaliavillanova:TgoHptnjdfLOgrN1@velohubcentral.od7vwts.mongodb.net/?appName=VelohubCentral
WHATSAPP_API_URL=https://whatsapp-api-y40p.onrender.com
WHATSAPP_DEFAULT_JID=5511943952784@s.whatsapp.net
```

**Pronto!** 🎉

---

**Versão:** v1.0.0  
**Última atualização:** 2025-01-23
