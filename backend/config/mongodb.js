// VERSION: v1.1.0 | DATE: 2025-01-27 | AUTHOR: VeloHub Development Team
// Helper centralizado para obter URI do MongoDB
// Aceita tanto MONGODB_URI (padrão) quanto MONGO_ENV (legado)

const getMongoUri = () => {
  // Prioridade: MONGODB_URI > MONGO_ENV
  const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_ENV;
  
  if (!MONGODB_URI) {
    throw new Error('❌ MongoDB não configurado. Configure MONGODB_URI ou MONGO_ENV nas variáveis de ambiente.');
  }
  
  return MONGODB_URI;
};

module.exports = { getMongoUri };

