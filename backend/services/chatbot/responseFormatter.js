// Response Formatter Service - Sistema de formatação consistente de respostas
// VERSION: v1.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team

class ResponseFormatter {
  constructor() {
    this.formattingRules = {
      // Quebras de linha
      normalizeLineBreaks: true,
      maxConsecutiveBreaks: 2,
      
      // Listas
      formatNumberedLists: true,
      formatBulletLists: true,
      
      // Caracteres especiais
      fixSpecialChars: true,
      fixEncoding: true,
      
      // Markdown
      preserveMarkdown: true,
      convertHtmlToMarkdown: true,
      
      // Links
      formatLinks: true,
      
      // Parágrafos
      maxParagraphLength: 4,
      minParagraphSpacing: 2
    };
  }

  /**
   * Formata resposta do cache Bot_perguntas
   * @param {string} response - Resposta bruta do cache
   * @param {string} source - Fonte da resposta
   * @returns {string} Resposta formatada
   */
  formatCacheResponse(response, source = 'bot_perguntas') {
    if (!response || typeof response !== 'string') {
      return response || '';
    }

    console.log(`🔧 ResponseFormatter: Formatando resposta do cache (${source})`);
    
    let formattedResponse = response;

    // 1. Corrigir encoding e caracteres especiais
    formattedResponse = this._fixSpecialChars(formattedResponse);
    
    // 2. Normalizar quebras de linha
    formattedResponse = this._normalizeLineBreaks(formattedResponse);
    
    // 3. Formatar listas numeradas
    formattedResponse = this._formatNumberedLists(formattedResponse);
    
    // 4. Formatar listas com bullets
    formattedResponse = this._formatBulletLists(formattedResponse);
    
    // 5. Formatar links
    formattedResponse = this._formatLinks(formattedResponse);
    
    // 6. Converter HTML para Markdown
    formattedResponse = this._convertHtmlToMarkdown(formattedResponse);
    
    // 7. Otimizar parágrafos
    formattedResponse = this._optimizeParagraphs(formattedResponse);

    console.log(`✅ ResponseFormatter: Resposta formatada (${formattedResponse.length} chars)`);
    
    return formattedResponse;
  }

  /**
   * Formata resposta da IA
   * @param {string} response - Resposta da IA
   * @param {string} provider - Provedor da IA
   * @returns {string} Resposta formatada
   */
  formatAIResponse(response, provider = 'openai') {
    if (!response || typeof response !== 'string') {
      return response || '';
    }

    console.log(`🔧 ResponseFormatter: Formatando resposta da IA (${provider})`);
    
    let formattedResponse = response;

    // Respostas da IA geralmente já vêm bem formatadas
    // Aplicar apenas correções básicas
    
    // 1. Corrigir encoding
    formattedResponse = this._fixSpecialChars(formattedResponse);
    
    // 2. Normalizar quebras de linha excessivas
    formattedResponse = this._normalizeLineBreaks(formattedResponse);
    
    // 3. Preservar markdown da IA
    formattedResponse = this._preserveMarkdown(formattedResponse);

    console.log(`✅ ResponseFormatter: Resposta IA formatada (${formattedResponse.length} chars)`);
    
    return formattedResponse;
  }

  /**
   * Formata resposta de fallback
   * @param {string} response - Resposta de fallback
   * @returns {string} Resposta formatada
   */
  formatFallbackResponse(response) {
    if (!response || typeof response !== 'string') {
      return response || '';
    }

    console.log(`🔧 ResponseFormatter: Formatando resposta de fallback`);
    
    // Aplicar formatação completa para fallback
    return this.formatCacheResponse(response, 'fallback');
  }

