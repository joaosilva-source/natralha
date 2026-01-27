# ⚙️ Configuração do Vercel com Backend Render

<!-- VERSION: v1.0.0 | DATE: 2025-01-27 | AUTHOR: VeloHub Development Team -->

## 🎯 Backend Configurado

✅ **Backend URL:** `https://natralha.onrender.com`

---

## 📝 PASSO 1: Configurar Variável no Vercel

### 1.1 Acessar Vercel

1. Acesse: **https://vercel.com/dashboard**
2. Selecione o projeto: **natralha**

### 1.2 Adicionar Variável de Ambiente

1. Vá em **Settings** > **Environment Variables**
2. Clique em **Add New**
3. Preencha:

   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://natralha.onrender.com`
   - **Environment:** Marque todas as opções:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

4. Clique em **Save**

---

## 🔄 PASSO 2: Fazer Redeploy

Após adicionar a variável:

1. Vá em **Deployments**
2. Clique nos **3 pontinhos** do último deploy
3. Selecione **Redeploy**
4. Aguarde o build completar

---

## ✅ PASSO 3: Verificar

Após o redeploy, teste:

1. Acesse: `https://natralha.vercel.app`
2. Abra o **Console do Navegador** (F12)
3. Procure por: `🔧 API Config`
4. Deve mostrar:
   ```
   baseUrl: https://natralha.onrender.com/api
   ```

---

## 🧪 Teste Rápido

### Testar Backend Diretamente

**Opção 1: Health Check (Recomendado)**
```
https://natralha.onrender.com/api/health
```

**Opção 2: Test Endpoint**
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
  "monitor": "/monitor.html"
}
```

✅ Se retornar isso, o backend está funcionando!

---

## 📋 Checklist Final

- [ ] Variável `REACT_APP_API_URL` configurada no Vercel
- [ ] Valor: `https://natralha.onrender.com` (sem `/api`)
- [ ] Todas as opções de ambiente marcadas (Production, Preview, Development)
- [ ] Redeploy feito no Vercel
- [ ] Backend testado diretamente (`/api/test`)
- [ ] Frontend testado (`https://natralha.vercel.app`)

---

## 🚨 Problemas Comuns

### Erro: "Failed to fetch"

**Causa:** CORS não configurado no backend

**Solução:** O backend já está configurado para aceitar `.vercel.app` automaticamente. Se ainda der erro, verifique se o backend está rodando.

### Erro: "Network Error"

**Causa:** Backend offline ou URL incorreta

**Solução:** 
1. Verifique se `https://natralha.onrender.com/api/test` retorna OK
2. Confirme que a variável no Vercel está correta (sem `/api` no final)

---

**Versão:** v1.0.0  
**Última atualização:** 2025-01-27  
**Backend URL:** `https://natralha.onrender.com`
