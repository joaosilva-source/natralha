# 🔧 Atualização do Deploy no Render - Serviço Unificado

<!-- VERSION: v1.0.0 | DATE: 2026-01-30 | AUTHOR: VeloHub Development Team -->

## 📋 O que mudou?

O projeto agora está **unificado**: o backend serve tanto a API quanto o frontend no mesmo domínio. Isso elimina problemas de CORS e simplifica o deploy.

### Antes:
- ❌ Dois serviços separados: `velohub-backend` e `velohub-frontend`
- ❌ Frontend tentava acessar backend em domínio diferente (CORS necessário)
- ❌ Erro: `Could not read package.json: /opt/render/project/src/frontend/package.json`

### Agora:
- ✅ Um único serviço: `velohub-backend` serve tudo
- ✅ Frontend e backend no mesmo domínio (sem CORS)
- ✅ Build do frontend acontece automaticamente antes de iniciar o servidor

---

## 🚀 Passos para Atualizar no Render

### 1. Remover Serviço Frontend Separado

1. **Acesse o Dashboard do Render**
   - URL: https://dashboard.render.com
   - Faça login

2. **Encontrar o Serviço Frontend**
   - Procure por `velohub-frontend` na lista de serviços
   - ⚠️ **IMPORTANTE**: Se você não quiser perder histórico, pode apenas pausar o serviço em vez de deletar

3. **Deletar ou Pausar**
   - Clique no serviço `velohub-frontend`
   - Vá em **Settings** > **Delete Service** (ou apenas pause)
   - Confirme a ação

---

### 2. Atualizar Configuração do Serviço Backend

1. **Acessar o Serviço Backend**
   - Abra o serviço `velohub-backend` no dashboard

2. **Ir para Settings**
   - Clique em **Settings** no menu lateral

3. **Atualizar Configurações**

   **Opção A: Usar render.yaml (Recomendado)**
   
   - Procure por **"Infrastructure as Code"** ou **"Use render.yaml"**
   - Marque ✅ **"Use render.yaml"**
   - Isso fará o Render usar automaticamente o arquivo `render.yaml` atualizado
   - Clique em **Save Changes**

   **Opção B: Configuração Manual**
   
   Se preferir configurar manualmente, atualize os seguintes campos:
   
   | Campo | Valor Antigo | Valor Novo |
   |-------|--------------|------------|
   | **Root Directory** | `backend` | `.` (raiz do projeto) |
   | **Build Command** | `npm install --legacy-peer-deps` | `npm install --legacy-peer-deps && npm run build:frontend` |
   | **Start Command** | `npm start` | `npm start` (mantém) |
   | **Health Check Path** | `/api/test` | `/api/health` |

4. **Salvar e Fazer Deploy**
   - Clique em **Save Changes**
   - Vá em **Manual Deploy** > **Deploy latest commit**
   - Aguarde o build completar

---

## ✅ Verificação

Após o deploy, verifique:

1. **Build Completo**
   - O build deve compilar o frontend (pode levar alguns minutos)
   - Você verá logs como: `Building frontend...` e `Frontend built successfully`

2. **Servidor Funcionando**
   - Acesse: `https://seu-backend.onrender.com`
   - Deve carregar o frontend React (não mais erro 404)

3. **API Funcionando**
   - Acesse: `https://seu-backend.onrender.com/api/health`
   - Deve retornar JSON com status do servidor

4. **Arquivos Estáticos**
   - Acesse: `https://seu-backend.onrender.com/assets/index-*.css`
   - Deve servir o CSS corretamente

---

## 🔍 Troubleshooting

### Erro: "Could not read package.json: /opt/render/project/src/frontend/package.json"

**Causa**: Render ainda está procurando o frontend em caminho antigo.

**Solução**:
1. Verifique se o **Root Directory** está como `.` (ponto, raiz)
2. Verifique se está usando o `render.yaml` atualizado
3. Faça um novo deploy manual

### Erro: "npm run build:frontend failed"

**Causa**: Dependências do frontend não instaladas ou erro de memória.

**Solução**:
1. Verifique os logs do build no Render
2. O script já inclui `--legacy-peer-deps` e `NODE_OPTIONS='--max-old-space-size=4096'`
3. Se persistir, verifique se há erros de sintaxe no código do frontend

### Frontend não carrega (404)

**Causa**: Build do frontend não foi executado ou pasta `public` não existe.

**Solução**:
1. Verifique se o build do frontend foi executado (veja logs)
2. Verifique se a pasta `public` existe na raiz do projeto
3. Verifique se `public/index.html` existe

---

## 📝 Estrutura Esperada Após Deploy

```
projeto/
├── backend/
│   └── server.js (servidor Express)
├── front/
│   └── (código fonte do frontend)
├── public/
│   ├── index.html (gerado pelo build)
│   └── assets/ (gerado pelo build)
├── package.json (raiz)
└── render.yaml
```

---

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Frontend e backend no mesmo domínio
2. ✅ Sem necessidade de CORS
3. ✅ URLs relativas funcionando (`/api/sociais/...`)
4. ✅ Roteamento SPA funcionando

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do build no Render
2. Verifique os logs do servidor em tempo real
3. Confirme que o `render.yaml` está atualizado no repositório
