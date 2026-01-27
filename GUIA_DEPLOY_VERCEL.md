# 🚀 Guia de Deploy do Frontend no Vercel

<!-- VERSION: v1.0.0 | DATE: 2025-01-23 | AUTHOR: VeloHub Development Team -->

## 📋 Visão Geral

Este guia explica como fazer deploy do frontend VeloHub no Vercel e configurar a conexão com o backend no Render.

---

## 🎯 Pré-requisitos

- Conta no Vercel (https://vercel.com)
- Repositório GitHub conectado
- Backend já configurado no Render (ver `CONFIGURACAO_RENDER_COMPLETA.md`)

---

## 🚀 PASSO 1: Criar Projeto no Vercel

### 1.1 Acessar Vercel

1. Acesse: **https://vercel.com**
2. Faça login com **GitHub**
3. Clique em **Add New Project**

### 1.2 Conectar Repositório

1. Selecione o repositório: **joaosilva-source/natralha**
2. Escolha a branch: **main** (ou **Inovações**)

---

## ⚙️ PASSO 2: Configuração do Projeto

### 2.1 Configurações Básicas

| Campo | Valor |
|-------|-------|
| **Framework Preset** | `Create React App` |
| **Root Directory** | `.` (raiz do projeto) |
| **Build Command** | `npm run build` |
| **Output Directory** | `build` |
| **Install Command** | `npm install` |

### 2.2 Variáveis de Ambiente

⚠️ **IMPORTANTE:** Configure a variável abaixo:

```env
REACT_APP_API_URL=https://velohub-backend.onrender.com
```

**Onde obter a URL:**
- Após fazer deploy no Render, você receberá uma URL como: `https://velohub-backend.onrender.com`
- Use essa URL completa (sem `/api` no final - o código adiciona automaticamente)

**Como configurar:**
1. No Vercel, vá em **Settings** > **Environment Variables**
2. Adicione:
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://sua-url-do-render.onrender.com`
   - **Environment:** Production, Preview, Development (marque todos)

---

## 🔧 PASSO 3: Configurar Backend no Render

### 3.1 Atualizar CORS no Backend

Após obter a URL do Vercel, você precisará atualizar o CORS no backend:

1. **Opção 1: Usar variável de ambiente (Recomendado)**

No Render, adicione a variável:
```env
CORS_ORIGIN=https://seu-projeto.vercel.app
```

2. **Opção 2: Atualizar código**

O código já está configurado para aceitar domínios `.vercel.app` e `.vercel.sh` automaticamente via regex.

### 3.2 Verificar CORS no Backend

O arquivo `backend/server.js` já está configurado com:
```javascript
/\.vercel\.app$/, // Vercel (qualquer subdomínio)
/\.vercel\.sh$/, // Vercel preview deployments
```

**Isso significa que qualquer domínio do Vercel será aceito automaticamente!**

---

## 🚀 PASSO 4: Deploy

### 4.1 Deploy Inicial

1. Clique em **Deploy**
2. Aguarde o build completar (2-5 minutos)
3. ✅ Pronto! Você receberá uma URL como: `https://velohub-xxxxx.vercel.app`

### 4.2 Verificar Deploy

Após o deploy, teste:
1. Acesse a URL do Vercel
2. Abra o console do navegador (F12)
3. Verifique se a API está sendo chamada corretamente
4. Verifique se não há erros de CORS

---

## 🔄 PASSO 5: Configurar Domínio Customizado (Opcional)

### 5.1 Adicionar Domínio

1. No Vercel, vá em **Settings** > **Domains**
2. Clique em **Add Domain**
3. Digite seu domínio (ex: `app.velohub.com`)
4. Siga as instruções de DNS

### 5.2 Configurar DNS

No seu provedor DNS, adicione:

```
Tipo: CNAME
Nome: app (ou subdomínio desejado)
Valor: cname.vercel-dns.com
TTL: 3600 (ou padrão)
```

### 5.3 Atualizar CORS no Backend

Se usar domínio customizado, adicione no Render:
```env
CORS_ORIGIN=https://app.velohub.com
```

Ou atualize o código `backend/server.js` para incluir seu domínio.

---

## 🔐 PASSO 6: Variáveis de Ambiente no Vercel

### 6.1 Variáveis Obrigatórias

```env
REACT_APP_API_URL=https://velohub-backend.onrender.com
```

### 6.2 Variáveis Opcionais

Se necessário, você pode adicionar outras variáveis:
```env
REACT_APP_ENV=production
REACT_APP_VERSION=3.0.0
```

---

## 📝 PASSO 7: Configurar Auto-Deploy

### 7.1 Ativar Auto-Deploy

1. Vá em **Settings** > **Git**
2. Certifique-se de que **Auto-Deploy** está ativado
3. Escolha a branch: `main` (ou `Inovações`)

**Resultado:** Toda vez que você fizer push no GitHub, o Vercel fará deploy automaticamente.

---

## 🐛 Troubleshooting

### Problema: Erro de CORS

**Sintomas:**
- Erro no console: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"

**Solução:**
1. Verifique se a URL do backend está correta em `REACT_APP_API_URL`
2. Verifique se o backend no Render está aceitando o domínio do Vercel
3. Confirme que o backend tem as regex `/\.vercel\.app$/` e `/\.vercel\.sh$/` no CORS

### Problema: API não encontrada

**Sintomas:**
- Erro 404 ao chamar a API
- Erro: "Failed to fetch"

**Solução:**
1. Verifique se `REACT_APP_API_URL` está configurado corretamente
2. Confirme que a URL do backend no Render está acessível
3. Teste a URL diretamente: `curl https://sua-url-render.com/api/test`

### Problema: Build falha

**Sintomas:**
- Erro no build do Vercel
- Dependências não encontradas

**Solução:**
1. Verifique os logs de build no Vercel
2. Confirme que `package.json` está na raiz do projeto
3. Verifique se todas as dependências estão listadas
4. Tente fazer `npm install` e `npm run build` localmente

---

## 📊 Monitoramento

### Logs em Tempo Real

1. Acesse **Deployments** no dashboard do Vercel
2. Clique em um deployment
3. Veja logs em tempo real
4. Verifique erros e avisos

### Analytics

No dashboard, veja:
- **Page Views:** Visualizações de página
- **Unique Visitors:** Visitantes únicos
- **Performance:** Métricas de performance

---

## ✅ Checklist Final

- [ ] Conta Vercel criada
- [ ] Repositório conectado: `joaosilva-source/natralha`
- [ ] Projeto criado no Vercel
- [ ] Root Directory: `.` (raiz) ✅
- [ ] Build Command: `npm run build` ✅
- [ ] Output Directory: `build` ✅
- [ ] Variável `REACT_APP_API_URL` configurada ✅
- [ ] Backend no Render configurado com CORS para Vercel ✅
- [ ] Deploy bem-sucedido ✅
- [ ] Frontend acessível e funcionando ✅
- [ ] API conectada corretamente ✅
- [ ] Auto-deploy configurado ✅

---

## 🔗 Links Úteis

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Docs:** https://vercel.com/docs
- **Vercel Status:** https://www.vercel-status.com
- **Repositório:** https://github.com/joaosilva-source/natralha

---

## 💡 Dicas Importantes

1. **REACT_APP_API_URL:** Deve ser a URL completa do backend (sem `/api`)
2. **CORS:** O backend já aceita domínios `.vercel.app` e `.vercel.sh` automaticamente
3. **Build:** O Vercel detecta automaticamente Create React App
4. **Preview Deployments:** Cada PR cria um preview deployment automaticamente
5. **Domínio Customizado:** Pode levar até 48h para propagar DNS

---

**Versão:** v1.0.0  
**Última atualização:** 2025-01-23  
**Autor:** VeloHub Development Team
