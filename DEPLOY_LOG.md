# 📋 DEPLOY LOG - VeloHub V3
<!-- VERSION: v1.0.0 | DATE: 2025-09-18 | AUTHOR: VeloHub Development Team -->

## 🚀 **DEPLOYS E PUSHES REALIZADOS**

### **GitHub Push - Atualização do Chatbot: Melhorias no Backend e Frontend**
- **Data/Hora**: 2025-01-27 21:15:00
- **Tipo**: GitHub Push
- **Versão**: v1.2.0
- **Commit**: 99be581
- **Arquivos Modificados**: 
  - `backend/server.js` (melhorias no sistema de chatbot)
  - `backend/services/chatbot/aiService.js` (atualizações no serviço de IA)
  - `src/components/Chatbot.js` (melhorias na interface do chatbot)
- **Arquivos Novos**:
  - `public/Gemini_SparkIcon_.width-500.format-webp-Photoroom.png` (novo ícone)
- **Descrição**: Atualizações gerais no sistema de chatbot com melhorias no backend e frontend, incluindo novo ícone do Gemini
- **Status**: ✅ Concluído com sucesso

### **GitHub Push - Refatoração Completa do Sistema de Chatbot**
- **Data/Hora**: 2025-01-27 20:30:00
- **Tipo**: GitHub Push
- **Versão**: aiService v2.1.0, searchService v2.1.0, feedbackService v2.1.0, server v1.1.0
- **Commit**: 1f1af0b
- **Arquivos Modificados**: 
  - `backend/services/chatbot/openaiService.js` → `aiService.js` (v2.1.0 - migração completa)
  - `backend/services/chatbot/searchService.js` (v2.1.0 - nomenclatura FAQ → Bot_perguntas)
  - `backend/services/chatbot/feedbackService.js` (v2.1.0 - MongoDB → Google Sheets)
  - `backend/services/chatbot/logsService.js` (remoção função logSiteResponse)
  - `backend/server.js` (v1.1.0 - atualizações de nomenclatura)
  - `backend/config.js` (v1.1.0 - remoção EXTERNAL_API_TIMEOUT)
  - `backend/package.json` (remoção dependência axios)
- **Arquivos Novos**:
  - `ANALISE CHATBOT.md` (documentação completa do sistema)
  - `ANALISE_SEGURANCA_CREDENTIALS.md` (análise de segurança)
  - `CONFIGURACAO_CHAVES_API.md` (configuração de APIs)
  - `env-seguro.txt` (template de variáveis seguras)
  - `env-template.txt` (template completo de variáveis)
- **Arquivos Removidos**:
  - `backend/test_chatbot_fixed.js` (teste com axios)
- **Descrição**: Refatoração completa do sistema de chatbot - migração de nomenclatura (FAQ → Bot_perguntas), remoção de APIs externas, migração de feedback para Google Sheets, correção de prompts, documentação completa

### **GitHub Push - Reorganização Aba Apoio e Correções Chatbot**
- **Data/Hora**: 2025-01-27 18:45:00
- **Tipo**: GitHub Push
- **Versão**: App v1.3.4, SupportModal v1.1.0
- **Commit**: 75a61e1
- **Arquivos Modificados**: 
  - `src/App_v2-1.js` (v1.3.4 - reorganização cards, linhas separadoras)
  - `src/components/SupportModal.js` (v1.1.0 - novos formulários)
  - `backend/server.js` (correções chatbot, endpoint /api/faq/top10)
  - `backend/services/chatbot/openaiService.js` (prompts consistentes)
  - `backend/services/chatbot/searchService.js` (correção MongoDB)
- **Arquivos Novos**:
  - `backend/config.js` (configurações centralizadas)
- **Descrição**: Reorganização da aba Apoio com 9 cards em 3 linhas, novos formulários para Gestão/RH-Financeiro/Facilities, correções do chatbot (CORS, MongoDB, prompts)

