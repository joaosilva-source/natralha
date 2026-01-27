# 🔧 Solução: Erro 500 no Vercel

<!-- VERSION: v1.0.0 | DATE: 2025-01-23 | AUTHOR: VeloHub Development Team -->

## 🐛 Problema

Erro 500: `FUNCTION_INVOCATION_FAILED` no Vercel.

## ✅ Soluções Aplicadas

### 1. **PROBLEMA PRINCIPAL RESOLVIDO:** `index.js` movido

O arquivo `index.js` na raiz continha código de backend (Express + Baileys) e o Vercel estava tentando executá-lo como serverless function, causando o erro 500.

**Solução:** Arquivo movido para `backend/index-baileys.js`

### 2. Corrigido `vercel.json`

O arquivo foi atualizado para a sintaxe correta do Vercel v2:
- Removido `builds` (não é mais necessário)
- Usado `buildCommand` e `outputDirectory` diretamente
- Usado `rewrites` ao invés de `routes` para SPA

### 3. Criado `.vercelignore`

Arquivo criado para ignorar:
- Pasta `backend/` (não deve ser deployada)
- Arquivo `index.js` (já movido, mas garantindo que não seja processado)
- Arquivos de configuração desnecessários
- Scripts de teste

### 4. Variável de Ambiente no Vercel

**IMPORTANTE:** Configure no Vercel (Settings > Environment Variables):

```env
REACT_APP_API_URL=https://velohub-backend.onrender.com
```

**Substitua pela URL real do seu backend no Render!**

---

## 🔍 Verificar Logs do Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto
3. Vá em **Deployments**
4. Clique no deployment que falhou
5. Veja os **Logs** para identificar o erro específico

---

## 🚀 Próximos Passos

1. ✅ `vercel.json` corrigido
2. ✅ `.vercelignore` criado
3. ⚙️ Configure `REACT_APP_API_URL` no Vercel
4. 🔄 Faça novo deploy

---

## 💡 Causa do Erro 500

**CAUSA PRINCIPAL:** O arquivo `index.js` na raiz do projeto continha código de backend (Express + Baileys) e o Vercel estava tentando executá-lo como uma serverless function, causando o erro 500.

**Outras possíveis causas:**
1. **Variável de ambiente faltando:** `REACT_APP_API_URL` não configurada
2. **Build falhando:** Dependências não instaladas
3. **Pasta backend:** Pode estar tentando fazer deploy da pasta backend

---

## ✅ Checklist

- [ ] `vercel.json` atualizado
- [ ] `.vercelignore` criado
- [ ] `REACT_APP_API_URL` configurado no Vercel
- [ ] Novo deploy feito
- [ ] Logs verificados

---

**Versão:** v1.0.0  
**Última atualização:** 2025-01-23
