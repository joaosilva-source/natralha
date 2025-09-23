// Configuração temporária para desenvolvimento
// VERSION: v1.0.0 | DATE: 2025-01-27 | AUTHOR: VeloHub Development Team

module.exports = {
  // APIs de IA - CONFIGURAR COM SUAS CHAVES
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'your_openai_api_key_here',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'your_gemini_api_key_here',
  
  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://lucasgravina:nKQu8bSN6iZl8FPo@clustercentral.quqgq6x.mongodb.net/console_conteudo?retryWrites=true&w=majority&appName=ClusterCentral',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '278491073220-eb4ogvn3aifu0ut9mq3rvu5r9r9l3137.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'SEU_GOOGLE_CLIENT_SECRET_AQUI',
  
  // Configurações
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000
};
