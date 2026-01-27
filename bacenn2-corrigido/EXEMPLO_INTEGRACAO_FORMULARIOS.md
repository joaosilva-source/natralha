# 📝 Exemplo de Integração - Ordem de Formulários

<!-- VERSION: v1.0.0 | DATE: 2025-01-27 | AUTHOR: VeloHub Development Team -->

## 🎯 Objetivo

Este documento mostra como integrar o sistema de ordem personalizada de formulários nos arquivos existentes do projeto BacenN2.

## 📋 Passo a Passo

### 1. Adicionar Scripts nos Arquivos HTML

Adicione os scripts necessários nos arquivos `bacen.html`, `n2.html` e `chatbot.html`:

```html
<!-- No final do <body>, antes do fechamento -->
<!-- Scripts existentes -->
<script src="js/firebase-init.js"></script>
<script src="js/armazenamento-reclamacoes.js"></script>

<!-- NOVOS SCRIPTS -->
<script src="js/configuracao-ordem-formularios.js"></script>
<script src="js/editor-ordem-formularios.js"></script>
<script src="js/aplicar-ordem-formularios.js"></script>
<script src="js/botao-configuracao-formularios.js"></script>
```

### 2. Botão de Configuração (Automático)

O script `botao-configuracao-formularios.js` adiciona automaticamente um botão "⚙️ Configurar Ordem" nas páginas de edição, ao lado das outras opções. Não é necessário adicionar manualmente.

**Alternativa:** Se preferir adicionar manualmente:

```html
<!-- Exemplo: No header ou menu -->
<a href="configuracao-formularios.html" class="btn-configuracao">
  ⚙️ Configurar Ordem dos Formulários
</a>
```

### 3. Modificar Função de Renderização do Formulário BACEN

**Antes:**
```javascript
function renderizarFormularioBacen(ficha) {
  const container = document.getElementById('formulario-bacen');
  
  container.innerHTML = `
    <div class="campo">
      <label>CPF</label>
      <input type="text" id="cpf" value="${ficha.cpf || ''}">
    </div>
    <div class="campo">
      <label>Nome</label>
      <input type="text" id="nome" value="${ficha.nome || ''}">
    </div>
    <div class="campo">
      <label>Data de Recebimento</label>
      <input type="date" id="data_recebimento" value="${ficha.dataRecebimento || ''}">
    </div>
  `;
}
```

**Depois:**
```javascript
function renderizarFormularioBacen(ficha) {
  const container = document.getElementById('formulario-bacen');
  
  // Adicionar atributo data-tipo-formulario para identificação
  container.setAttribute('data-tipo-formulario', 'bacen');
  
  container.innerHTML = `
    <div class="campo" data-campo-id="cpf">
      <label>CPF</label>
      <input type="text" id="cpf" value="${ficha.cpf || ''}">
    </div>
    <div class="campo" data-campo-id="nome">
      <label>Nome</label>
      <input type="text" id="nome" value="${ficha.nome || ''}">
    </div>
    <div class="campo" data-campo-id="data_recebimento">
      <label>Data de Recebimento</label>
      <input type="date" id="data_recebimento" value="${ficha.dataRecebimento || ''}">
    </div>
    <div class="campo" data-campo-id="prazo_bacen">
      <label>Prazo BACEN</label>
      <input type="date" id="prazo_bacen" value="${ficha.prazoBacen || ''}">
    </div>
    <div class="campo" data-campo-id="status">
      <label>Status</label>
      <select id="status">
        <option value="pendente">Pendente</option>
        <option value="em_andamento">Em Andamento</option>
        <option value="concluido">Concluído</option>
      </select>
    </div>
    <div class="campo" data-campo-id="observacoes">
      <label>Observações</label>
      <textarea id="observacoes">${ficha.observacoes || ''}</textarea>
    </div>
  `;
  
  // Aplicar ordem personalizada
  if (window.aplicarOrdemFormulario) {
    window.aplicarOrdemFormulario('bacen', container);
  }
}
```

### 4. Modificar Função de Renderização do Formulário N2

```javascript
function renderizarFormularioN2(ficha) {
  const container = document.getElementById('formulario-n2');
  container.setAttribute('data-tipo-formulario', 'n2');
  
  container.innerHTML = `
    <div class="campo" data-campo-id="cpf">
      <label>CPF</label>
      <input type="text" id="cpf" value="${ficha.cpf || ''}">
    </div>
    <div class="campo" data-campo-id="nome">
      <label>Nome</label>
      <input type="text" id="nome" value="${ficha.nome || ''}">
    </div>
    <div class="campo" data-campo-id="banco">
      <label>Banco</label>
      <input type="text" id="banco" value="${ficha.banco || ''}">
    </div>
    <div class="campo" data-campo-id="data_recebimento">
      <label>Data de Recebimento</label>
      <input type="date" id="data_recebimento" value="${ficha.dataRecebimento || ''}">
    </div>
    <div class="campo" data-campo-id="status">
      <label>Status</label>
      <select id="status">
        <option value="pendente">Pendente</option>
        <option value="em_andamento">Em Andamento</option>
        <option value="concluido">Concluído</option>
      </select>
    </div>
    <div class="campo" data-campo-id="observacoes">
      <label>Observações</label>
      <textarea id="observacoes">${ficha.observacoes || ''}</textarea>
    </div>
  `;
  
  // Aplicar ordem personalizada
  if (window.aplicarOrdemFormulario) {
    window.aplicarOrdemFormulario('n2', container);
  }
}
```

