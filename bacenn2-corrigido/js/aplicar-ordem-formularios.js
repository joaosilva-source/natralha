/**
 * Aplicar Ordem de Formulários - BacenN2
 * Versão: v1.0.0
 * 
 * Aplica a ordem personalizada aos formulários de edição
 */

(function() {
  'use strict';

  /**
   * Aplica ordem personalizada a um formulário
   * @param {String} tipo - Tipo da ficha: 'bacen', 'n2', ou 'chatbot'
   * @param {HTMLElement} containerFormulario - Container do formulário
   */
  function aplicarOrdemFormulario(tipo, containerFormulario) {
    if (!window.configuracaoOrdemFormularios || !window.configuracaoOrdemFormularios.isReady) {
      console.warn('⚠️ Sistema de configuração não está pronto, usando ordem padrão');
      return;
    }

    const config = window.configuracaoOrdemFormularios.obterConfiguracao(tipo);
    
    if (!config || !config.ordemCampos) {
      console.log('ℹ️ Nenhuma configuração de ordem encontrada, usando ordem padrão');
      return;
    }

    try {
      // Obter todos os campos/seções do formulário
      const campos = Array.from(containerFormulario.querySelectorAll('[data-campo-id]'));
      
      if (campos.length === 0) {
        console.warn('⚠️ Nenhum campo encontrado no formulário');
        return;
      }

      // Criar mapa de campos por ID
      const camposMap = {};
      campos.forEach(campo => {
        const campoId = campo.getAttribute('data-campo-id');
        if (campoId) {
          camposMap[campoId] = campo;
        }
      });

      // Reordenar campos conforme configuração
      const camposOrdenados = [];
      config.ordemCampos.forEach(campoId => {
        if (camposMap[campoId]) {
          camposOrdenados.push(camposMap[campoId]);
          delete camposMap[campoId];
        }
      });

      // Adicionar campos que não estavam na configuração
      Object.values(camposMap).forEach(campo => {
        camposOrdenados.push(campo);
      });

      // Aplicar nova ordem ao DOM
      camposOrdenados.forEach(campo => {
        containerFormulario.appendChild(campo);
      });

      console.log(`✅ Ordem personalizada aplicada ao formulário ${tipo}`);
    } catch (error) {
      console.error('❌ Erro ao aplicar ordem:', error);
    }
  }

  /**
   * Função auxiliar para marcar campos com data-campo-id
   * Deve ser chamada ao renderizar os formulários
   * @param {HTMLElement} container - Container do formulário
   * @param {Object} mapeamentoCampos - Objeto mapeando IDs de campos para seletores
   */
  function marcarCamposFormulario(container, mapeamentoCampos) {
    Object.entries(mapeamentoCampos).forEach(([campoId, seletor]) => {
      const elemento = container.querySelector(seletor);
      if (elemento) {
        elemento.setAttribute('data-campo-id', campoId);
      }
    });
  }

  /**
   * Observa mudanças na configuração e reaplica ordem
   */
  function observarMudancasConfiguracao() {
    window.addEventListener('configuracaoOrdemAtualizada', (event) => {
      const { tipo } = event.detail;
      console.log(`🔄 Configuração atualizada para ${tipo}, reaplicando ordem...`);
      
      // Encontrar formulário correspondente e reaplicar ordem
      const container = document.querySelector(`[data-tipo-formulario="${tipo}"]`);
      if (container) {
        aplicarOrdemFormulario(tipo, container);
      }
    });
  }

  // Inicializar observação de mudanças
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observarMudancasConfiguracao);
  } else {
    observarMudancasConfiguracao();
  }

  // Expor funções globalmente
  window.aplicarOrdemFormulario = aplicarOrdemFormulario;
  window.marcarCamposFormulario = marcarCamposFormulario;

})();
