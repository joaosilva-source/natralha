# ⚙️ Configuração de Ordem de Formulários - BacenN2

<!-- VERSION: v1.0.0 | DATE: 2025-01-27 | AUTHOR: VeloHub Development Team -->

## 📋 Visão Geral

Este sistema permite personalizar a ordem de campos e seções nos formulários de edição de fichas (BACEN, N2 e Chatbot) através de uma interface de drag and drop.

## 🎯 Funcionalidades

- ✅ Seleção do tipo de ficha (BACEN, N2 ou Chatbot)
- ✅ Interface visual de drag and drop para reorganizar campos
- ✅ Salvamento da ordem personalizada no Firebase
- ✅ Aplicação automática da ordem nos formulários de edição

## 📁 Arquivos Criados

### 1. `js/configuracao-ordem-formularios.js`
Gerencia o salvamento e carregamento das configurações de ordem no Firebase.

**Funcionalidades:**
- Carrega configurações salvas do Firebase
- Salva novas configurações de ordem
- Aplica ordem personalizada a listas de campos

### 2. `js/editor-ordem-formularios.js`
Interface de edição com drag and drop para reorganizar campos.

**Funcionalidades:**
- Modal de edição de ordem
- Drag and drop nativo (HTML5)
- Visualização clara dos campos e seções
- Salvamento da ordem personalizada

### 3. `js/aplicar-ordem-formularios.js`
Aplica a ordem personalizada aos formulários de edição.

**Funcionalidades:**
- Aplica ordem aos formulários renderizados
- Observa mudanças na configuração
- Funções auxiliares para marcar campos

### 4. `configuracao-formularios.html`
Página de configuração para acessar o editor de ordem.

## 🚀 Como Usar

### 1. Incluir Scripts no HTML

Adicione os scripts na ordem correta nos arquivos HTML dos formulários:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>

<!-- Scripts do sistema -->
<script src="js/firebase-init.js"></script>
<script src="js/armazenamento-reclamacoes.js"></script>
<script src="js/configuracao-ordem-formularios.js"></script>
<script src="js/editor-ordem-formularios.js"></script>
<script src="js/aplicar-ordem-formularios.js"></script>
<script src="js/botao-configuracao-formularios.js"></script>
```

**Nota:** O último script (`botao-configuracao-formularios.js`) adiciona automaticamente um botão "⚙️ Configurar Ordem" nas páginas de edição, ao lado das outras opções.

### 2. Acessar Página de Configuração

Abra `configuracao-formularios.html` no navegador ou adicione um link nos seus arquivos HTML:

```html
<a href="configuracao-formularios.html">⚙️ Configurar Ordem dos Formulários</a>
```

### 3. Marcar Campos nos Formulários

Ao renderizar os formulários, marque os campos com `data-campo-id`:

```javascript
// Exemplo para formulário BACEN
function renderizarFormularioBacen(ficha) {
  const container = document.getElementById('formulario-bacen');
  
  container.innerHTML = `
    <div data-campo-id="cpf">
      <label>CPF</label>
      <input type="text" value="${ficha.cpf || ''}">
    </div>
    <div data-campo-id="nome">
      <label>Nome</label>
      <input type="text" value="${ficha.nome || ''}">
    </div>
    <!-- ... outros campos ... -->
  `;
  
  // Marcar campos e aplicar ordem
  window.marcarCamposFormulario(container, {
    cpf: '[data-campo-id="cpf"]',
    nome: '[data-campo-id="nome"]',
    // ... outros campos
  });
  
  // Aplicar ordem personalizada
  window.aplicarOrdemFormulario('bacen', container);
}
```

### 4. Usar no Editor de Ordem

Para abrir o editor programaticamente:

```javascript
// Abrir editor para tipo específico
window.abrirEditorOrdemFormulario('bacen');  // ou 'n2', 'chatbot'
```

## 📊 Estrutura de Dados no Firebase

As configurações são salvas em:

```
Firebase Realtime Database
└── configuracao_formularios/
    ├── bacen/
    │   ├── ordemCampos: ["cpf", "nome", "data_recebimento", ...]
    │   ├── campos: [{ id: "cpf", label: "CPF", ... }, ...]
    │   └── atualizadoEm: timestamp
    ├── n2/
    │   └── ...
    └── chatbot/
        └── ...
```

## 🔧 Personalização

### Adicionar Novos Campos

Edite `js/editor-ordem-formularios.js` na função `carregarCamposFormulario()`:

```javascript
bacen: [
  { id: 'cpf', label: 'CPF', tipo: 'campo', secao: 'dados_basicos' },
  { id: 'novo_campo', label: 'Novo Campo', tipo: 'campo', secao: 'dados_basicos' },
  // ...
]
```

### Modificar Estilos

Os estilos estão em `js/editor-ordem-formularios.js` na função `adicionarEstilos()`. Você pode:

- Modificar cores e espaçamentos
- Ajustar tamanho do modal
- Personalizar aparência dos itens arrastáveis

## ✅ Checklist de Implementação

- [ ] Scripts incluídos na ordem correta
- [ ] Firebase configurado e funcionando
- [ ] Campos marcados com `data-campo-id` nos formulários
- [ ] Função `aplicarOrdemFormulario()` chamada após renderizar formulários
- [ ] Link para página de configuração adicionado
- [ ] Testado em todos os tipos de ficha (BACEN, N2, Chatbot)

## 🐛 Troubleshooting

### Editor não abre
- Verifique se todos os scripts foram carregados
- Verifique console para erros
- Aguarde Firebase estar pronto antes de abrir

### Ordem não é aplicada
- Verifique se campos têm `data-campo-id`
- Verifique se `aplicarOrdemFormulario()` está sendo chamada
- Verifique console para erros

### Mudanças não são salvas
- Verifique conexão com Firebase
- Verifique regras de segurança do Firebase
- Verifique console para erros

## 📚 Referências

- [Firebase Realtime Database Docs](https://firebase.google.com/docs/database/web/start)
- [HTML5 Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)

---

**Versão:** v1.0.0  
**Última atualização:** 2025-01-27
