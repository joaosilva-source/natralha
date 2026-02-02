// VERSION: v1.2.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
let GoogleGenerativeAI = null;
try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (error) {
  console.error('⚠️ Módulo @google/generative-ai não encontrado:', error.message);
  console.error('⚠️ Funcionalidades de IA não estarão disponíveis');
}

let genAI = null;

// Inicializar Gemini AI
const configureGemini = () => {
  // Verificar módulo primeiro
  if (!GoogleGenerativeAI) {
    console.warn('⚠️ @google/generative-ai não disponível');
    return null;
  }

  // Verificar API Key dinamicamente (não apenas no carregamento do módulo)
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  // Logs detalhados para debug (sem mostrar o valor da chave por segurança)
  if (!GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY não configurada');
    console.warn('⚠️ Verifique se a variável de ambiente GEMINI_API_KEY está definida');
    console.warn('⚠️ Ambiente:', process.env.NODE_ENV || 'development');
    return null;
  }

  // Verificar se já foi inicializado
  if (!genAI) {
    try {
      console.log('🔄 Inicializando Gemini AI...');
      console.log('✅ GEMINI_API_KEY encontrada (tamanho:', GEMINI_API_KEY.length, 'caracteres)');
      genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      console.log('✅ Gemini AI configurado com sucesso');
      return genAI;
    } catch (error) {
      console.error('❌ Erro ao configurar Gemini AI:', error.message);
      console.error('❌ Stack trace:', error.stack);
      return null;
    }
  }

  // Retornar instância já inicializada
  return genAI;
};

// Analisar sentimento e motivo do contato
const analyzeSentimentAndReason = async (text) => {
  try {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return {
        success: false,
        error: 'Texto inválido para análise'
      };
    }

    if (!GoogleGenerativeAI) {
      return {
        success: false,
        error: 'Módulo @google/generative-ai não disponível',
        fallback: {
          sentiment: 'Neutro',
          reason: 'Suporte'
        }
      };
    }

    console.log('🔄 Tentando configurar Gemini AI para análise...');
    const ai = configureGemini();
    if (!ai) {
      const apiKeyStatus = process.env.GEMINI_API_KEY ? 'definida' : 'não definida';
      console.error('❌ Gemini AI não configurado');
      console.error('❌ Status GEMINI_API_KEY:', apiKeyStatus);
      console.error('❌ Status GoogleGenerativeAI:', GoogleGenerativeAI ? 'disponível' : 'não disponível');
      return {
        success: false,
        error: 'Gemini AI não configurado. Verifique GEMINI_API_KEY',
        fallback: {
          sentiment: 'Neutro',
          reason: 'Suporte'
        }
      };
    }
    console.log('✅ Gemini AI configurado e pronto para análise');

    // Usar gemini-1.5-flash que é mais rápido e amplamente disponível
    // Se não disponível, tentar gemini-1.5-pro como fallback
    let model;
    try {
      model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    } catch (error) {
      console.warn('⚠️ gemini-1.5-flash não disponível, tentando gemini-1.5-pro');
      model = ai.getGenerativeModel({ model: 'gemini-1.5-pro' });
    }
    
    const prompt = `Analise o seguinte texto de atendimento de rede social e retorne APENAS um JSON válido com:
1. "sentiment": (Positivo, Neutro ou Negativo)
2. "reason": (Produto, Suporte, Bug, Elogio, Reclamação, Oculto ou Outro)

Texto: "${text}"

Retorne APENAS o JSON, sem markdown, sem código, sem explicações. Exemplo:
{"sentiment": "Positivo", "reason": "Elogio"}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let content = response.text().trim();

    // Limpar a resposta para garantir que seja um JSON válido
    if (content.includes('```json')) {
      content = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      content = content.split('```')[1].split('```')[0].trim();
    }

    // Remover markdown se presente
    content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');

    try {
      const analysis = JSON.parse(content);
      
      // Validar estrutura
      const validSentiments = ['Positivo', 'Neutro', 'Negativo'];
      const validReasons = ['Produto', 'Suporte', 'Bug', 'Elogio', 'Reclamação', 'Oculto', 'Outro'];
      
      if (!validSentiments.includes(analysis.sentiment)) {
        analysis.sentiment = 'Neutro';
      }
      
      if (!validReasons.includes(analysis.reason)) {
        analysis.reason = 'Suporte';
      }

      return {
        success: true,
        data: {
          sentiment: analysis.sentiment,
          reason: analysis.reason
        }
      };
    } catch (parseError) {
      console.error('Erro ao parsear resposta do Gemini:', parseError);
      console.error('Conteúdo recebido:', content);
      return {
        success: false,
        error: 'Erro ao processar resposta da IA',
        fallback: {
          sentiment: 'Neutro',
          reason: 'Suporte'
        }
      };
    }
  } catch (error) {
    console.error('Erro na análise de IA:', error);
    return {
      success: false,
      error: error.message || 'Erro ao analisar texto com IA',
      fallback: {
        sentiment: 'Neutro',
        reason: 'Suporte'
      }
    };
  }
};

