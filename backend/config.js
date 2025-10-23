// Configuração do VeloHub V3 - Baseada em Variáveis de Ambiente
// VERSION: v1.2.0 | DATE: 2025-01-10 | AUTHOR: Lucas Gravina - VeloHub Development Team

module.exports = {
  // ===========================================
  // APIs DE INTELIGÊNCIA ARTIFICIAL
  // ===========================================
  
  // OpenAI API Key (para fallback)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  
  // Google Gemini API Key (IA primária)
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  
  // ===========================================
  // BANCO DE DADOS
  // ===========================================
  
  // MongoDB Connection String
  MONGODB_URI: process.env.MONGO_ENV,
  
  // ===========================================
  // GOOGLE SERVICES
  // ===========================================
  
  // Google OAuth (para SSO)
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  
  
  // ===========================================
  // CONFIGURAÇÕES DO SERVIDOR
  // ===========================================
  
  // Ambiente de execução
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Porta do servidor
  PORT: process.env.PORT || 8080,
  
  
  // ===========================================
  // CONFIGURAÇÕES OPCIONAIS
  // ===========================================
  
  // Ponto Mais API (se necessário)
  PONTO_MAIS_API_KEY: process.env.PONTO_MAIS_API_KEY,
  PONTO_MAIS_COMPANY_ID: process.env.PONTO_MAIS_COMPANY_ID,
  
  
  // Cache timeout para dados do chatbot (em ms)
  CHATBOT_CACHE_TIMEOUT: parseInt(process.env.CHATBOT_CACHE_TIMEOUT) || 300000,
  
  // ===========================================
  // VALIDAÇÃO DE CONFIGURAÇÃO
  // ===========================================
  
  /**
   * Valida se as configurações essenciais estão presentes
   * @returns {Object} Status da validação
   */
  validateConfig() {
    const required = [
      'MONGO_ENV',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET'
    ];
    
    const optional = [
      'OPENAI_API_KEY',
      'GEMINI_API_KEY'
    ];
    
    const missing = required.filter(key => !this[key]);
    const available = optional.filter(key => this[key]);
    
    return {
      isValid: missing.length === 0,
      missing,
      available,
      hasAI: this.OPENAI_API_KEY || this.GEMINI_API_KEY
    };
  }
};
