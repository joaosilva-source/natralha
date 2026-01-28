# Deploy Log - Veloredes

## Histórico de Deploys e Alterações

---

### GitHub Push - 2026-01-14 18:15:00

**Tipo:** Push para GitHub  
**Repositório:** https://github.com/admVeloHub/socials  
**Branch:** main  
**Versão:** v1.0.2

**Arquivos Modificados/Adicionados:**
- `vercel.json` - Criado arquivo de configuração do Vercel
- `package.json` - Criado package.json na raiz para facilitar deploy no Vercel
- `DEPLOY_LOG.md` - Atualizado log de deploy

**Descrição:**
- Configuração do Vercel para build e deploy do projeto React/Vite
- Build configurado para executar na pasta `frontend/`
- Output directory configurado para `frontend/dist`
- Rewrites configurados para SPA (Single Page Application)
- Framework detectado como Vite

---

### GitHub Push - 2026-01-15 14:51:40

**Tipo:** Push para GitHub  
**Repositório:** https://github.com/admVeloHub/socials  
**Branch:** main  
**Versão:** v1.0.10

**Arquivos Modificados/Adicionados:**
- `package.json` - Adicionado script "start" para iniciar servidor na rede local, adicionadas dependências Material-UI (@mui/material, @mui/icons-material, @emotion/react, @emotion/styled)
- `src/components/Dashboard.jsx` - Versão atualizada para v1.1.0, adicionado tratamento de erro com Promise.allSettled para não quebrar Dashboard quando endpoint de rating não existir, adicionado ícone Material-UI no título
- `src/services/api.js` - Versão atualizada para v1.0.3, melhorado tratamento de erro 404 no endpoint getRatingAverage para retornar null em vez de lançar exceção
- `src/App.jsx` - Possíveis melhorias visuais
- `src/components/Feed.jsx` - Possíveis melhorias visuais
- `src/components/Reports.jsx` - Possíveis melhorias visuais
- `src/components/TabulationForm.jsx` - Possíveis melhorias visuais
- `src/styles/theme.css` - Possíveis ajustes de estilo
- `README.md` - Atualizações na documentação
- `package-lock.json` - Atualizado automaticamente

**Descrição:**
- Adicionado script "start" no package.json para facilitar inicialização do servidor na rede local
- Integração com Material-UI para ícones e componentes visuais
- Melhorado tratamento de erros no Dashboard para não quebrar quando endpoint de rating retorna 404
- Dashboard agora usa Promise.allSettled para carregar dados de forma independente
- Endpoint de rating agora retorna null quando não encontrado (404) em vez de lançar exceção
- Melhorias visuais com ícones Material-UI nos componentes

---

### GitHub Push - 2026-01-14 20:00:00

**Tipo:** Push para GitHub  
**Repositório:** https://github.com/admVeloHub/socials  
**Branch:** main  
**Versão:** v1.0.9

**Arquivos Modificados/Adicionados:**
- `src/components/Dashboard.jsx` - Adicionado quadro "Média" consultando GET /api/sociais/rating/average (v1.0.2)
- `src/services/api.js` - Adicionada função getRatingAverage() para consultar média de rating (v1.0.2)
- `src/styles/theme.css` - Adicionado estilo .metric-unit para ícone de estrela (v1.0.1)
- `package-lock.json` - Atualizado automaticamente
- `DEPLOY_LOG.md` - Atualizado log de deploy

**Descrição:**
- Novo quadro "Média" adicionado na aba Dashboard
- Consulta automática ao endpoint GET /api/sociais/rating/average ao carregar o Dashboard
- Exibe média de rating formatada com 2 casas decimais e ícone de estrela (⭐)
- Integrado com os outros cards de métricas existentes
- Versões dos arquivos atualizadas conforme padrão do projeto

---

### GitHub Push - 2026-01-14 19:00:00

**Tipo:** Push para GitHub  
**Repositório:** https://github.com/admVeloHub/socials  
**Branch:** main  
**Versão:** v1.0.8

**Arquivos Modificados/Adicionados:**
- `vercel.json` - Simplificado para usar detecção automática do Vercel (removidos buildCommand e installCommand customizados)
- `package.json` - Script de build voltou para `vite build` (padrão que funciona quando npm adiciona node_modules/.bin ao PATH)
- `DEPLOY_LOG.md` - Atualizado log de deploy

**Descrição:**
- Simplificação da configuração do Vercel para usar detecção automática do framework Vite
- Removidos comandos customizados que estavam causando problemas
- Vercel detecta automaticamente projetos Vite e executa `npm install` e `npm run build` corretamente
- Script de build usa `vite build` padrão que funciona quando executado via `npm run build` (npm adiciona node_modules/.bin ao PATH)
- Solução mais simples e confiável baseada nas melhores práticas do Vercel

---

### GitHub Push - 2026-01-14 18:40:00

**Tipo:** Push para GitHub  
**Repositório:** https://github.com/admVeloHub/socials  
**Branch:** main  
**Versão:** v1.0.7

**Arquivos Modificados/Adicionados:**
- `package.json` - Script de build atualizado para usar caminho explícito: `node ./node_modules/vite/bin/vite.js build`
- `DEPLOY_LOG.md` - Atualizado log de deploy
- Build testado localmente com sucesso

**Descrição:**
- Verificação completa realizada: build funciona localmente após `npm install`
- Script de build atualizado para usar caminho explícito do vite
- Garante funcionamento no Vercel mesmo se PATH não estiver configurado corretamente
- Solução testada e validada localmente antes do push

