# 🔘 Integração do Botão de Configuração

<!-- VERSION: v1.0.0 | DATE: 2025-01-27 | AUTHOR: VeloHub Development Team -->

## 📋 Como Adicionar o Botão nas Páginas de Edição

### Opção 1: Automática (Recomendado)

Adicione o script `botao-configuracao-formularios.js` nos arquivos HTML:

```html
<!-- No final do <body>, após os outros scripts -->
<script src="js/botao-configuracao-formularios.js"></script>
```

O script detecta automaticamente onde adicionar o botão e o tipo de ficha.

### Opção 2: Manual

Adicione o botão manualmente onde desejar:

```html
<!-- Exemplo: Ao lado de outros botões -->
<div class="form-actions">
  <button onclick="salvarFicha()">Salvar</button>
  <button onclick="cancelar()">Cancelar</button>
  <!-- Adicionar aqui -->
  <button class="btn-config-ordem-formulario" onclick="window.abrirEditorOrdemFormulario('bacen')">
    ⚙️ Configurar Ordem
  </button>
</div>
```

### Opção 3: Programática

```javascript
// Em qualquer lugar do código
if (window.adicionarBotaoConfiguracao) {
  const container = document.querySelector('.form-actions'); // ou qualquer container
  window.adicionarBotaoConfiguracao('bacen', container); // ou 'n2', 'chatbot'
}
```

## 🎨 Estilização

O botão já vem com estilos padrão, mas você pode personalizar:

```css
.btn-config-ordem-formulario {
  padding: 8px 16px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  margin-left: 10px;
}

.btn-config-ordem-formulario:hover {
  background: #1565c0;
}
```

## ✅ Checklist

- [ ] Script `botao-configuracao-formularios.js` adicionado nos HTMLs
- [ ] Scripts de configuração também adicionados (configuracao-ordem-formularios.js, editor-ordem-formularios.js)
- [ ] Botão aparece nas páginas de edição
- [ ] Botão funciona corretamente ao clicar

---

**Versão:** v1.0.0  
**Última atualização:** 2025-01-27