  /**
   * Normaliza formatação independente da fonte
   * @param {string} response - Resposta a normalizar
   * @param {string} source - Fonte da resposta
   * @returns {string} Resposta normalizada
   */
  normalizeResponse(response, source = 'unknown') {
    if (!response || typeof response !== 'string') {
      return response || '';
    }

    switch (source) {
      case 'ai':
      case 'openai':
      case 'gemini':
        return this.formatAIResponse(response, source);
      
      case 'bot_perguntas':
      case 'cache':
        return this.formatCacheResponse(response, source);
      
      case 'fallback':
      case 'no_results':
        return this.formatFallbackResponse(response);
      
      default:
        return this.formatCacheResponse(response, source);
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS DE FORMATAÇÃO
  // ========================================

  /**
   * Corrige caracteres especiais e encoding
   * @private
   */
  _fixSpecialChars(text) {
    if (!this.formattingRules.fixSpecialChars) return text;

    return text
      // Corrigir encoding comum
      .replace(/\\u00e1/g, 'á')
      .replace(/\\u00e9/g, 'é')
      .replace(/\\u00ed/g, 'í')
      .replace(/\\u00f3/g, 'ó')
      .replace(/\\u00fa/g, 'ú')
      .replace(/\\u00e3/g, 'ã')
      .replace(/\\u00f5/g, 'õ')
      .replace(/\\u00e7/g, 'ç')
      .replace(/\\u00c1/g, 'Á')
      .replace(/\\u00c9/g, 'É')
      .replace(/\\u00cd/g, 'Í')
      .replace(/\\u00d3/g, 'Ó')
      .replace(/\\u00da/g, 'Ú')
      .replace(/\\u00c3/g, 'Ã')
      .replace(/\\u00d5/g, 'Õ')
      .replace(/\\u00c7/g, 'Ç')
      
      // Corrigir outros caracteres especiais
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      
      // Remover caracteres de controle
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  }

  /**
   * Normaliza quebras de linha
   * @private
   */
  _normalizeLineBreaks(text) {
    if (!this.formattingRules.normalizeLineBreaks) return text;

    return text
      // Normalizar diferentes tipos de quebra de linha
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      
      // Limitar quebras consecutivas
      .replace(/\n{3,}/g, '\n\n')
      
      // Remover espaços no início e fim de linhas
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      
      // Remover linhas vazias no início e fim
      .replace(/^\n+/, '')
      .replace(/\n+$/, '');
  }

  /**
   * Formata listas numeradas
   * @private
   */
  _formatNumberedLists(text) {
    if (!this.formattingRules.formatNumberedLists) return text;

    // Padrão: "1. Item" ou "1) Item"
    return text.replace(/(\d+)[.)]\s*([^\n]+)/g, (match, number, content) => {
      return `${number}. ${content.trim()}`;
    });
  }

  /**
   * Formata listas com bullets
   * @private
   */
  _formatBulletLists(text) {
    if (!this.formattingRules.formatBulletLists) return text;

    // Padrão: "- Item" ou "* Item"
    return text.replace(/^[\s]*[-*]\s*([^\n]+)/gm, (match, content) => {
      return `• ${content.trim()}`;
    });
  }

  /**
   * Formata links
   * @private
   */
  _formatLinks(text) {
    if (!this.formattingRules.formatLinks) return text;

    // Converter URLs simples para markdown
    return text.replace(/(https?:\/\/[^\s]+)/g, (match, url) => {
      return `[${url}](${url})`;
    });
  }

  /**
   * Converte HTML para Markdown
   * @private
   */
  _convertHtmlToMarkdown(text) {
    if (!this.formattingRules.convertHtmlToMarkdown) return text;

    return text
      // Negrito
      .replace(/<b\b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<strong\b[^>]*>(.*?)<\/strong>/gi, '**$1**')
      
      // Itálico
      .replace(/<i\b[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<em\b[^>]*>(.*?)<\/em>/gi, '*$1*')
      
      // Quebras de linha
      .replace(/<br\s*\/?>/gi, '\n')
      
      // Parágrafos
      .replace(/<p\b[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      
      // Listas
      .replace(/<li\b[^>]*>(.*?)<\/li>/gi, '• $1\n')
      
      // Remover outras tags HTML
      .replace(/<[^>]+>/g, '');
  }

  /**
   * Preserva markdown da IA
   * @private
   */
  _preserveMarkdown(text) {
    // Apenas normalizar quebras de linha excessivas
    return text.replace(/\n{3,}/g, '\n\n');
  }

  /**
   * Otimiza parágrafos
   * @private
   */
  _optimizeParagraphs(text) {
    const lines = text.split('\n');
    const optimizedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line) {
        optimizedLines.push(line);
      } else {
        // Adicionar quebra de parágrafo apenas se necessário
        if (optimizedLines.length > 0 && optimizedLines[optimizedLines.length - 1] !== '') {
          optimizedLines.push('');
        }
      }
    }
    
    return optimizedLines.join('\n').replace(/\n{3,}/g, '\n\n');
  }

  /**
   * Testa a formatação com exemplo
   * @returns {Object} Resultado do teste
   */
  testFormatting() {
    const testCases = [
      {
        name: 'Lista numerada',
        input: '1) Acesse o portal\n2) Preencha os dados\n3) Envie documentos',
        expected: '1. Acesse o portal\n2. Preencha os dados\n3. Envie documentos'
      },
      {
        name: 'Caracteres especiais',
        input: 'Para solicitar o cr\\u00e9dito trabalhador',
        expected: 'Para solicitar o crédito trabalhador'
      },
      {
        name: 'Quebras de linha excessivas',
        input: 'Texto\n\n\n\n\nMais texto',
        expected: 'Texto\n\nMais texto'
      }
    ];

    const results = testCases.map(testCase => {
      const result = this.formatCacheResponse(testCase.input);
      return {
        name: testCase.name,
        input: testCase.input,
        expected: testCase.expected,
        result: result,
        success: result === testCase.expected
      };
    });

    console.log('🧪 ResponseFormatter: Testes de formatação:', results);
    
    return {
      total: testCases.length,
      passed: results.filter(r => r.success).length,
      results: results
    };
  }
}

module.exports = new ResponseFormatter();
