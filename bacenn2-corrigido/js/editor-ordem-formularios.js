/**
 * Editor de Ordem de Formulários - BacenN2
 * Versão: v1.0.0
 * 
 * Interface para editar a ordem de campos e seções nos formulários
 * usando drag and drop
 */

(function() {
  'use strict';

  /**
   * Classe para gerenciar o editor de ordem
   */
  class EditorOrdemFormularios {
    constructor() {
      this.tipoSelecionado = null;
      this.camposAtuais = [];
      this.modal = null;
      this.containerDragDrop = null;
    }

    /**
     * Abre o editor de ordem para um tipo de ficha
     * @param {String} tipo - Tipo da ficha: 'bacen', 'n2', ou 'chatbot'
     */
    async abrirEditor(tipo) {
      if (!['bacen', 'n2', 'chatbot'].includes(tipo)) {
        console.error('Tipo inválido:', tipo);
        return;
      }

      this.tipoSelecionado = tipo;
      
      // Obter campos/seções do formulário
      this.carregarCamposFormulario(tipo);
      
      // Criar e exibir modal
      this.criarModal();
      this.renderizarCampos();
    }

    /**
     * Carrega campos/seções do formulário baseado no tipo
     * @param {String} tipo - Tipo da ficha
     */
    carregarCamposFormulario(tipo) {
      // Definir campos padrão para cada tipo
      const camposPadrao = {
        bacen: [
          { id: 'cpf', label: 'CPF', tipo: 'campo', secao: 'dados_basicos' },
          { id: 'nome', label: 'Nome', tipo: 'campo', secao: 'dados_basicos' },
          { id: 'data_recebimento', label: 'Data de Recebimento', tipo: 'campo', secao: 'dados_basicos' },
          { id: 'prazo_bacen', label: 'Prazo BACEN', tipo: 'campo', secao: 'prazos' },
          { id: 'status', label: 'Status', tipo: 'campo', secao: 'status' },
          { id: 'observacoes', label: 'Observações', tipo: 'campo', secao: 'observacoes' }
        ],
        n2: [
          { id: 'cpf', label: 'CPF', tipo: 'campo', secao: 'dados_basicos' },
          { id: 'nome', label: 'Nome', tipo: 'campo', secao: 'dados_basicos' },
          { id: 'banco', label: 'Banco', tipo: 'campo', secao: 'dados_basicos' },
          { id: 'data_recebimento', label: 'Data de Recebimento', tipo: 'campo', secao: 'dados_basicos' },
          { id: 'status', label: 'Status', tipo: 'campo', secao: 'status' },
          { id: 'observacoes', label: 'Observações', tipo: 'campo', secao: 'observacoes' }
        ],
        chatbot: [
          { id: 'nome', label: 'Nome', tipo: 'campo', secao: 'dados_basicos' },
          { id: 'cpf', label: 'CPF', tipo: 'campo', secao: 'dados_basicos' },
          { id: 'canal', label: 'Canal', tipo: 'campo', secao: 'dados_basicos' },
          { id: 'data_recebimento', label: 'Data de Recebimento', tipo: 'campo', secao: 'dados_basicos' },
          { id: 'status', label: 'Status', tipo: 'campo', secao: 'status' },
          { id: 'observacoes', label: 'Observações', tipo: 'campo', secao: 'observacoes' }
        ]
      };

      // Carregar ordem salva se existir
      let campos = camposPadrao[tipo] || [];
      
      if (window.configuracaoOrdemFormularios && window.configuracaoOrdemFormularios.isReady) {
        const config = window.configuracaoOrdemFormularios.obterConfiguracao(tipo);
        if (config && config.ordemCampos) {
          campos = window.configuracaoOrdemFormularios.aplicarOrdem(tipo, campos);
        }
      }

      this.camposAtuais = campos;
    }

    /**
     * Cria o modal de edição
     */
    criarModal() {
      // Remover modal existente se houver
      const modalExistente = document.getElementById('modal-editor-ordem');
      if (modalExistente) {
        modalExistente.remove();
      }

      // Criar modal
      const modal = document.createElement('div');
      modal.id = 'modal-editor-ordem';
      modal.className = 'modal-editor-ordem';
      modal.innerHTML = `
        <div class="modal-editor-ordem-content">
          <div class="modal-editor-ordem-header">
            <h2>Editar Ordem do Formulário - ${this.tipoSelecionado.toUpperCase()}</h2>
            <button class="btn-fechar-modal" onclick="window.editorOrdemFormularios.fecharEditor()">×</button>
          </div>
          <div class="modal-editor-ordem-body">
            <p class="instrucoes-drag-drop">
              💡 Arraste os itens para reorganizar a ordem. A ordem será aplicada ao formulário de edição.
            </p>
            <div id="container-drag-drop" class="container-drag-drop">
              <!-- Campos serão renderizados aqui -->
            </div>
          </div>
          <div class="modal-editor-ordem-footer">
            <button class="btn-cancelar" onclick="window.editorOrdemFormularios.fecharEditor()">Cancelar</button>
            <button class="btn-salvar" onclick="window.editorOrdemFormularios.salvarOrdem()">Salvar Ordem</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      this.modal = modal;
      this.containerDragDrop = document.getElementById('container-drag-drop');

      // Adicionar estilos se não existirem
      this.adicionarEstilos();
    }

    /**
     * Renderiza os campos no container de drag and drop
     */
    renderizarCampos() {
      if (!this.containerDragDrop) return;

      this.containerDragDrop.innerHTML = '';

      this.camposAtuais.forEach((campo, index) => {
        const item = document.createElement('div');
        item.className = 'item-drag-drop';
        item.draggable = true;
        item.dataset.index = index;
        item.dataset.campoId = campo.id;
        
        item.innerHTML = `
          <div class="item-drag-drop-handle">
            <span class="icone-arrastar">☰</span>
            <span class="item-label">${campo.label}</span>
            <span class="item-tipo">${campo.secao || 'Geral'}</span>
          </div>
        `;

        // Event listeners para drag and drop
        item.addEventListener('dragstart', (e) => this.handleDragStart(e, index));
        item.addEventListener('dragover', (e) => this.handleDragOver(e));
        item.addEventListener('drop', (e) => this.handleDrop(e, index));
        item.addEventListener('dragend', (e) => this.handleDragEnd(e));

        this.containerDragDrop.appendChild(item);
      });
    }

    /**
     * Manipula início do arraste
     */
    handleDragStart(e, index) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', index);
      e.currentTarget.classList.add('arrastando');
    }

    /**
     * Manipula arraste sobre
     */
    handleDragOver(e) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      e.dataTransfer.dropEffect = 'move';
      e.currentTarget.classList.add('drag-over');
      return false;
    }

    /**
     * Manipula soltar
     */
    handleDrop(e, index) {
      if (e.stopPropagation) {
        e.stopPropagation();
      }

      e.currentTarget.classList.remove('drag-over');

      const origemIndex = parseInt(e.dataTransfer.getData('text/html'), 10);
      
      if (origemIndex !== index) {
        // Reordenar array
        const itemMovido = this.camposAtuais.splice(origemIndex, 1)[0];
        this.camposAtuais.splice(index, 0, itemMovido);
        
        // Re-renderizar
        this.renderizarCampos();
      }

      return false;
    }

    /**
     * Manipula fim do arraste
     */
    handleDragEnd(e) {
      e.currentTarget.classList.remove('arrastando');
      
      // Remover classe drag-over de todos os itens
      document.querySelectorAll('.item-drag-drop').forEach(item => {
        item.classList.remove('drag-over');
      });
    }

    /**
     * Salva a ordem atual
     */
    async salvarOrdem() {
      if (!window.configuracaoOrdemFormularios || !window.configuracaoOrdemFormularios.isReady) {
        alert('⚠️ Sistema de configuração não está pronto. Aguarde alguns instantes e tente novamente.');
        return;
      }

      try {
        const ordemCampos = this.camposAtuais.map(campo => campo.id);
        
        const configuracao = {
          ordemCampos: ordemCampos,
          campos: this.camposAtuais,
          tipo: this.tipoSelecionado
        };

        await window.configuracaoOrdemFormularios.salvarConfiguracao(
          this.tipoSelecionado,
          configuracao
        );

        alert('✅ Ordem salva com sucesso!');
        this.fecharEditor();
      } catch (error) {
        console.error('❌ Erro ao salvar ordem:', error);
        alert('❌ Erro ao salvar ordem. Verifique o console para mais detalhes.');
      }
    }

    /**
     * Fecha o editor
     */
    fecharEditor() {
      if (this.modal) {
        this.modal.remove();
        this.modal = null;
        this.containerDragDrop = null;
      }
    }

    /**
     * Adiciona estilos CSS necessários
     */
    adicionarEstilos() {
      if (document.getElementById('estilos-editor-ordem')) {
        return; // Estilos já adicionados
      }

      const style = document.createElement('style');
      style.id = 'estilos-editor-ordem';
      style.textContent = `
        .modal-editor-ordem {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
        }

        .modal-editor-ordem-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .modal-editor-ordem-header {
          padding: 20px;
          border-bottom: 1px solid #ddd;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-editor-ordem-header h2 {
          margin: 0;
          font-size: 1.5em;
          color: #333;
        }

        .btn-fechar-modal {
          background: none;
          border: none;
          font-size: 2em;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .btn-fechar-modal:hover {
          background: #f0f0f0;
        }

        .modal-editor-ordem-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        .instrucoes-drag-drop {
          background: #e3f2fd;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          color: #1976d2;
        }

        .container-drag-drop {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .item-drag-drop {
          background: #f9f9f9;
          border: 2px solid #ddd;
          border-radius: 6px;
          padding: 15px;
          cursor: move;
          transition: all 0.2s;
          user-select: none;
        }

        .item-drag-drop:hover {
          border-color: #1976d2;
          box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
        }

        .item-drag-drop.arrastando {
          opacity: 0.5;
          border-color: #1976d2;
        }

        .item-drag-drop.drag-over {
          border-color: #1976d2;
          background: #e3f2fd;
        }

        .item-drag-drop-handle {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .icone-arrastar {
          font-size: 1.5em;
          color: #999;
          cursor: grab;
        }

        .icone-arrastar:active {
          cursor: grabbing;
        }

        .item-label {
          flex: 1;
          font-weight: 500;
          color: #333;
        }

        .item-tipo {
          background: #e0e0e0;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.85em;
          color: #666;
        }

        .modal-editor-ordem-footer {
          padding: 20px;
          border-top: 1px solid #ddd;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .btn-cancelar,
        .btn-salvar {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1em;
          transition: all 0.2s;
        }

        .btn-cancelar {
          background: #f5f5f5;
          color: #666;
        }

        .btn-cancelar:hover {
          background: #e0e0e0;
        }

        .btn-salvar {
          background: #1976d2;
          color: white;
        }

        .btn-salvar:hover {
          background: #1565c0;
        }

        .seletor-tipo-ficha {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
        }

        .btn-tipo-ficha {
          flex: 1;
          padding: 15px;
          border: 2px solid #ddd;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 1em;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-tipo-ficha:hover {
          border-color: #1976d2;
          background: #e3f2fd;
        }

        .btn-tipo-ficha.ativo {
          border-color: #1976d2;
          background: #1976d2;
          color: white;
        }
      `;

      document.head.appendChild(style);
    }
  }

  // Instância global
  window.editorOrdemFormularios = new EditorOrdemFormularios();

  /**
   * Função global para abrir editor de ordem
   * @param {String} tipo - Tipo da ficha: 'bacen', 'n2', ou 'chatbot'
   */
  window.abrirEditorOrdemFormulario = function(tipo) {
    if (window.editorOrdemFormularios) {
      window.editorOrdemFormularios.abrirEditor(tipo);
    } else {
      console.error('Editor de ordem não está disponível');
    }
  };

})();