### 5. Modificar Função de Renderização do Formulário Chatbot

```javascript
function renderizarFormularioChatbot(ficha) {
  const container = document.getElementById('formulario-chatbot');
  container.setAttribute('data-tipo-formulario', 'chatbot');
  
  container.innerHTML = `
    <div class="campo" data-campo-id="nome">
      <label>Nome</label>
      <input type="text" id="nome" value="${ficha.nome || ''}">
    </div>
    <div class="campo" data-campo-id="cpf">
      <label>CPF</label>
      <input type="text" id="cpf" value="${ficha.cpf || ''}">
    </div>
    <div class="campo" data-campo-id="canal">
      <label>Canal</label>
      <select id="canal">
        <option value="whatsapp">WhatsApp</option>
        <option value="telefone">Telefone</option>
        <option value="email">E-mail</option>
      </select>
    </div>
    <div class="campo" data-campo-id="data_recebimento">
      <label>Data de Recebimento</label>
      <input type="date" id="data_recebimento" value="${ficha.dataRecebimento || ''}">
    </div>
    <div class="campo" data-campo-id="status">
      <label>Status</label>
      <select id="status">
        <option value="pendente">Pendente</option>
        <option value="em_andamento">Em Andamento</option>
        <option value="concluido">Concluído</option>
      </select>
    </div>
    <div class="campo" data-campo-id="observacoes">
      <label>Observações</label>
      <textarea id="observacoes">${ficha.observacoes || ''}</textarea>
    </div>
  `;
  
  // Aplicar ordem personalizada
  if (window.aplicarOrdemFormulario) {
    window.aplicarOrdemFormulario('chatbot', container);
  }
}
```

## 🔄 Atualizar Campos no Editor

Se você adicionar novos campos aos formulários, atualize também o arquivo `js/editor-ordem-formularios.js`:

```javascript
carregarCamposFormulario(tipo) {
  const camposPadrao = {
    bacen: [
      { id: 'cpf', label: 'CPF', tipo: 'campo', secao: 'dados_basicos' },
      { id: 'nome', label: 'Nome', tipo: 'campo', secao: 'dados_basicos' },
      { id: 'data_recebimento', label: 'Data de Recebimento', tipo: 'campo', secao: 'dados_basicos' },
      { id: 'prazo_bacen', label: 'Prazo BACEN', tipo: 'campo', secao: 'prazos' },
      { id: 'status', label: 'Status', tipo: 'campo', secao: 'status' },
      { id: 'observacoes', label: 'Observações', tipo: 'campo', secao: 'observacoes' },
      // ADICIONAR NOVOS CAMPOS AQUI
      { id: 'novo_campo', label: 'Novo Campo', tipo: 'campo', secao: 'dados_basicos' }
    ],
    // ... outros tipos
  };
  // ...
}
```

## ✅ Checklist de Integração

- [ ] Scripts adicionados em todos os arquivos HTML (bacen.html, n2.html, chatbot.html)
- [ ] Link para página de configuração adicionado
- [ ] Atributo `data-campo-id` adicionado em todos os campos
- [ ] Atributo `data-tipo-formulario` adicionado nos containers
- [ ] Função `aplicarOrdemFormulario()` chamada após renderizar
- [ ] Campos atualizados no `editor-ordem-formularios.js`
- [ ] Testado em todos os tipos de ficha

## 🎨 Estilização Opcional

Você pode adicionar estilos CSS para melhorar a aparência:

```css
.campo[data-campo-id] {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: all 0.2s;
}

.campo[data-campo-id]:hover {
  border-color: #1976d2;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

## 🐛 Troubleshooting

### Ordem não é aplicada
- Verifique se `aplicarOrdemFormulario()` está sendo chamada após renderizar
- Verifique se todos os campos têm `data-campo-id`
- Verifique console para erros

### Campos não aparecem no editor
- Verifique se os campos estão definidos em `carregarCamposFormulario()`
- Verifique se os IDs dos campos correspondem aos `data-campo-id`

---

**Versão:** v1.0.0  
**Última atualização:** 2025-01-27
