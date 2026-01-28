// VERSION: v1.4.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'
import api from './api'

// Obter API Keys do ambiente
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

// Configurar Gemini AI
const configureGemini = () => {
  if (!GEMINI_API_KEY) {
    console.warn('⚠️ VITE_GEMINI_API_KEY não configurada')
    console.warn('⚠️ Verifique se a variável de ambiente VITE_GEMINI_API_KEY está definida')
    return null
  }
  
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    console.log('✅ Gemini AI configurado no frontend')
    return genAI
  } catch (error) {
    console.error('❌ Erro ao configurar Gemini AI:', error)
    return null
  }
}

// Configurar Groq AI (fallback)
const configureGroq = () => {
  // Verificar se Groq está disponível
  if (!Groq) {
    console.error('❌ Groq SDK não está disponível. Verifique se o pacote groq-sdk está instalado.')
    return null
  }
  
  // Verificar se a API key existe (deve vir de variável de ambiente)
  const apiKey = GROQ_API_KEY
  
  if (!apiKey || apiKey.trim() === '') {
    console.error('❌ Groq API Key não encontrada')
    return null
  }
  
  try {
    console.log('🔄 Configurando Groq AI com API Key...', {
      keyLength: apiKey.trim().length,
      keyPrefix: apiKey.trim().substring(0, 10) + '...'
    })
    // IMPORTANTE: dangerouslyAllowBrowser é necessário para usar Groq no frontend
    // Isso expõe a API key no código do cliente. Em produção, considere mover para o backend.
    const groq = new Groq({ 
      apiKey: apiKey.trim(),
      dangerouslyAllowBrowser: true 
    })
    console.log('✅ Groq AI configurado como fallback')
    return groq
  } catch (error) {
    console.error('❌ Erro ao configurar Groq AI:', error)
    console.error('❌ Detalhes do erro:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return null
  }
}

// Função para gerar relatório usando Groq via backend (fallback seguro)
const generateReportWithGroqBackend = async (prompt) => {
  try {
    console.log('🔄 Chamando backend Groq para gerar relatório...')
    
    // Usar axios já configurado para chamar o endpoint do backend
    const response = await api.post('/report/groq', { prompt })
    
    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error(response.data.error || 'Erro ao gerar relatório com Groq')
    }
  } catch (error) {
    console.error('❌ Erro ao gerar relatório com Groq via backend:', error)
    const errorMessage = error.response?.data?.error || error.message || 'Erro desconhecido ao chamar backend Groq'
    throw new Error(errorMessage)
  }
}

