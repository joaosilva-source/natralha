# 🔗 URL do Backend - Referência Rápida

<!-- VERSION: v1.0.0 | DATE: 2025-01-27 | AUTHOR: VeloHub Development Team -->

## ✅ Backend Configurado

**URL do Backend:** `https://natralha.onrender.com`

---

## 📋 Onde Usar Esta URL

### 1. Vercel (Frontend)

**Variável de Ambiente:**
```env
REACT_APP_API_URL=https://natralha.onrender.com
```

**Onde configurar:**
- Vercel Dashboard > Settings > Environment Variables

---

### 2. Teste Direto

**Health Check (Recomendado):**
```
https://natralha.onrender.com/api/health
```

**Test Endpoint:**
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

---

### 3. Endpoints Disponíveis

- **Health Check:** `https://natralha.onrender.com/api/health`
- **Test:** `https://natralha.onrender.com/api/test`
- **Monitor:** `https://natralha.onrender.com/monitor.html`
- **Relatórios WhatsApp:** `https://natralha.onrender.com/api/escalacoes/reports/*`

---

**Versão:** v1.0.0  
**Última atualização:** 2025-01-27
