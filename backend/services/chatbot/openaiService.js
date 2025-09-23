// OpenAI Service - Integração com IA para respostas inteligentes
// VERSION: v2.0.1 | DATE: 2025-01-27 | AUTHOR: Lucas Gravina - VeloHub Development Team
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config');

class OpenAIService {
  constructor() {
    this.openai = null;
    this.gemini = null;
    this.openaiModel = "gpt-4o-mini"; // Modelo otimizado para custo
    this.geminiModel = "gemini-2.5-pro"; // Modelo Gemini 2.5 Pro
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
   * @param {string} question - Pergunta do usuário
   * @param {string} context - Contexto da base de conhecimento
   * @param {Array} sessionHistory - Histórico da sessão
   * @param {string} userId - ID do usuário
   * @param {string} email - Email do usuário
   * @returns {Promise<string>} Resposta gerada pela IA
   */
  async generateResponse(question, context = "", sessionHistory = [], userId = null, email = null) {
    try {
      // Tentar Gemini primeiro (primário)
      if (this.isGeminiConfigured()) {
        try {
          return await this._generateWithGemini(question, context, sessionHistory, userId, email);
        } catch (geminiError) {
          console.warn('⚠️ Gemini falhou, tentando OpenAI:', geminiError.message);
        }
      }

      // Fallback para OpenAI
      if (this.isOpenAIConfigured()) {
        try {
          return await this._generateWithOpenAI(question, context, sessionHistory, userId, email);
        } catch (openaiError) {
          console.error('❌ OpenAI também falhou:', openaiError.message);
        }
      }

      // Se ambos falharam
      throw new Error('Nenhuma API de IA disponível');
      
    } catch (error) {
      console.error('❌ AI Service Error:', error.message);
      
      // Fallback para resposta padrão
      return `Desculpe, não consegui processar sua pergunta no momento. 
      Por favor, tente novamente ou entre em contato com nosso suporte.`;
    }
  }

  /**
   * Gera resposta usando OpenAI
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
Você é o VeloBot, assistente oficial da Velotax. Responda com base no histórico de conversa, no contexto da planilha e nos sites autorizados.

### REGRAS
- Se a nova pergunta for ambígua, use o histórico para entender o que o atendente quis dizer.
- Seja direto e claro, mas natural.
- Se o atendente disser "não entendi", reformule sua última resposta de forma mais simples.
- Se não encontrar no contexto ou nos sites, diga: "Não encontrei essa informação nem na base de conhecimento nem nos sites oficiais."
- Sempre responda em português do Brasil.`
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
   * Gera resposta usando Gemini (Fallback)
   */
  async _generateWithGemini(question, context, sessionHistory, userId, email) {
    const gemini = this._initializeGemini();
    if (!gemini) {
      throw new Error('Falha ao inicializar cliente Gemini');
    }

    const model = gemini.getGenerativeModel({ model: this.geminiModel });
    
    // Construir prompt completo (system + user) igual ao OpenAI
    const systemPrompt = `### PERSONA
Você é o VeloBot, assistente oficial da Velotax. Responda com base no histórico de conversa, no contexto da planilha e nos sites autorizados.

### REGRAS
- Se a nova pergunta for ambígua, use o histórico para entender o que o atendente quis dizer.
- Seja direto e claro, mas natural.
- Se o atendente disser "não entendi", reformule sua última resposta de forma mais simples.
- Se não encontrar no contexto ou nos sites, diga: "Não encontrei essa informação nem na base de conhecimento nem nos sites oficiais."
- Sempre responda em português do Brasil.`;

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
   * Constrói o prompt otimizado com contexto e histórico (baseado no chatbot Vercel)
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

### CONTEXTO DA PLANILHA
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
   * Verifica se alguma API está configurada (método legado)
   * @returns {boolean} Status da configuração
   */
  isConfigured() {
    return this.isOpenAIConfigured() || this.isGeminiConfigured();
  }

  /**
   * Testa a conexão com as APIs de IA
   * @returns {Promise<Object>} Status das conexões
   */
  async testConnection() {
    const results = {
      openai: false,
      gemini: false,
      anyAvailable: false
    };

    // Teste OpenAI
    if (this.isOpenAIConfigured()) {
      try {
        const openai = this._initializeOpenAI();
        if (openai) {
          const completion = await openai.chat.completions.create({
            model: this.openaiModel,
            messages: [{ role: "user", content: "Teste de conexão" }],
            max_tokens: 10,
          });
          results.openai = true;
          console.log('✅ OpenAI: Conexão testada com sucesso');
        }
      } catch (error) {
        console.error('❌ OpenAI: Erro no teste de conexão:', error.message);
      }
    }

    // Teste Gemini
    if (this.isGeminiConfigured()) {
      try {
        const gemini = this._initializeGemini();
        if (gemini) {
          const model = gemini.getGenerativeModel({ model: this.geminiModel });
          const result = await model.generateContent("Teste de conexão");
          results.gemini = true;
          console.log('✅ Gemini: Conexão testada com sucesso');
        }
      } catch (error) {
        console.error('❌ Gemini: Erro no teste de conexão:', error.message);
      }
    }

    results.anyAvailable = results.openai || results.gemini;
    
    if (!results.anyAvailable) {
      console.warn('⚠️ Nenhuma API de IA disponível');
    }

    return results;
  }
}

module.exports = new OpenAIService();
