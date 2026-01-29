# Correção do Erro "JavaScript heap out of memory" no Build

## 🚨 Problema Identificado

O build do frontend estava falhando com o erro:
```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

## ✅ Soluções Implementadas

### 1. Aumentar Limite de Memória do Node.js

**Arquivo:** `render.yaml`

Atualizado o `buildCommand` do frontend para incluir `NODE_OPTIONS`:

```yaml
buildCommand: npm install --legacy-peer-deps && NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

Isso aumenta o limite de memória do Node.js de ~2GB (padrão) para 4GB durante o build.

### 2. Otimização do Vite Config

**Arquivo:** `front/vite.config.js`

Alterações realizadas:

- **Minificação:** Alterado de `false` para `'esbuild'` (mais rápido e usa menos memória)
- **Sourcemap:** Desabilitado em produção (`sourcemap: false`) para economizar memória
- **Chunk Size Warning:** Aumentado para 1000KB
- **Vendor Chunks:** Adicionado chunk separado para utilitários grandes (xlsx, docx, jspdf)

### 3. Script Alternativo no package.json

**Arquivo:** `front/package.json`

Adicionado script alternativo:

```json
"build:prod": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
```

## 📋 Próximos Passos

1. **Fazer commit das alterações:**
   ```bash
   git add render.yaml front/vite.config.js front/package.json
   git commit -m "Corrigir erro de memória no build do frontend"
   git push origin main
   ```

2. **Aguardar deploy automático no Render**

3. **Monitorar os logs do build** para confirmar que o problema foi resolvido

## 🔍 Se o Problema Persistir

Se ainda houver problemas de memória:

1. **Aumentar ainda mais a memória:**
   ```yaml
   NODE_OPTIONS="--max-old-space-size=6144"  # 6GB
   ```

2. **Considerar upgrade do plano do Render:**
   - Starter Plan: ~512MB RAM
   - Standard Plan: Mais memória disponível

3. **Otimizar ainda mais o build:**
   - Reduzir dependências desnecessárias
   - Usar lazy loading para componentes grandes
   - Code splitting mais agressivo

## 📝 Notas Técnicas

- O erro ocorria durante a fase de "rendering chunks" do Vite
- O projeto tem muitas dependências grandes (plotly.js, MUI, etc.)
- O Starter Plan do Render tem limitações de memória
- A solução aumenta o limite de memória sem aumentar custos

---

**Versão:** v1.0.0  
**Data:** 2026-01-29  
**Autor:** VeloHub Development Team
