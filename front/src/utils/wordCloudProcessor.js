// VERSION: v1.0.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
// Processador de texto para Nuvem de Palavras

// Lista de stopwords em português
const STOPWORDS = [
  'que', 'e', 'de', 'a', 'o', 'para', 'com', 'em', 'um', 'uma', 'é', 'no', 'na', 
  'do', 'da', 'dos', 'das', 'por', 'se', 'mais', 'como', 'mas', 'foi', 'ao', 
  'ele', 'ela', 'nos', 'nas', 'pelo', 'pela', 'pelos', 'pelas', 'são', 'ser', 
  'ter', 'tem', 'está', 'estão', 'foram', 'será', 'serão', 'terá', 'terão', 
  'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses', 'essas', 'aquele', 
  'aquela', 'aqueles', 'aquelas', 'me', 'te', 'se', 'nos', 'vos', 'lhe', 'lhes', 
  'meu', 'minha', 'meus', 'minhas', 'teu', 'tua', 'teus', 'tuas', 'seu', 'sua', 
  'seus', 'suas', 'nosso', 'nossa', 'nossos', 'nossas', 'deles', 'delas', 'ao',
  'aos', 'às', 'pelo', 'pela', 'pelos', 'pelas', 'num', 'numa', 'nuns', 'numas',
  'dum', 'duma', 'duns', 'dumas', 'num', 'numa', 'nuns', 'numas', 'à', 'às',
  'pelo', 'pela', 'pelos', 'pelas', 'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas'
]

/**
 * Remove stopwords de um texto
 * @param {string} text - Texto a ser processado
 * @param {Array<string>} stopwords - Lista de stopwords
 * @returns {string} Texto sem stopwords
 */
export const removeStopwords = (text, stopwords = STOPWORDS) => {
  if (!text || typeof text !== 'string') return ''
  
  const words = text.toLowerCase().split(/\s+/)
  const filteredWords = words.filter(word => {
    const cleanWord = word.replace(/[.,!?;:()\[\]{}'"]/g, '')
    return cleanWord.length > 0 && !stopwords.includes(cleanWord)
  })
  
  return filteredWords.join(' ')
}

/**
 * Tokeniza um texto (separa palavras e remove pontuação)
 * @param {string} text - Texto a ser tokenizado
 * @returns {Array<string>} Array de palavras tokenizadas
 */
export const tokenizeText = (text) => {
  if (!text || typeof text !== 'string') return []
  
  // Converter para minúsculas e remover pontuação
  const cleaned = text.toLowerCase()
    .replace(/[.,!?;:()\[\]{}'"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  
  // Separar em palavras
  const words = cleaned.split(/\s+/)
  
  // Filtrar palavras muito curtas (< 3 caracteres) e muito longas (> 20 caracteres)
  return words.filter(word => word.length >= 3 && word.length <= 20)
}

/**
 * Conta a frequência de palavras em um array de mensagens
 * @param {Array<string>} messages - Array de textos de mensagens
 * @returns {Object} Objeto com palavras como chaves e frequências como valores
 */
export const countWordFrequency = (messages) => {
  if (!Array.isArray(messages) || messages.length === 0) return {}
  
  const frequency = {}
  
  messages.forEach(message => {
    if (!message || typeof message !== 'string') return
    
    const tokens = tokenizeText(message)
    const filteredTokens = tokens.filter(token => !STOPWORDS.includes(token))
    
    filteredTokens.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1
    })
  })
  
  return frequency
}

/**
 * Processa mensagens para gerar dados para WordCloud
 * @param {Array<Object>} messages - Array de objetos com propriedade messageText
 * @param {number} maxWords - Número máximo de palavras a retornar (padrão: 50)
 * @returns {Array<Object>} Array de objetos no formato { text: string, value: number }
 */
export const processMessagesForWordCloud = (messages, maxWords = 50) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return []
  }
  
  // Extrair todos os messageText
  const messageTexts = messages
    .map(item => item.messageText || item.message_text || '')
    .filter(text => text && typeof text === 'string' && text.trim().length > 0)
  
  if (messageTexts.length === 0) {
    return []
  }
  
  // Contar frequência de palavras
  const frequency = countWordFrequency(messageTexts)
  
  // Converter para array e ordenar por frequência
  const wordArray = Object.entries(frequency)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, maxWords)
  
  return wordArray
}
