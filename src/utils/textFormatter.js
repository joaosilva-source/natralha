// Text Formatter Utility - Sistema de formatação de texto para o frontend
// VERSION: v1.0.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team

/**
 * Formata texto de resposta do chatbot
 * @param {string} text - Texto a ser formatado
 * @param {string} source - Fonte da resposta (ai, bot_perguntas, etc.)
 * @returns {string} Texto formatado
 */
export const formatResponseText = (text, source = 'unknown') => {
  if (!text || typeof text !== 'string') {
    return text || '';
  }

  console.log(`🔧 TextFormatter: Formatando texto (${source}) - ${text.length} chars`);
  
  let formattedText = text;

  // 1. Processar JSON arrays (funcionalidade existente)
  formattedText = formatJsonArrays(formattedText);
  
  // 2. Formatar listas numeradas
  formattedText = formatNumberedLists(formattedText);
  
  // 3. Formatar listas com bullets
  formattedText = formatBulletLists(formattedText);
  
  // 4. Formatar quebras de linha
  formattedText = formatLineBreaks(formattedText);
  
  // 5. Formatar markdown básico
  formattedText = formatMarkdown(formattedText);
  
  // 6. Formatar links
  formattedText = formatLinks(formattedText);
  
  // 7. Limpar formatação excessiva
  formattedText = cleanExcessiveFormatting(formattedText);

  console.log(`✅ TextFormatter: Texto formatado (${formattedText.length} chars)`);
  
  return formattedText;
};

/**
 * Formata arrays JSON em listas numeradas
 * @private
 */
const formatJsonArrays = (text) => {
  // Se o texto contém JSON array, tentar parsear e formatar
  if (text.includes('[{') && text.includes('}]')) {
    try {
      // Tentar parsear o JSON
      const jsonData = JSON.parse(text);
      
      if (Array.isArray(jsonData)) {
        // Formatar como lista numerada
        return jsonData.map((item, index) => {
          const title = item.title || `Passo ${index + 1}`;
          const content = item.content || '';
          return `${index + 1}. **${title}**\n\n${content}`;
        }).join('\n\n');
      } else {
        return text;
      }
    } catch (error) {
      console.warn('⚠️ Erro ao parsear JSON:', error);
      // Se não conseguir parsear, tentar limpar manualmente
      return text.replace(/\[|\]|\{|\}/g, '').replace(/"/g, '').trim();
    }
  }
  
  return text;
};

/**
 * Formata listas numeradas simples
 * @private
 */
const formatNumberedLists = (text) => {
  // Padrão: "1. Item" ou "1) Item"
  return text.replace(/(\d+)[.)]\s*([^\n]+)/g, (match, number, content) => {
    return `${number}. ${content.trim()}`;
  });
};

/**
 * Formata listas com bullets
 * @private
 */
const formatBulletLists = (text) => {
  // Padrão: "- Item" ou "* Item"
  return text.replace(/^[\s]*[-*]\s*([^\n]+)/gm, (match, content) => {
    return `• ${content.trim()}`;
  });
};

/**
 * Formata quebras de linha
 * @private
 */
const formatLineBreaks = (text) => {
  return text
    // Normalizar quebras de linha
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
};

/**
 * Formata markdown básico
 * @private
 */
const formatMarkdown = (text) => {
  return text
    // Negrito
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Itálico
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Código inline
    .replace(/`(.*?)`/g, '<code>$1</code>')
    
    // Links markdown
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
};

/**
 * Formata links simples
 * @private
 */
const formatLinks = (text) => {
  // Converter URLs simples para links clicáveis
  return text.replace(/(https?:\/\/[^\s]+)/g, (match, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
};

/**
 * Limpa formatação excessiva
 * @private
 */
const cleanExcessiveFormatting = (text) => {
  return text
    // Remover tags HTML vazias
    .replace(/<(\w+)[^>]*>\s*<\/\1>/g, '')
    
    // Remover espaços excessivos
    .replace(/\s{3,}/g, ' ')
    
    // Limpar quebras de linha excessivas novamente
    .replace(/\n{3,}/g, '\n\n');
};

/**
 * Formata texto para exibição em cards de artigos
 * @param {string} content - Conteúdo do artigo
 * @param {number} maxLength - Comprimento máximo (padrão: 150)
 * @returns {string} Conteúdo formatado para card
 */
export const formatArticleContent = (content, maxLength = 150) => {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Primeiro formatar o texto
  let formattedContent = formatResponseText(content, 'article');
  
  // Remover HTML tags para preview
  formattedContent = formattedContent.replace(/<[^>]+>/g, '');
  
  // Truncar se necessário
  if (formattedContent.length > maxLength) {
    formattedContent = formattedContent.substring(0, maxLength).trim() + '...';
  }
  
  return formattedContent;
};

/**
 * Formata texto para exibição em preview
 * @param {string} text - Texto a ser formatado
 * @param {number} maxLength - Comprimento máximo
 * @returns {string} Texto formatado para preview
 */
export const formatPreviewText = (text, maxLength = 200) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Formatar o texto
  let formattedText = formatResponseText(text, 'preview');
  
  // Remover HTML tags para preview
  formattedText = formattedText.replace(/<[^>]+>/g, '');
  
  // Truncar se necessário
  if (formattedText.length > maxLength) {
    formattedText = formattedText.substring(0, maxLength).trim() + '...';
  }
  
  return formattedText;
};

/**
 * Testa a formatação com exemplos
 * @returns {Object} Resultado dos testes
 */
export const testTextFormatting = () => {
  const testCases = [
    {
      name: 'Lista numerada simples',
      input: '1) Acesse o portal\n2) Preencha os dados\n3) Envie documentos',
      expected: '1. Acesse o portal\n2. Preencha os dados\n3. Envie documentos'
    },
    {
      name: 'Lista com bullets',
      input: '- Item 1\n- Item 2\n- Item 3',
      expected: '• Item 1\n• Item 2\n• Item 3'
    },
    {
      name: 'Markdown básico',
      input: '**Texto em negrito** e *texto em itálico*',
      expected: '<strong>Texto em negrito</strong> e <em>texto em itálico</em>'
    },
    {
      name: 'Quebras de linha excessivas',
      input: 'Texto\n\n\n\n\nMais texto',
      expected: 'Texto\n\nMais texto'
    }
  ];

  const results = testCases.map(testCase => {
    const result = formatResponseText(testCase.input);
    return {
      name: testCase.name,
      input: testCase.input,
      expected: testCase.expected,
      result: result,
      success: result === testCase.expected
    };
  });

  console.log('🧪 TextFormatter: Testes de formatação:', results);
  
  return {
    total: testCases.length,
    passed: results.filter(r => r.success).length,
    results: results
  };
};

export default {
  formatResponseText,
  formatArticleContent,
  formatPreviewText,
  testTextFormatting
};
