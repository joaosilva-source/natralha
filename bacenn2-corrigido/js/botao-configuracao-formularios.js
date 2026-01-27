/**
 * Botão de Configuração de Formulários - BacenN2
 * Versão: v1.0.0
 * 
 * Adiciona botão para acessar configuração de ordem de formulários
 * nas páginas de edição
 */

(function() {
  'use strict';

  /**
   * Cria e adiciona botão de configuração nas páginas de edição
   * @param {String} tipo - Tipo da ficha atual: 'bacen', 'n2', ou 'chatbot'
   * @param {HTMLElement} container - Container onde adicionar o botão (ex: header, toolbar)
   */
  function adicionarBotaoConfiguracao(tipo, container) {
    if (!container) {
      console.warn('⚠️ Container não fornecido para adicionar botão de configuração');
      return;
    }

    // Verificar se botão já existe
    const botaoExistente = container.querySelector('.btn-config-ordem-formulario');
    if (botaoExistente) {
      return; // Botão já existe
    }

    // Criar botão
    const botao = document.createElement('button');
    botao.className = 'btn-config-ordem-formulario';
    botao.innerHTML = '⚙️ Configurar Ordem';
    botao.title = 'Configurar ordem de campos e seções do formulário';
    
    // Estilos inline
    botao.style.cssText = `
      padding: 8px 16px;
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9em;
      font-weight: 500;
      transition: all 0.2s;
      margin-left: 10px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    `;

    // Hover effect
    botao.addEventListener('mouseenter', () => {
      botao.style.background = '#1565c0';
      botao.style.transform = 'translateY(-1px)';
      botao.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    });

    botao.addEventListener('mouseleave', () => {
      botao.style.background = '#1976d2';
      botao.style.transform = 'translateY(0)';
      botao.style.boxShadow = 'none';
    });

    // Click handler
    botao.addEventListener('click', (e) => {
      e.preventDefault();
      abrirConfiguracao(tipo);
    });

    // Adicionar ao container
    container.appendChild(botao);
  }

  /**
   * Abre a página de configuração ou o editor diretamente
   * @param {String} tipo - Tipo da ficha
   */
  function abrirConfiguracao(tipo) {
    // Verificar se editor está disponível
    if (window.abrirEditorOrdemFormulario) {
      // Abrir editor diretamente
      window.abrirEditorOrdemFormulario(tipo);
    } else {
      // Abrir página de configuração
      window.location.href = 'configuracao-formularios.html';
    }
  }

  /**
   * Adiciona botão automaticamente em containers comuns
   */
  function adicionarBotaoAutomatico() {
    // Procurar por containers comuns onde o botão pode ser adicionado
    const seletores = [
      '.toolbar',
      '.header-actions',
      '.form-actions',
      '.btn-group',
      '[data-tipo-formulario]',
      'header',
      '.page-header'
    ];

    let containerEncontrado = null;
    let tipoEncontrado = null;

    // Procurar container e tipo
    seletores.forEach(seletor => {
      const elementos = document.querySelectorAll(seletor);
      elementos.forEach(el => {
        // Verificar se tem atributo data-tipo-formulario
        const tipo = el.getAttribute('data-tipo-formulario');
        if (tipo && ['bacen', 'n2', 'chatbot'].includes(tipo)) {
          containerEncontrado = el;
          tipoEncontrado = tipo;
        } else if (!containerEncontrado && (el.classList.contains('toolbar') || el.classList.contains('header-actions'))) {
          containerEncontrado = el;
        }
      });
    });

    // Se não encontrou, tentar detectar tipo pela URL ou página
    if (!tipoEncontrado) {
      const path = window.location.pathname;
      if (path.includes('bacen')) tipoEncontrado = 'bacen';
      else if (path.includes('n2')) tipoEncontrado = 'n2';
      else if (path.includes('chatbot')) tipoEncontrado = 'chatbot';
    }

    // Se encontrou container, adicionar botão
    if (containerEncontrado && tipoEncontrado) {
      adicionarBotaoConfiguracao(tipoEncontrado, containerEncontrado);
    } else if (containerEncontrado) {
      // Adicionar sem tipo específico (abre página de seleção)
      const botao = document.createElement('button');
      botao.className = 'btn-config-ordem-formulario';
      botao.innerHTML = '⚙️ Configurar Ordem';
      botao.style.cssText = `
        padding: 8px 16px;
        background: #1976d2;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9em;
        margin-left: 10px;
      `;
      botao.onclick = () => window.location.href = 'configuracao-formularios.html';
      containerEncontrado.appendChild(botao);
    }
  }

  // Aguardar DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(adicionarBotaoAutomatico, 500); // Delay para garantir que outros scripts carregaram
    });
  } else {
    setTimeout(adicionarBotaoAutomatico, 500);
  }

  // Expor função globalmente
  window.adicionarBotaoConfiguracao = adicionarBotaoConfiguracao;

})();