### **GitHub Push - Implementação Completa VeloBot V2.0**
- **Data/Hora**: 2025-01-27 16:30:00
- **Tipo**: GitHub Push
- **Versão**: VeloBot V2.0.0
- **Commit**: 3861ffe
- **Arquivos Modificados**: 
  - `backend/server.js` (v2.0.0 - endpoint chatbot atualizado)
  - `backend/services/chatbot/openaiService.js` (v2.0.0 - Gemini primário, OpenAI fallback)
  - `backend/services/chatbot/searchService.js` (v2.0.0 - busca híbrida + sites)
  - `backend/services/chatbot/feedbackService.js` (v2.0.0 - métricas aprimoradas)
  - `backend/services/chatbot/logsService.js` (v1.0.0 - novo serviço)
  - `backend/package.json` (novas dependências)
  - `src/App_v2-1.js` (integração melhorias)
- **Arquivos Novos**:
  - `.cursorrules` (diretrizes do projeto)
  - `CHECKLIST_MIGRACAO_GCP.md` (checklist completo)
  - `CHECKLIST_ROCKETCHAT_IMPLEMENTACAO.md` (checklist chat)
  - `LAYOUT_GUIDELINES.md` (diretrizes visuais)
  - `PLANO DE IMPLEMENTAÇÃO BOT V5.ini` (plano executado)
  - `chatbot-vercel/` (protótipo de referência)
- **Descrição**: 
  - Implementação completa do PLANO DE IMPLEMENTAÇÃO BOT V5.0.0
  - Gemini 2.5 Pro configurado como IA primária
  - OpenAI configurado como fallback automático
  - Sistema de busca híbrida (FAQ + Artigos + Sites autorizados)
  - Sistema de desduplicação e menu de esclarecimento
  - Logs detalhados no Google Sheets
  - Métricas de performance do chatbot
  - Integração completa com SSO do VeloHub
- **Status**: ✅ Concluído com sucesso

### **GitHub Push - Correção CORS e URLs para us-east1**
- **Data/Hora**: 2025-01-27 17:15:00
- **Tipo**: GitHub Push
- **Versão**: backend/server.js v1.0.2, src/config/api-config.js v1.0.1
- **Commit**: 5696841
- **Arquivos Modificados**: 
  - `backend/server.js` (CORS + URLs para us-east1)
  - `src/config/api-config.js` (URLs para us-east1)
- **Descrição**: 
  - Adicionar novo domínio app.velohub.velotax.com.br ao CORS
  - Atualizar URLs de southamerica-east1 para us-east1
  - Corrigir problema de CORS após mudança de DNS personalizado
  - Manter compatibilidade com domínios legados
  - Resolver erro "No 'Access-Control-Allow-Origin' header"
- **Status**: ✅ Concluído com sucesso

### **GitHub Push - Correção Sistema Notícias Críticas**
- **Data/Hora**: 2025-09-18 15:45:00
- **Tipo**: GitHub Push
- **Versão**: backend/server.js v1.0.1
- **Commit**: facc15e
- **Arquivos Modificados**: 
  - `backend/server.js` (correção campo isCritical)
- **Descrição**: 
  - Corrigir reconhecimento de notícias críticas com campo isCritical (boolean)
  - Adicionar suporte ao campo isCritical (boolean) no backend
  - Corrigir mapeamento em /api/velo-news e /api/data
  - Resolver problema de novo registro não sendo identificado como crítico
  - Manter compatibilidade com campos legados (alerta_critico, is_critical)
- **Status**: ✅ Concluído com sucesso

---

## 📊 **RESUMO DE ALTERAÇÕES**

### **Problema Identificado**
- Novo registro no MongoDB com `isCritical: true` não estava sendo reconhecido como crítico
- Backend não suportava o formato boolean do campo `isCritical`

### **Solução Implementada**
- Adicionado suporte ao campo `isCritical` (boolean) no backend
- Mantida compatibilidade com campos legados
- Corrigido mapeamento em ambos os endpoints

### **Arquivos Afetados**
- `backend/server.js` - Linhas 116 e 224

---

*Log atualizado automaticamente após push para GitHub*