---

### GitHub Push - 2026-01-14 18:35:00

**Tipo:** Push para GitHub  
**Repositório:** https://github.com/admVeloHub/socials  
**Branch:** main  
**Versão:** v1.0.6

**Arquivos Modificados/Adicionados:**
- `vercel.json` - Alterado buildCommand de `npx vite build` para `npm run build`
- `package.json` - Atualizado script de build para usar caminho direto do vite: `node node_modules/vite/bin/vite.js build`
- `DEPLOY_LOG.md` - Atualizado log de deploy

**Descrição:**
- Correção do problema de versão conflitante do vite no deploy
- `npx vite build` estava instalando vite@7.3.1 ao invés de usar vite@5.0.0 instalado
- Script de build agora usa caminho direto para o vite nos node_modules
- Garante uso da versão correta do vite especificada no package.json

---

### GitHub Push - 2026-01-14 18:30:00

**Tipo:** Push para GitHub  
**Repositório:** https://github.com/admVeloHub/socials  
**Branch:** main  
**Versão:** v1.0.5

**Arquivos Modificados/Adicionados:**
- `vercel.json` - Atualizado buildCommand para usar `npx vite build`
- `package.json` - Atualizado script de build para usar `npx vite build`
- `DEPLOY_LOG.md` - Atualizado log de deploy

**Descrição:**
- Correção do problema "vite: command not found" no deploy do Vercel
- BuildCommand atualizado para usar `npx vite build` ao invés de `npm run build`
- Uso de `npx` garante que o vite seja encontrado mesmo se não estiver no PATH
- Script de build no package.json também atualizado para consistência

---

### GitHub Push - 2026-01-14 18:25:00

**Tipo:** Push para GitHub  
**Repositório:** https://github.com/admVeloHub/socials  
**Branch:** main  
**Versão:** v1.0.4

**Arquivos Modificados/Adicionados:**
- Reestruturação completa: conteúdo da pasta `frontend/` movido para a raiz do projeto
- `package.json` - Atualizado para refletir nova estrutura (versão 1.0.1)
- `vercel.json` - Simplificado para executar comandos na raiz (sem `cd frontend`)
- `index.html`, `vite.config.js`, `src/` - Movidos para raiz
- Pasta `frontend/` removida
- `DEPLOY_LOG.md` - Atualizado log de deploy

**Descrição:**
- Reestruturação do projeto para facilitar deploy no Vercel
- Todos os arquivos do frontend agora estão na raiz do projeto
- Configuração do Vercel simplificada: `npm install` e `npm run build` executam diretamente na raiz
- Output directory atualizado para `dist` (ao invés de `frontend/dist`)
- Resolve problema de "vite: command not found" no deploy

---

### GitHub Push - 2026-01-14 18:20:00

**Tipo:** Push para GitHub  
**Repositório:** https://github.com/admVeloHub/socials  
**Branch:** main  
**Versão:** v1.0.3

**Arquivos Modificados/Adicionados:**
- `vercel.json` - Ajustado installCommand e buildCommand para executar diretamente na pasta frontend
- `package.json` - Removido `npm ci` do script de build (dependências já instaladas pelo installCommand)
- `DEPLOY_LOG.md` - Atualizado log de deploy

**Descrição:**
- Correção da configuração do Vercel para build funcionar corretamente
- installCommand agora executa `cd frontend && npm install` diretamente
- buildCommand agora executa `cd frontend && npm run build` sem npm ci redundante
- Resolve erro "vite: command not found" no deploy

---

### GitHub Push - 2026-01-14 18:10:00

**Tipo:** Push para GitHub  
**Repositório:** https://github.com/admVeloHub/socials  
**Branch:** main  
**Versão:** v1.0.1

**Arquivos Modificados/Adicionados:**
- `frontend/src/services/api.js` - Atualizado endpoint da API para staging (v1.0.1)
- `DEPLOY_LOG.md` - Atualizado log de deploy

**Descrição:**
- Configuração da API atualizada para usar endpoint staging: `https://staging-skynet-278491073220.us-east1.run.app/api/sociais`
- Frontend agora conecta automaticamente ao backend staging
- Mantida possibilidade de sobrescrever via variável de ambiente `VITE_API_URL`

---

### GitHub Push - 2026-01-14 18:05:00

**Tipo:** Push para GitHub  
**Repositório:** https://github.com/admVeloHub/socials  
**Branch:** main  
**Versão:** v1.0.0

**Arquivos Modificados/Adicionados:**
- `DEPLOY_LOG.md` - Criado log de deploy
- `frontend/vite.config.js` - Configurado para acesso na rede local (host: '0.0.0.0')
- `frontend/` - Estrutura completa do frontend React/Vite (incluindo node_modules)
- `LAYOUT_GUIDELINES.md` - Guia de layout e padrões visuais
- `LISTA_SCHEMAS.rb` - Schemas das coleções MongoDB
- `tailwind.config.js` - Configuração do Tailwind CSS

**Descrição:**
- Configuração do projeto React para funcionar na rede local
- Frontend configurado para se conectar à API REST na porta 3001
- Projeto migrado do Streamlit para React/Vite
- Configuração do Vite para permitir acesso via IP local (0.0.0.0)
- Push realizado com sucesso: 12426 objetos enviados (59.80 MiB)

---
