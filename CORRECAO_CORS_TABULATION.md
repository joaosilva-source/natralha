# Correção do Erro CORS na Rota /api/sociais/tabulation

## 🚨 Problema Identificado

O frontend em `https://natralha-rrm3.onrender.com` estava sendo bloqueado ao tentar acessar a rota `/api/sociais/tabulation` no backend:

```
Access to XMLHttpRequest at 'https://velohub-backend.onrender.com/api/sociais/tabulation' 
from origin 'https://natralha-rrm3.onrender.com' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Soluções Implementadas

### 1. Melhorar Tratamento de OPTIONS no Router de Sociais

**Arquivo:** `backend/routes/sociais.js`

- Garantir que requisições OPTIONS sempre retornem headers CORS, mesmo em caso de erro
- Retornar status 200 para todas as requisições OPTIONS (para debug)
- Logs melhorados para facilitar diagnóstico

### 2. Melhorar Tratamento de OPTIONS no Server Principal

**Arquivo:** `backend/server.js`

- Garantir que o fallback de OPTIONS sempre retorne headers CORS
- Retornar status 200 mesmo para origens não permitidas (para debug)
- Logs melhorados para facilitar diagnóstico

## 📋 Configuração de CORS

### Origens Permitidas

A origem `https://natralha-rrm3.onrender.com` já estava na lista de origens permitidas:

```javascript
const allowedOrigins = [
  'https://app.velohub.velotax.com.br',
  'https://natralha-rrm3.onrender.com', // ✅ Já estava configurado
  'https://velohub-backend.onrender.com',
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:5000'
];
```

### Padrão Regex para Render.com

Também existe um padrão regex que permite qualquer domínio `.onrender.com`:

```javascript
const renderPattern = /^https:\/\/.*\.onrender\.com$/;
```

## 🔍 Diagnóstico

O problema estava no tratamento de requisições OPTIONS (preflight). Mesmo com a origem permitida, se houvesse algum erro ou se o middleware não processasse corretamente, os headers CORS não eram retornados.

## ✅ Correções Aplicadas

1. **Router de Sociais (`routes/sociais.js`):**
   - Tratamento de OPTIONS sempre retorna headers CORS
   - Status 200 para todas as requisições OPTIONS

2. **Server Principal (`server.js`):**
   - Fallback de OPTIONS sempre retorna headers CORS
   - Status 200 mesmo para origens não permitidas (para debug)

## 📝 Próximos Passos

1. **Fazer commit das alterações:**
   ```bash
   git add backend/routes/sociais.js backend/server.js
   git commit -m "Corrigir erro CORS na rota /api/sociais/tabulation"
   git push origin main
   ```

2. **Aguardar deploy automático no Render**

3. **Testar novamente a requisição do frontend**

## 🔍 Verificação

Após o deploy, verificar nos logs do Render:

- `🔍 [OPTIONS Preflight]` - Deve aparecer para requisições OPTIONS
- `✅ [OPTIONS] Headers CORS enviados` - Deve confirmar que headers foram enviados
- `📥 [Route] POST /api/sociais/tabulation` - Deve aparecer quando a requisição POST for feita

## 📝 Notas Técnicas

- O erro ocorria na requisição OPTIONS (preflight), não na requisição POST real
- O middleware CORS do Express estava configurado corretamente
- O problema era que em alguns casos, os headers não eram retornados
- A solução garante que headers sempre sejam retornados, mesmo em caso de erro

---

**Versão:** v1.0.0  
**Data:** 2026-01-29  
**Autor:** VeloHub Development Team