// Função auxiliar para retry com backoff exponencial
const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 5000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      // Verificar se é erro de quota (429) - verificar status code e mensagem
      const errorMessage = error.message || String(error)
      const errorStatus = error.status || error.statusCode || (error.response && error.response.status)
      const isQuotaError = errorStatus === 429 || (
        errorMessage && (
          errorMessage.includes('429') || 
          errorMessage.includes('quota') || 
          errorMessage.includes('Quota exceeded') ||
          errorMessage.includes('rate limit') ||
          errorMessage.includes('Rate limit')
        )
      )
      
      // Tentar extrair tempo de retry sugerido do erro
      let retryDelay = initialDelay * Math.pow(2, i)
      try {
        const errorStr = JSON.stringify(error)
        // Procurar por padrões como "retry in 38s" ou "wait 60 seconds"
        const retryMatch = errorStr.match(/retry.*?(\d+)\s*(?:s|sec|second)/i) || 
                          errorStr.match(/wait.*?(\d+)\s*(?:s|sec|second)/i) ||
                          errorStr.match(/(\d+)\s*(?:s|sec|second).*?retry/i)
        if (retryMatch) {
          const suggestedDelay = parseInt(retryMatch[1]) * 1000 // Converter para milissegundos
          if (suggestedDelay > retryDelay) {
            retryDelay = suggestedDelay
          }
        }
      } catch (e) {
        // Ignorar erros ao tentar extrair tempo de retry
      }
      
      if (isQuotaError && i < maxRetries - 1) {
        const waitSeconds = Math.ceil(retryDelay / 1000)
        const waitMinutes = Math.ceil(waitSeconds / 60)
        console.log(`⚠️ Quota excedida. Aguardando ${waitSeconds}s (${waitMinutes} min) antes de tentar novamente... (tentativa ${i + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        continue
      }
      throw error
    }
  }
}

// Gerar relatório executivo
export const generateExecutiveReport = async (data, filters = {}) => {
  try {
    if (!data || (typeof data === 'string' && data.trim().length === 0)) {
      return {
        success: false,
        error: 'Dados inválidos para gerar relatório'
      }
    }

    console.log('🔄 Inicializando Gemini AI no frontend...')
    const genAI = configureGemini()
    if (!genAI) {
      return {
        success: false,
        error: 'Gemini AI não configurado. Verifique VITE_GEMINI_API_KEY'
      }
    }

    // Limitar quantidade de dados para reduzir tokens (máximo 50 itens para evitar quota)
    let processedData = data
    if (Array.isArray(data) && data.length > 50) {
      console.log(`⚠️ Limitando dados de ${data.length} para 50 itens para reduzir tokens e evitar quota`)
      processedData = data.slice(0, 50)
    }

    // Preparar dados para o prompt incluindo rating quando disponível
    let dataSummary = ''
    let dataStats = {
      total: 0,
      socialNetworks: {},
      sentiments: {},
      contactReasons: {},
      ratings: []
    }
    
    if (typeof processedData === 'string') {
      dataSummary = processedData.substring(0, 2000)
    } else if (Array.isArray(processedData)) {
      dataStats.total = processedData.length
      
      // Criar resumo estruturado e calcular estatísticas
      const dataLines = processedData.map((item, index) => {
        if (typeof item === 'object') {
          // Coletar estatísticas - Normalizar nome da rede para evitar duplicatas
          const network = (item.socialNetwork || 'N/A').trim()
          const sentiment = (item.sentiment || 'N/A').trim()
          const reason = (item.contactReason || 'N/A').trim()
          const rating = item.rating || null
          
          // IMPORTANTE: Garantir que todas as redes sejam contabilizadas
          if (!dataStats.socialNetworks[network]) {
            dataStats.socialNetworks[network] = 0
          }
          dataStats.socialNetworks[network] = (dataStats.socialNetworks[network] || 0) + 1
          dataStats.sentiments[sentiment] = (dataStats.sentiments[sentiment] || 0) + 1
          dataStats.contactReasons[reason] = (dataStats.contactReasons[reason] || 0) + 1
          if (rating !== null && rating !== undefined) {
            dataStats.ratings.push(Number(rating))
          }
          
          const messageText = (item.messageText || '').substring(0, 100)
          return `${index + 1}. Rede: ${network} | Sentimento: ${sentiment} | Motivo: ${reason} | Rating: ${rating || 'N/A'} | Mensagem: ${messageText}`
        }
        return String(item).substring(0, 100)
      })
      
      // LOG: Verificar se todas as redes foram contabilizadas
      console.log('📊 [geminiService] Contagem de redes após processamento:', dataStats.socialNetworks)
      console.log('📊 [geminiService] Redes únicas encontradas:', Object.keys(dataStats.socialNetworks))
      
      dataSummary = dataLines.join('\n')
      
      // Limitar tamanho total do resumo
      if (dataSummary.length > 4000) {
        console.log(`⚠️ Resumo muito longo (${dataSummary.length} chars), truncando para 4000 caracteres`)
        dataSummary = dataSummary.substring(0, 4000) + '...'
      }
    } else if (typeof processedData === 'object') {
      dataSummary = JSON.stringify(processedData, null, 2).substring(0, 2000)
    } else {
      dataSummary = String(processedData).substring(0, 2000)
    }

    // Calcular estatísticas resumidas (com tratamento para arrays vazios)
    const mostActiveNetwork = Object.keys(dataStats.socialNetworks).length > 0
      ? Object.keys(dataStats.socialNetworks).reduce((a, b) => 
          dataStats.socialNetworks[a] > dataStats.socialNetworks[b] ? a : b)
      : 'N/A'
    const dominantSentiment = Object.keys(dataStats.sentiments).length > 0
      ? Object.keys(dataStats.sentiments).reduce((a, b) => 
          dataStats.sentiments[a] > dataStats.sentiments[b] ? a : b)
      : 'N/A'
    const mainReason = Object.keys(dataStats.contactReasons).length > 0
      ? Object.keys(dataStats.contactReasons).reduce((a, b) => 
          dataStats.contactReasons[a] > dataStats.contactReasons[b] ? a : b)
      : 'N/A'
    const avgRating = dataStats.ratings.length > 0 
      ? (dataStats.ratings.reduce((a, b) => a + b, 0) / dataStats.ratings.length).toFixed(2)
      : 'N/A'

    // Calcular percentuais reais de sentimento
    const positiveCount = dataStats.sentiments.Positivo || 0
    const neutralCount = dataStats.sentiments.Neutro || 0
    const negativeCount = dataStats.sentiments.Negativo || 0
    const total = dataStats.total
    
    const positivePercent = total > 0 ? ((positiveCount / total) * 100).toFixed(1) : '0.0'
    const neutralPercent = total > 0 ? ((neutralCount / total) * 100).toFixed(1) : '0.0'
    const negativePercent = total > 0 ? ((negativeCount / total) * 100).toFixed(1) : '0.0'

    // Identificar redes sociais presentes nos dados filtrados (RIGOR NOS DADOS)
    const networksInData = Object.keys(dataStats.socialNetworks).sort()
    const hasFilter = filters && filters.socialNetwork && filters.socialNetwork.trim() !== ''
    const filteredNetwork = hasFilter ? filters.socialNetwork : null
    
    // LOG DETALHADO: Verificar como as redes estão sendo identificadas
    console.log('🔍 [geminiService] Análise de redes sociais:', {
      dataStatsSocialNetworks: dataStats.socialNetworks,
      networksInData,
      hasFilter,
      filteredNetwork,
      totalItems: processedData.length,
      redesUnicasNosDados: Array.isArray(processedData) 
        ? [...new Set(processedData.map(item => item.socialNetwork).filter(Boolean))]
        : []
    })
    
    // Calcular dados por rede social (para quando não há filtro específico)
    const networkStats = {}
    if (Array.isArray(processedData)) {
      networksInData.forEach(network => {
        // Normalizar comparação para evitar problemas com espaços ou case
        const networkItems = processedData.filter(item => {
          const itemNetwork = (item.socialNetwork || 'N/A').trim()
          return itemNetwork === network
        })
        const networkTotal = networkItems.length
        const networkPositive = networkItems.filter(item => (item.sentiment || 'N/A').trim() === 'Positivo').length
        const networkNeutral = networkItems.filter(item => (item.sentiment || 'N/A').trim() === 'Neutro').length
        const networkNegative = networkItems.filter(item => (item.sentiment || 'N/A').trim() === 'Negativo').length
        
        networkStats[network] = {
          total: networkTotal,
          positive: networkPositive,
          neutral: networkNeutral,
          negative: networkNegative,
          positivePercent: networkTotal > 0 ? ((networkPositive / networkTotal) * 100).toFixed(1) : '0.0',
          neutralPercent: networkTotal > 0 ? ((networkNeutral / networkTotal) * 100).toFixed(1) : '0.0',
          negativePercent: networkTotal > 0 ? ((networkNegative / networkTotal) * 100).toFixed(1) : '0.0'
        }
        
        // LOG por rede para debug
        if (networkTotal > 0) {
          console.log(`📊 [geminiService] Stats para ${network}:`, networkStats[network])
        }
      })
    }
    
    // LOG DAS ESTATÍSTICAS POR REDE
    console.log('📊 [geminiService] Estatísticas por rede social:', networkStats)
    
    // Determinar quais redes devem ser analisadas no relatório
    let networksToAnalyze = networksInData
    let analysisInstruction = ''
    
    if (hasFilter && filteredNetwork) {
      // Se há filtro aplicado, mostrar APENAS a rede filtrada
      networksToAnalyze = [filteredNetwork]
      analysisInstruction = `Analise exclusivamente a plataforma ${filteredNetwork}. Não mencione outras redes sociais que não estejam presentes nos dados filtrados.`
      console.log('✅ [geminiService] Modo filtrado - Rede a analisar:', networksToAnalyze)
    } else {
      // Sem filtro - analisar todas as redes presentes nos dados
      analysisInstruction = `Analise todas as redes sociais presentes nos dados: ${networksToAnalyze.join(', ')}. Para cada rede social, apresente os dados de sentimento específicos dessa rede.`
      console.log('✅ [geminiService] Modo "Todas as redes" - Redes a analisar:', networksToAnalyze)
    }

    const prompt = `Contexto: Você é um Especialista em Customer Experience e Data Analytics. Sua tarefa é transformar dados brutos de interações (JSON/Bancos de Dados) em um Relatório Executivo de alto nível para a gestão.

Instruções de Formatação:
- Use Markdown com hierarquia clara seguindo padrões ABNT
- Evite uso excessivo de asteriscos (*) e símbolos de marcação desnecessários
- Use listas simples para garantir legibilidade e evitar quebras de página inadequadas
- Tom: Profissional, analítico e humano. Evite "encher linguiça"
- Foco: Insights acionáveis (o que os dados nos dizem para fazer?)

DADOS COLETADOS:
Total de interações: ${dataStats.total}
Rede mais ativa: ${mostActiveNetwork}
Sentimento predominante: ${dominantSentiment}
Motivo mais frequente: ${mainReason}
Média de avaliação Playstore: ${avgRating}
Redes sociais presentes nos dados: ${networksToAnalyze.join(', ')}

DETALHES DAS INTERAÇÕES:
${dataSummary}

ESTRUTURA OBRIGATÓRIA DO RELATÓRIO:
## 1. 🔍 Visão Geral (Diagnóstico Situacional)
${hasFilter && filteredNetwork 
  ? `Análise estratégica baseada no monitoramento de interações da rede social ${filteredNetwork}:`
  : `Análise estratégica baseada no monitoramento de interações do perfil selecionado:`
}
- Total interações: ${dataStats.total}
${hasFilter && filteredNetwork 
  ? `- Rede Social Analisada: ${filteredNetwork}`
  : `- Redes Sociais Analisadas: ${networksToAnalyze.join(', ')}`
}
- ⭐ Média de avaliação: ${avgRating} (PlayStore)
- 🎭 Feeling geral: ${dominantSentiment}
- 📈 Sendo:
    - Positivo: ${positivePercent}% (${positiveCount} interações)
    - Neutro: ${neutralPercent}% (${neutralCount} interações)
    - Negativo: ${negativePercent}% (${negativeCount} interações)

[QUEBRA DE PÁGINA - Inicie a próxima seção em uma nova página]

## 2. 🥧 Gráficos de Análise de Sentimento

${hasFilter && filteredNetwork 
  ? `Rede Social: ${filteredNetwork}

- Positivo: ${networkStats[filteredNetwork]?.positivePercent || '0.0'}% (${networkStats[filteredNetwork]?.positive || 0} interações)
- Neutro: ${networkStats[filteredNetwork]?.neutralPercent || '0.0'}% (${networkStats[filteredNetwork]?.neutral || 0} interações)
- Negativo: ${networkStats[filteredNetwork]?.negativePercent || '0.0'}% (${networkStats[filteredNetwork]?.negative || 0} interações)

Gráfico: O gráfico de pizza mostra a distribuição de sentimentos da rede social ${filteredNetwork}, com percentuais e quantidades de interações para cada sentimento (Positivo, Neutro, Negativo).`
  : (() => {
      // IMPORTANTE: Garantir que TODAS as redes presentes nos dados sejam incluídas
      const redesNoPrompt = networksToAnalyze.map(network => {
        const stats = networkStats[network] || { positivePercent: '0.0', neutralPercent: '0.0', negativePercent: '0.0', positive: 0, neutral: 0, negative: 0 }
        return `Rede Social: ${network}

- Positivo: ${stats.positivePercent}% (${stats.positive} interações)
- Neutro: ${stats.neutralPercent}% (${stats.neutral} interações)
- Negativo: ${stats.negativePercent}% (${stats.negative} interações)`
      }).join('\n\n')
      
      // LOG: Verificar quais redes estão sendo incluídas no prompt
      console.log('📝 [geminiService] Redes incluídas no prompt de gráficos:', {
        networksToAnalyze,
        quantidadeRedes: networksToAnalyze.length,
        redesComStats: Object.keys(networkStats),
        promptLength: redesNoPrompt.length
      })
      
      return redesNoPrompt + `

Gráfico: O gráfico de pizza mostra a distribuição de sentimentos por rede social, com percentuais e quantidades de interações para cada sentimento (Positivo, Neutro, Negativo) de todas as redes sociais analisadas.`
    })()
}


REGRAS RIGOROSAS DE FORMATAÇÃO:
- Use emojis nos títulos das seções (🔍, 🥧) e nos subtítulos conforme o exemplo fornecido
- NÃO use códigos de citação como [cite_start], [cite: ], [cite: Dados Coletados] ou qualquer outro formato de citação - escreva o texto diretamente sem códigos
- Use negrito (**texto**) com MODERAÇÃO - apenas para destacar palavras-chave muito importantes ou valores numéricos críticos
- Evite uso excessivo de asteriscos - prefira texto simples e claro
- Use listas simples com hífens (-) seguindo padrão ABNT
- NÃO use tabelas Markdown complexas - prefira listas com emojis
- Mantenha formatação limpa e profissional
- Mantenha o texto conciso para evitar quebras de página desnecessárias ou blocos de texto que fiquem cortados
- IMPORTANTE: Se os dados contiverem apenas uma rede social, não mencione outras redes que não estejam presentes nos dados filtrados
- Use os valores calculados fornecidos - não recalcule ou deixe placeholders
- NÃO inclua seções de "Ações para melhorar", "Action Plan", "Plano de Ação" ou "Conclusão" no relatório
- NÃO inclua seções de "Observação", "Observações" ou qualquer informação adicional além do especificado
- O relatório deve conter APENAS as seções especificadas acima (Visão Geral e Gráficos de Análise de Sentimento)
- ESTRUTURA CLARA: Mantenha parágrafos curtos (máximo 3-4 linhas), use quebras de linha adequadas
- HIERARQUIA VISUAL: Use apenas os níveis de título especificados (## para seções principais)
- LISTAS ORGANIZADAS: Use indentação consistente para listas aninhadas (2 espaços por nível)

IMPORTANTE:
- Seja específico e use os dados fornecidos
- Evite "encher linguiça" - vá direto ao ponto
- Mantenha o tom profissional, analítico e humano
- Use exemplos concretos extraídos dos dados quando possível
- Respeite rigorosamente os filtros aplicados - se os dados contêm apenas uma rede, foque exclusivamente nela
- NÃO adicione seções de recomendações, ações, conclusões ou observações - o relatório termina após a seção de Gráficos de Análise de Sentimento
- NÃO inclua qualquer texto adicional após a seção de Gráficos de Análise de Sentimento`

    // LOG FINAL: Verificar o prompt antes de enviar
    console.log('📋 [geminiService] Prompt completo (primeiros 2000 caracteres):', prompt.substring(0, 2000))
    console.log('📋 [geminiService] Resumo do prompt:', {
      totalCaracteres: prompt.length,
      redesMencionadas: networksToAnalyze,
      temFiltro: hasFilter,
      redeFiltrada: filteredNetwork,
      totalInteracoes: dataStats.total
    })
    
    console.log('🔄 Gerando relatório com Gemini AI...')
    
    // Tentar gerar com Gemini primeiro (com retry automático)
    const generateWithGemini = async () => {
      // Tentar modelos disponíveis em ordem de preferência
      const modelsToTry = ['gemini-1.5-pro-latest', 'gemini-1.5-pro', 'gemini-pro']
      let lastError = null
      
      for (const modelName of modelsToTry) {
        try {
          console.log(`🔄 Tentando modelo Gemini: ${modelName}`)
          const model = genAI.getGenerativeModel({ model: modelName })
          const result = await model.generateContent(prompt)
          console.log(`✅ Sucesso com modelo: ${modelName}`)
          return result.response.text()
        } catch (error) {
          console.warn(`⚠️ Modelo ${modelName} falhou:`, error.message)
          lastError = error
          // Se não for erro de modelo não encontrado, não tentar outros
          const errorMessage = error.message || String(error)
          if (!errorMessage.includes('404') && !errorMessage.includes('not found')) {
            throw error
          }
          continue
        }
      }
      
      // Se todos os modelos falharam, lançar o último erro
      throw lastError || new Error('Nenhum modelo Gemini disponível')
    }

    let report
    let usedFallback = false
    
    try {
      report = await retryWithBackoff(generateWithGemini)
      console.log('✅ Relatório gerado com sucesso usando Gemini AI')
    } catch (geminiError) {
      // Verificar se é erro de quota (429) ou modelo não encontrado (404) do Gemini
      const errorMessage = geminiError.message || String(geminiError)
      const errorStatus = geminiError.status || geminiError.statusCode || (geminiError.response && geminiError.response.status)
      const isQuotaError = errorStatus === 429 || (
        errorMessage && (
          errorMessage.includes('429') || 
          errorMessage.includes('quota') || 
          errorMessage.includes('Quota exceeded') ||
          errorMessage.includes('rate limit') ||
          errorMessage.includes('Rate limit')
        )
      )
      const isModelNotFoundError = errorStatus === 404 || (
        errorMessage && (
          errorMessage.includes('404') ||
          errorMessage.includes('not found') ||
          errorMessage.includes('is not found') ||
          errorMessage.includes('not supported')
        )
      )
      
      // Usar Groq como fallback se for erro de quota OU modelo não encontrado
      if (isQuotaError || isModelNotFoundError) {
        const errorType = isModelNotFoundError ? 'modelo não encontrado' : 'quota excedida'
        console.warn(`⚠️ Gemini ${errorType} (${errorStatus || 'erro'}). Tentando usar Groq como fallback...`)
        console.log('🔍 Verificando configuração do Groq...', {
          groqSDKAvailable: !!Groq,
          groqAPIKeyAvailable: !!GROQ_API_KEY,
          groqAPIKeyLength: GROQ_API_KEY?.length || 0
        })
        
        // Tentar usar Groq como fallback (primeiro tenta backend, depois frontend)
        try {
          // Primeiro tenta via backend
          try {
            report = await generateReportWithGroqBackend(prompt)
            usedFallback = true
            console.log('✅ Relatório gerado com sucesso usando Groq AI via backend (fallback)')
          } catch (backendError) {
            // Se backend falhar (404 ou outro erro), tenta frontend diretamente
            console.warn('⚠️ Backend Groq não disponível. Tentando usar Groq diretamente no frontend...')
            const groq = configureGroq()
            if (!groq) {
              throw new Error('Groq não configurado. Não é possível usar fallback.')
            }
            
            console.log('🔄 Gerando relatório com Groq AI (fallback direto no frontend)...')
            const completion = await groq.chat.completions.create({
              messages: [
                {
                  role: 'system',
                  content: 'Você é um consultor sênior de CX (Customer Experience). Escreva relatórios executivos narrativos, profissionais e humanos em formato Markdown.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              model: 'llama-3.1-8b-instant',
              temperature: 0.7,
              max_tokens: 4000
            })
            
            report = completion.choices[0]?.message?.content || ''
            usedFallback = true
            console.log('✅ Relatório gerado com sucesso usando Groq AI diretamente no frontend (fallback)')
          }
        } catch (groqError) {
          console.error('❌ Erro ao gerar relatório com Groq:', groqError)
          throw new Error(`Falha ao gerar relatório com ambos os provedores. Gemini: ${geminiError.message}, Groq: ${groqError.message}`)
        }
      } else {
        // Se não for erro de quota, relançar o erro original
        throw geminiError
      }
    }

    return {
      success: true,
      data: report,
      provider: usedFallback ? 'groq' : 'gemini',
      fallbackUsed: usedFallback
    }
  } catch (error) {
    console.error('❌ Erro ao gerar relatório executivo:', error)
    
    // Tratamento específico para erros de quota
    const errorMessage = error.message || String(error)
    const errorStatus = error.status || error.statusCode || (error.response && error.response.status)
    const isQuotaError = errorStatus === 429 || (
      errorMessage && (
        errorMessage.includes('429') || 
        errorMessage.includes('quota') || 
        errorMessage.includes('Quota exceeded') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('Rate limit')
      )
    )
    
    if (isQuotaError) {
      // Se chegou aqui, significa que tanto Gemini quanto Groq falharam
      // Tentar extrair informações do erro (tempo de retry sugerido)
      let retryInfo = ''
      try {
        const errorStr = JSON.stringify(error)
        // Procurar por padrões como "retry in 38s" ou "wait 60 seconds"
        const retryMatch = errorStr.match(/retry.*?(\d+)\s*(?:s|sec|second)/i) || 
                          errorStr.match(/wait.*?(\d+)\s*(?:s|sec|second)/i) ||
                          errorStr.match(/(\d+)\s*(?:s|sec|second).*?retry/i)
        if (retryMatch) {
          const waitSeconds = parseInt(retryMatch[1])
          const waitMinutes = Math.ceil(waitSeconds / 60)
          retryInfo = ` Aguarde aproximadamente ${waitMinutes} minuto(s) antes de tentar novamente.`
        }
      } catch (e) {
        // Ignorar erros ao extrair informações
      }
      
      return {
        success: false,
        error: `Quota da API do Gemini excedida e fallback (Groq) também falhou.${retryInfo} Por favor, aguarde alguns minutos e tente novamente. Verifique seu plano e billing no Google Cloud Console: https://console.cloud.google.com/`
      }
    }
    
    // Tratamento para outros erros
    return {
      success: false,
      error: error.message || 'Erro ao gerar relatório executivo'
    }
  }
}
