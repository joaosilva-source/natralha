// AI Service - Integração híbrida com IA para respostas inteligentes
// VERSION: v2.1.0 | DATE: 2025-01-27 | AUTHOR: Lucas Gravina - VeloHub Development Team
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config');

class AIService {
  constructor() {
    this.openai = null;
    this.gemini = null;
    this.openaiModel = "gpt-4o-mini"; // Modelo otimizado para custo (fallback)
    this.geminiModel = "gemini-2.5-pro"; // Modelo Gemini 2.5 Pro (primário)
  }

  /**
   * Inicializa o cliente OpenAI apenas quando necessário
   */
  _initializeOpenAI() {
    if (!this.openai && this.isOpenAIConfigured()) {
      this.openai = new OpenAI({
        apiKey: config.OPENAI_API_KEY,
      });
    }
    return this.openai;
  }

  /**
   * Inicializa o cliente Gemini apenas quando necessário
   */
  _initializeGemini() {
    if (!this.gemini && this.isGeminiConfigured()) {
      this.gemini = new GoogleGenerativeAI(config.GEMINI_API_KEY);
    }
    return this.gemini;
  }

  /**
   * Gera resposta inteligente baseada na pergunta e contexto
   * FLUXO: Gemini (primário) → OpenAI (fallback) → Resposta padrão
   * @param {string} question - Pergunta do usuário
   * @param {string} context - Contexto da base de conhecimento
   * @param {Array} sessionHistory - Histórico da sessão
   * @param {string} userId - ID do usuário
   * @param {string} email - Email do usuário
   * @returns {Promise<Object>} Resposta com provider usado
   */
  async generateResponse(question, context = "", sessionHistory = [], userId = null, email = null) {
    try {
      // 1. TENTAR GEMINI PRIMEIRO (IA PRIMÁRIA)
      if (this.isGeminiConfigured()) {
        try {
          console.log(`🤖 AI Service: Tentando Gemini (primário) para usuário ${userId || 'anônimo'}`);
          const response = await this._generateWithGemini(question, context, sessionHistory, userId, email);
          return {
            response: response,
            provider: 'Gemini',
            model: this.geminiModel,
            success: true
          };
        } catch (geminiError) {
          console.warn('⚠️ AI Service: Gemini falhou, tentando OpenAI fallback:', geminiError.message);
        }
      }

      // 2. FALLBACK PARA OPENAI (IA SECUNDÁRIA)
      if (this.isOpenAIConfigured()) {
        try {
          console.log(`🤖 AI Service: Usando OpenAI (fallback) para usuário ${userId || 'anônimo'}`);
          const response = await this._generateWithOpenAI(question, context, sessionHistory, userId, email);
          return {
            response: response,
            provider: 'OpenAI',
            model: this.openaiModel,
            success: true
          };
        } catch (openaiError) {
          console.error('❌ AI Service: OpenAI também falhou:', openaiError.message);
        }
      }

      // 3. SE AMBOS FALHARAM
      throw new Error('Nenhuma API de IA disponível');
      
    } catch (error) {
      console.error('❌ AI Service Error:', error.message);
      
      // 4. FALLBACK PARA RESPOSTA PADRÃO
      return {
        response: `Desculpe, não consegui processar sua pergunta no momento. 
        Por favor, tente novamente ou entre em contato com nosso suporte.`,
        provider: 'Fallback',
        model: 'none',
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gera resposta usando Gemini (IA PRIMÁRIA)
   */
  async _generateWithGemini(question, context, sessionHistory, userId, email) {
    const gemini = this._initializeGemini();
    if (!gemini) {
      throw new Error('Falha ao inicializar cliente Gemini');
    }

    const model = gemini.getGenerativeModel({ model: this.geminiModel });
    
    // Construir prompt completo (system + user) otimizado para Gemini
    const systemPrompt = `### PERSONA
Você é o VeloBot, assistente oficial da Velotax. Responda com base no histórico de conversa e no contexto da base de conhecimento fornecidos. Sua função é formatar a resposta de forma que ela fique apropriada e profissional para o uso no atendimento a clientes. Sua resposta deverá ser diretamente a resposta esperada, sem "aberturas", concorrdancias com a solicitação, informação de que compreendeu nem nada do gênero. 

### REGRAS
- Se a nova pergunta for ambígua, use o histórico para entender o que o usuário quis dizer.
- Seja direto e claro, mas natural e prestativo.
- Se o usuário disser "não entendi", reformule sua última resposta de forma mais simples.
- Se não encontrar no contexto, diga: "Não encontrei essa informação na base de conhecimento disponível."
- Sempre responda em português do Brasil.
- Use o contexto fornecido para dar respostas precisas e relevantes.`;

    const userPrompt = this.buildOptimizedPrompt(question, context, sessionHistory);
    
    // Combinar system + user prompt para Gemini
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    console.log(`🤖 Gemini: Processando pergunta para usuário ${userId || 'anônimo'}`);
    
    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();
    
    console.log(`✅ Gemini: Resposta gerada com sucesso (${response.length} caracteres)`);
    
    return response;
  }

  /**
   * Gera resposta usando OpenAI (IA FALLBACK)
   */
  async _generateWithOpenAI(question, context, sessionHistory, userId, email) {
    const openai = this._initializeOpenAI();
    if (!openai) {
      throw new Error('Falha ao inicializar cliente OpenAI');
    }

    // Construir prompt otimizado (baseado no chatbot Vercel)
    const prompt = this.buildOptimizedPrompt(question, context, sessionHistory);
    
    console.log(`🤖 OpenAI: Processando pergunta para usuário ${userId || 'anônimo'}`);
    
    const completion = await openai.chat.completions.create({
      model: this.openaiModel,
      messages: [
        {
          role: "system",
          content: `### PERSONA
Você é o VeloBot, assistente oficial da Velotax. Responda com base no histórico de conversa e no contexto da base de conhecimento.

### REGRAS
- Se a nova pergunta for ambígua, use o histórico para entender o que o usuário quis dizer.
- Seja direto e claro, mas natural e prestativo.
- Se o usuário disser "não entendi", reformule sua última resposta de forma mais simples.
- Se não encontrar no contexto, diga: "Não encontrei essa informação na base de conhecimento disponível."
- Sempre responda em português do Brasil.
- Use o contexto fornecido para dar respostas precisas e relevantes.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1024,
    });

    const response = completion.choices[0].message.content;
    
    console.log(`✅ OpenAI: Resposta gerada com sucesso (${response.length} caracteres)`);
    
    return response;
  }

  /**
   * Constrói o prompt otimizado com contexto e histórico
   * @param {string} question - Pergunta atual
   * @param {string} context - Contexto da base de conhecimento
   * @param {Array} sessionHistory - Histórico da sessão
   * @returns {string} Prompt formatado
   */
  buildOptimizedPrompt(question, context, sessionHistory) {
    let prompt = `
### HISTÓRICO DE CONVERSA
${sessionHistory.length > 0 ? 
  sessionHistory.map(h => `${h.role}: ${h.content}`).join("\n") : 
  'Primeira pergunta da sessão.'}

### CONTEXTO DA BASE DE CONHECIMENTO
${context || "Nenhum contexto específico encontrado."}

### PERGUNTA ATUAL
"${question}"
`;

    return prompt;
  }

  /**
   * Constrói o prompt com contexto e histórico (método legado)
   * @param {string} question - Pergunta atual
   * @param {string} context - Contexto da base de conhecimento
   * @param {Array} sessionHistory - Histórico da sessão
   * @returns {string} Prompt formatado
   */
  buildPrompt(question, context, sessionHistory) {
    return this.buildOptimizedPrompt(question, context, sessionHistory);
  }

  /**
   * Verifica se a API OpenAI está configurada corretamente
   * @returns {boolean} Status da configuração
   */
  isOpenAIConfigured() {
    return !!config.OPENAI_API_KEY && config.OPENAI_API_KEY !== 'your_openai_api_key_here';
  }

  /**
   * Verifica se a API Gemini está configurada corretamente
   * @returns {boolean} Status da configuração
   */
  isGeminiConfigured() {
    return !!config.GEMINI_API_KEY && config.GEMINI_API_KEY !== 'your_gemini_api_key_here';
  }

  /**
   * Verifica se alguma API está configurada
   * @returns {boolean} Status da configuração
   */
  isConfigured() {
    return this.isOpenAIConfigured() || this.isGeminiConfigured();
  }

  /**
   * Obtém status das configurações de IA
   * @returns {Object} Status das configurações
   */
  getConfigurationStatus() {
    return {
      gemini: {
        configured: this.isGeminiConfigured(),
        model: this.geminiModel,
        priority: 'primary'
      },
      openai: {
        configured: this.isOpenAIConfigured(),
        model: this.openaiModel,
        priority: 'fallback'
      },
      anyAvailable: this.isConfigured()
    };
  }

  /**
   * Testa a conexão com as APIs de IA
   * @returns {Promise<Object>} Status das conexões
   */
  async testConnection() {
    const results = {
      gemini: { available: false, model: this.geminiModel, priority: 'primary' },
      openai: { available: false, model: this.openaiModel, priority: 'fallback' },
      anyAvailable: false
    };

    // Teste Gemini (primário)
    if (this.isGeminiConfigured()) {
      try {
        const gemini = this._initializeGemini();
        if (gemini) {
          const model = gemini.getGenerativeModel({ model: this.geminiModel });
          const result = await model.generateContent("Teste de conexão");
          results.gemini.available = true;
          console.log('✅ Gemini: Conexão testada com sucesso');
        }
      } catch (error) {
        console.error('❌ Gemini: Erro no teste de conexão:', error.message);
      }
    }

    // Teste OpenAI (fallback)
    if (this.isOpenAIConfigured()) {
      try {
        const openai = this._initializeOpenAI();
        if (openai) {
          const completion = await openai.chat.completions.create({
            model: this.openaiModel,
            messages: [{ role: "user", content: "Teste de conexão" }],
            max_tokens: 10,
          });
          results.openai.available = true;
          console.log('✅ OpenAI: Conexão testada com sucesso');
        }
      } catch (error) {
        console.error('❌ OpenAI: Erro no teste de conexão:', error.message);
      }
    }

    results.anyAvailable = results.gemini.available || results.openai.available;
    
    if (!results.anyAvailable) {
      console.warn('⚠️ Nenhuma API de IA disponível');
    }

    return results;
  }
}

module.exports = new AIService();
