/**
 * Configuração de Ordem de Formulários - BacenN2
 * Versão: v1.0.0
 * 
 * Gerencia a ordem personalizada de campos e seções nos formulários
 * de edição de fichas (chatbot, bacen, n2)
 */

(function() {
  'use strict';

  /**
   * Classe para gerenciar configuração de ordem de formulários
   */
  class ConfiguracaoOrdemFormularios {
    constructor() {
      this.firebaseDB = null;
      this.isReady = false;
      this.configuracoes = {
        bacen: null,
        n2: null,
        chatbot: null
      };
      
      // Aguardar Firebase estar pronto
      this.inicializar();
    }

    /**
     * Inicializa a classe aguardando Firebase
     */
    async inicializar() {
      try {
        // Aguardar Firebase Manager
        await this.aguardarFirebase();
        
        // Aguardar ArmazenamentoReclamacoes estar pronto
        await this.aguardarArmazenamento();
        
        // Carregar configurações salvas
        await this.carregarConfiguracoes();
        
        this.isReady = true;
        console.log('✅ ConfiguracaoOrdemFormularios inicializado');
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('configuracaoOrdemReady'));
      } catch (error) {
        console.error('❌ Erro ao inicializar ConfiguracaoOrdemFormularios:', error);
      }
    }

    /**
     * Aguarda Firebase estar pronto
     */
    aguardarFirebase() {
      return new Promise((resolve) => {
        if (window.firebaseManager && window.firebaseManager.getReady()) {
          this.firebaseDB = window.firebaseManager.getDatabase();
          resolve();
        } else if (window.firebaseManager) {
          window.firebaseManager.onReady(() => {
            this.firebaseDB = window.firebaseManager.getDatabase();
            resolve();
          });
        } else {
          const checkInterval = setInterval(() => {
            if (window.firebaseManager) {
              clearInterval(checkInterval);
              if (window.firebaseManager.getReady()) {
                this.firebaseDB = window.firebaseManager.getDatabase();
                resolve();
              } else {
                window.firebaseManager.onReady(() => {
                  this.firebaseDB = window.firebaseManager.getDatabase();
                  resolve();
                });
              }
            }
          }, 100);
        }
      });
    }

    /**
     * Aguarda ArmazenamentoReclamacoes estar pronto
     */
    aguardarArmazenamento() {
      return new Promise((resolve) => {
        if (window.armazenamentoReclamacoes && window.armazenamentoReclamacoes.isReady) {
          resolve();
        } else {
          window.addEventListener('armazenamentoReady', resolve, { once: true });
        }
      });
    }

    /**
     * Carrega configurações salvas do Firebase
     */
    async carregarConfiguracoes() {
      if (!this.firebaseDB) {
        console.warn('⚠️ Firebase não está pronto para carregar configurações');
        return;
      }

      try {
        const ref = this.firebaseDB.ref('configuracao_formularios');
        const snapshot = await ref.once('value');
        const dados = snapshot.val();

        if (dados) {
          this.configuracoes = {
            bacen: dados.bacen || null,
            n2: dados.n2 || null,
            chatbot: dados.chatbot || null
          };
          console.log('✅ Configurações carregadas do Firebase');
        } else {
          console.log('ℹ️ Nenhuma configuração encontrada, usando padrão');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar configurações:', error);
      }
    }

    /**
     * Salva configuração de ordem para um tipo de ficha
     * @param {String} tipo - Tipo da ficha: 'bacen', 'n2', ou 'chatbot'
     * @param {Object} ordem - Objeto com a ordem de campos e seções
     */
    async salvarConfiguracao(tipo, ordem) {
      if (!this.firebaseDB) {
        throw new Error('Firebase não está pronto');
      }

      if (!['bacen', 'n2', 'chatbot'].includes(tipo)) {
        throw new Error('Tipo inválido. Use: bacen, n2 ou chatbot');
      }

      try {
        const ref = this.firebaseDB.ref(`configuracao_formularios/${tipo}`);
        
        // Verificar se firebase está disponível
        const timestamp = (typeof firebase !== 'undefined' && firebase.database && firebase.database.ServerValue) 
          ? firebase.database.ServerValue.TIMESTAMP 
          : new Date().toISOString();
        
        await ref.set({
          ...ordem,
          atualizadoEm: timestamp
        });

        this.configuracoes[tipo] = ordem;
        console.log(`✅ Configuração de ordem salva para ${tipo}`);
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('configuracaoOrdemAtualizada', {
          detail: { tipo, ordem }
        }));
        
        return true;
      } catch (error) {
        console.error('❌ Erro ao salvar configuração:', error);
        throw error;
      }
    }

    /**
     * Obtém configuração de ordem para um tipo de ficha
     * @param {String} tipo - Tipo da ficha: 'bacen', 'n2', ou 'chatbot'
     * @returns {Object|null} Configuração de ordem ou null
     */
    obterConfiguracao(tipo) {
      if (!['bacen', 'n2', 'chatbot'].includes(tipo)) {
        throw new Error('Tipo inválido. Use: bacen, n2 ou chatbot');
      }

      return this.configuracoes[tipo];
    }

    /**
     * Aplica ordem personalizada a uma lista de campos/seções
     * @param {String} tipo - Tipo da ficha
     * @param {Array} campos - Array de campos/seções
     * @returns {Array} Array ordenado
     */
    aplicarOrdem(tipo, campos) {
      const config = this.obterConfiguracao(tipo);
      
      if (!config || !config.ordemCampos) {
        return campos; // Retorna ordem original se não houver configuração
      }

      const ordemMap = {};
      campos.forEach((campo, index) => {
        ordemMap[campo.id || campo.key || `campo_${index}`] = campo;
      });

      const camposOrdenados = [];
      config.ordemCampos.forEach(campoId => {
        if (ordemMap[campoId]) {
          camposOrdenados.push(ordemMap[campoId]);
          delete ordemMap[campoId];
        }
      });

      // Adicionar campos que não estavam na configuração
      Object.values(ordemMap).forEach(campo => {
        camposOrdenados.push(campo);
      });

      return camposOrdenados;
    }
  }

  // Instância global
  window.configuracaoOrdemFormularios = new ConfiguracaoOrdemFormularios();

})();