// Gerar relatório executivo
const generateExecutiveReport = async (data) => {
  try {
    if (!data || (typeof data === 'string' && data.trim().length === 0)) {
      return {
        success: false,
        error: 'Dados inválidos para gerar relatório'
      };
    }

    if (!GoogleGenerativeAI) {
      return {
        success: false,
        error: 'Módulo @google/generative-ai não disponível'
      };
    }

    console.log('🔄 Tentando configurar Gemini AI para gerar relatório...');
    const ai = configureGemini();
    if (!ai) {
      const apiKeyStatus = process.env.GEMINI_API_KEY ? 'definida' : 'não definida';
      console.error('❌ Gemini AI não configurado');
      console.error('❌ Status GEMINI_API_KEY:', apiKeyStatus);
      console.error('❌ Status GoogleGenerativeAI:', GoogleGenerativeAI ? 'disponível' : 'não disponível');
      console.error('❌ Ambiente:', process.env.NODE_ENV || 'development');
      return {
        success: false,
        error: 'Gemini AI não configurado. Verifique GEMINI_API_KEY'
      };
    }
    console.log('✅ Gemini AI configurado e pronto para gerar relatório');

    // Tentar modelos com sufixos completos primeiro (mais compatíveis)
    // Ordem: flash-001, flash, pro-001, pro
    const modelsToTry = [
      'gemini-1.5-flash-001',
      'gemini-1.5-flash',
      'gemini-1.5-pro-001',
      'gemini-1.5-pro',
      'gemini-pro' // Fallback final
    ];
    
    let model;
    let lastError = null;
    
    for (const modelName of modelsToTry) {
      try {
        model = ai.getGenerativeModel({ model: modelName });
        console.log(`✅ Usando modelo: ${modelName}`);
        break; // Modelo funcionou, sair do loop
      } catch (error) {
        console.warn(`⚠️ Modelo ${modelName} não disponível:`, error.message);
        lastError = error;
        // Continuar tentando próximo modelo
        continue;
      }
    }
    
    if (!model) {
      throw new Error(`Nenhum modelo Gemini disponível. Último erro: ${lastError?.message}`);
    }
    
    // Preparar dados para o prompt
    let dataSummary = '';
    if (typeof data === 'string') {
      dataSummary = data;
    } else if (Array.isArray(data)) {
      dataSummary = data.map(item => {
        if (typeof item === 'object') {
          return JSON.stringify(item);
        }
        return String(item);
      }).join('\n');
    } else if (typeof data === 'object') {
      dataSummary = JSON.stringify(data, null, 2);
    } else {
      dataSummary = String(data);
    }

    const prompt = `Contexto: Você é um Especialista em Customer Experience e Data Analytics. Sua tarefa é transformar dados brutos de interações (JSON/Bancos de Dados) em um Relatório Executivo de alto nível para a gestão.

Instruções de Formatação:
- Use Markdown com hierarquia clara
- Tom: Profissional, analítico e humano. Evite "encher linguiça"
- Foco: Insights acionáveis (o que os dados nos dizem para fazer?)

DADOS COLETADOS:
${dataSummary}

ESTRUTURA OBRIGATÓRIA DO RELATÓRIO:

# 📊 Relatório Executivo de CX: Performance e Diagnóstico

## 1. Visão Geral (Diagnóstico Situacional)
Sintetize os dados de interações coletados:
- **Amostra:** Total de interações coletadas
- **Score de Satisfação:** Média de avaliação (se disponível)
- **Sentimento Geral:** Apresente a distribuição completa (Positivo, Neutro, Negativo)
- **Canal Dominante:** Identifique qual canal concentra a maior parte do tráfego

## 2. Insights Estratégicos (Resumo Executivo)
Extraia 2 conclusões de alto impacto baseadas nos dados:
- O que a dominância de um canal ou sentimento revela sobre a marca hoje?

## 3. Análise Integrada: Plataforma e Sentimento
Relacione o volume de interações com o comportamento do usuário:
- Analise cada rede social (Instagram, Facebook, TikTok, Messenger, YouTube, PlayStore) em relação ao volume e sentimento
- Identifique tendências: onde estão os detratores? Qual plataforma tem melhor engajamento?
- Correlação entre sentimento e motivo do contato
- Padrões de comportamento por plataforma

## 4. Pontos de Atrito (Pain Points)
- **Gargalo Principal:** Detalhe o motivo mais frequente como principal detrator (se aplicável)
- **Contexto:** Liste as palavras-chave recorrentes nas mensagens dos clientes
- **Urgência:** Identifique a área que precisa de atenção imediata para estancar crises potenciais
- Principais dúvidas e problemas identificados

## 5. Action Plan (Recomendações Acionáveis)
Crie 2 ações objetivas seguindo o formato: **Verbo de ação + O que + Para que**

### Curto Prazo (Operacional):
- [Verbo de ação] + [O que fazer] + [Para que/Objetivo]

### Médio Prazo (Tático):
- [Verbo de ação] + [O que fazer] + [Para que/Objetivo]

## 6. Conclusão e Próximos Passos
Finalize com uma síntese dos achados e a recomendação prioritária.

IMPORTANTE:
- Seja específico e use os dados fornecidos
- Evite "encher linguiça" - vá direto ao ponto
- Forneça insights acionáveis e práticos
- Mantenha o tom profissional, analítico e humano
- Use exemplos concretos extraídos dos dados quando possível`;

    const result = await model.generateContent(prompt);
    const report = result.response.text();

    return {
      success: true,
      data: report
    };
  } catch (error) {
    console.error('Erro ao gerar relatório executivo:', error);
    
    // Verificar se é erro de modelo não encontrado (404)
    const errorMessage = error.message || String(error);
    const isModelNotFound = errorMessage.includes('404') || 
                           errorMessage.includes('not found') || 
                           errorMessage.includes('is not found');
    
    if (isModelNotFound) {
      return {
        success: false,
        error: 'Modelo Gemini não disponível. O sistema tentará usar Groq como fallback.',
        fallbackAvailable: true
      };
    }
    
    return {
      success: false,
      error: error.message || 'Erro ao gerar relatório executivo'
    };
  }
};

module.exports = {
  configureGemini,
  analyzeSentimentAndReason,
  generateExecutiveReport
};
