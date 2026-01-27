# 🗄️ Configuração MongoDB no Render

<!-- VERSION: v1.0.0 | DATE: 2025-01-27 | AUTHOR: VeloHub Development Team -->

## ✅ MongoDB Configurado

**URI de Conexão:**
```
mongodb+srv://nathaliavillanova:TgoHptnjdfLOgrN1@velohubcentral.od7vwts.mongodb.net/?appName=VelohubCentral
```

---

## 📝 PASSO 1: Adicionar Variável no Render

### 1.1 Acessar Render Dashboard

1. Acesse: **https://dashboard.render.com**
2. Selecione o serviço: **natralha**

### 1.2 Adicionar Variável de Ambiente

1. Vá em **Environment** (Variáveis de Ambiente)
2. Clique em **Add Environment Variable**
3. Preencha:

   - **Key:** `MONGODB_URI`
   - **Value:** `mongodb+srv://nathaliavillanova:TgoHptnjdfLOgrN1@velohubcentral.od7vwts.mongodb.net/?appName=VelohubCentral`

4. Clique em **Save**

---

## 🔄 PASSO 2: Fazer Redeploy

Após adicionar a variável:

1. Vá em **Manual Deploy** ou aguarde o deploy automático
2. Aguarde o build completar
3. Verifique os logs para confirmar conexão com MongoDB

---

## ✅ PASSO 3: Verificar Conexão

### 3.1 Verificar Logs

Nos logs do Render, procure por:

```
✅ Conexão MongoDB estabelecida!
```

### 3.2 Testar Endpoint

Teste o endpoint `/api/test`:

```
https://natralha.onrender.com/api/test
```

**Deve retornar:**
```json
{
  "success": true,
  "message": "Console de Conteúdo VeloHub API v4.2.0",
  "status": "OK",
  "timestamp": "...",
  "monitor": "/monitor.html",
  "mongodb": {
    "connected": true,
    "status": "OK"
  }
}
```

✅ Se `mongodb.connected` for `true`, está funcionando!

---

## 📋 Checklist

- [ ] Variável `MONGODB_URI` adicionada no Render
- [ ] Valor correto (URI completa)
- [ ] Redeploy feito
- [ ] Logs mostram "✅ Conexão MongoDB estabelecida!"
- [ ] Endpoint `/api/test` retorna `mongodb.connected: true`

---

## 🚨 Problemas Comuns

### Erro: "MongoDB não configurado"

**Causa:** Variável `MONGODB_URI` não configurada

**Solução:** 
1. Verifique se a variável está configurada no Render
2. Confirme que o nome está correto: `MONGODB_URI` (não `MONGO_ENV`)
3. Faça redeploy

### Erro: "Authentication failed"

**Causa:** Credenciais incorretas ou IP não autorizado

**Solução:**
1. Verifique se o usuário e senha estão corretos
2. No MongoDB Atlas, vá em **Network Access**
3. Adicione `0.0.0.0/0` para permitir qualquer IP (ou o IP do Render)

### Erro: "Connection timeout"

**Causa:** Firewall ou rede bloqueando conexão

**Solução:**
1. Verifique **Network Access** no MongoDB Atlas
2. Confirme que o Render pode acessar o MongoDB
3. Verifique se a URI está completa e correta

---

## 💡 Notas Importantes

- ✅ Use `MONGODB_URI` (padrão recomendado)
- ⚠️ `MONGO_ENV` ainda funciona como fallback (compatibilidade)
- 🔒 Mantenha a URI segura - não compartilhe publicamente
- 🌐 Configure **Network Access** no MongoDB Atlas para permitir o Render

---

**Versão:** v1.0.0  
**Última atualização:** 2025-01-27  
**MongoDB URI:** `mongodb+srv://nathaliavillanova:***@velohubcentral.od7vwts.mongodb.net/?appName=VelohubCentral`
