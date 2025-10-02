/**
 * VeloHub V3 - Backend Server
 * VERSION: v2.13.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
 */

// LOG DE DIAGNÓSTICO #1: Identificar a versão do código
console.log("🚀 INICIANDO APLICAÇÃO - VERSÃO DO CÓDIGO: 1.5.5 - DIAGNÓSTICO ATIVO");

// LOG DE DIAGNÓSTICO #2: Verificar as variáveis de ambiente
console.log("🔍 Verificando variáveis de ambiente...");
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`- OPENAI_API_KEY existe: ${!!process.env.OPENAI_API_KEY}`);
console.log(`- GEMINI_API_KEY existe: ${!!process.env.GEMINI_API_KEY}`);
console.log(`- MONGO_ENV existe: ${!!process.env.MONGO_ENV}`);
console.log(`- PORT: ${process.env.PORT}`);

const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Importar serviços do chatbot
// VERSION: v2.10.0 | DATE: 2025-01-29 | AUTHOR: Lucas Gravina - VeloHub Development Team
let aiService, searchService, sessionService, feedbackService, logsService, dataCache, userActivityLogger;

console.log('🔄 Iniciando carregamento de serviços...');

try {
  console.log('📦 Carregando aiService...');
  aiService = require('./services/chatbot/aiService');
  console.log('✅ aiService carregado');
  
  console.log('📦 Carregando searchService...');
  searchService = require('./services/chatbot/searchService');
  console.log('✅ searchService carregado');
  
  console.log('📦 Carregando sessionService...');
  sessionService = require('./services/chatbot/sessionService');
  console.log('✅ sessionService carregado');
  
  console.log('📦 Carregando feedbackService...');
  feedbackService = require('./services/chatbot/feedbackService');
  console.log('✅ feedbackService carregado');
  
  console.log('📦 Carregando logsService...');
  logsService = require('./services/chatbot/logsService');
  console.log('✅ logsService carregado');
  
  console.log('📦 Carregando dataCache...');
  dataCache = require('./services/chatbot/dataCache');
  console.log('✅ dataCache carregado');
  
  console.log('📦 Carregando userActivityLogger...');
  userActivityLogger = require('./services/logging/userActivityLogger');
  console.log('✅ userActivityLogger carregado');
  
  console.log('🎉 Todos os serviços carregados com sucesso!');
} catch (error) {
  console.error('❌ Erro ao carregar serviços:', error.message);
  console.error('Stack:', error.stack);
  console.error('❌ Falha crítica - encerrando processo');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: [
    'https://app.velohub.velotax.com.br', // NOVO DOMÍNIO PERSONALIZADO
    process.env.CORS_ORIGIN || 'https://velohub-278491073220.us-east1.run.app',
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  credentials: true
}));
app.use(express.json());

// Middleware para garantir que erros sempre retornem JSON
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err);
  if (!res.headersSent) {
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      message: err.message 
    });
  }
});

// Middleware de debug para capturar problemas de JSON
app.use((req, res, next) => {
  if (req.path === '/api/chatbot/ask') {
    console.log('🔍 Debug: Headers recebidos:', JSON.stringify(req.headers, null, 2));
    console.log('🔍 Debug: Body recebido:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Middleware para capturar bytes brutos da resposta (diagnóstico)
app.use((req, res, next) => {
  const oldWrite = res.write;
  const oldEnd = res.end;
  const chunks = [];

  res.write = function(chunk, ...args) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return oldWrite.apply(res, [chunk, ...args]);
  };
  
  res.end = function(chunk, ...args) {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    const bodyBuf = Buffer.concat(chunks);
    
    if (req.path === '/api/chatbot/ask' && res.get('Content-Type')?.includes('application/json')) {
      console.log('--- OUTGOING RAW BYTES (first 200) ---');
      console.log('UTF8:', bodyBuf.slice(0,200).toString('utf8'));
      console.log('HEX:', bodyBuf.slice(0,50));
      console.log('First byte:', bodyBuf[0], '(', String.fromCharCode(bodyBuf[0]), ')');
    }
    
    return oldEnd.apply(res, [chunk, ...args]);
  };
  
  next();
});

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const uri = process.env.MONGO_ENV;

console.log('🔍 Verificando configuração MongoDB...');
console.log('🔍 MONGO_ENV definida:', !!uri);
if (uri) {
  console.log('🔍 MONGO_ENV (primeiros 50 chars):', uri.substring(0, 50) + '...');
} else {
  console.warn('⚠️ MONGO_ENV não configurada - servidor iniciará sem MongoDB');
  console.warn('⚠️ APIs que dependem do MongoDB não funcionarão');
}
const client = uri ? new MongoClient(uri, {
  serverSelectionTimeoutMS: 15000, // 15 segundos timeout (otimizado para us-east-1)
  connectTimeoutMS: 20000, // 20 segundos timeout
  socketTimeoutMS: 45000, // 45 segundos timeout
}) : null;

// Conectar ao MongoDB uma vez no início
let isConnected = false;
const connectToMongo = async () => {
  if (!client) {
    console.error('❌ MongoDB client não configurado');
    throw new Error('MongoDB não configurado');
  }
  
  if (!isConnected) {
    try {
      console.log('🔌 Tentando conectar ao MongoDB...');
      await client.connect();
      isConnected = true;
      console.log('✅ Conexão MongoDB estabelecida!');
    } catch (error) {
      console.error('❌ Erro ao conectar MongoDB:', error);
      throw error;
    }
  } else {
    console.log('✅ MongoDB já conectado');
  }
  
  return client;
};

// Health check endpoint (não depende do MongoDB)
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Servidor funcionando!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test connection endpoint
app.get('/api/test', async (req, res) => {
  try {
    if (!client) {
      return res.status(503).json({ 
        success: false, 
        error: 'MongoDB não configurado',
        message: 'Servidor funcionando, mas MongoDB não disponível'
      });
    }
    await connectToMongo();
    res.json({ success: true, message: 'Conexão com MongoDB OK!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test chatbot endpoint
app.get('/api/chatbot/test', async (req, res) => {
  try {
    const config = require('./config');
    const aiStatus = aiService.getConfigurationStatus();
    
    res.json({
      success: true,
      data: {
        ai_service: {
          gemini: {
            configured: aiStatus.gemini.configured,
            model: aiStatus.gemini.model,
            priority: aiStatus.gemini.priority
          },
          openai: {
            configured: aiStatus.openai.configured,
            model: aiStatus.openai.model,
            priority: aiStatus.openai.priority
          },
          any_available: aiStatus.anyAvailable
        },
        mongodb_configured: !!config.MONGODB_URI,
        environment: config.NODE_ENV
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para Top 10 FAQ (substitui Google Apps Script)
app.get('/api/faq/top10', async (req, res) => {
  try {
    console.log('📋 Buscando Top 10 FAQ do MongoDB...');
    
    // Tentar conectar ao MongoDB
    const client = await connectToMongo();
    if (!client) {
      return res.status(503).json({
        success: false,
        error: 'MongoDB não disponível',
        data: []
      });
    }
    
    const db = client.db('console_conteudo');
    const botPerguntasCollection = db.collection('Bot_perguntas');
    
    // Buscar todas as perguntas
    const botPerguntasData = await botPerguntasCollection.find({}).toArray();
    
    if (!botPerguntasData || botPerguntasData.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    // Simular frequência baseada em posição (temporário)
    // Em produção, isso deveria vir de logs de uso real
    const top10FAQ = botPerguntasData.slice(0, 10).map((item, index) => ({
      pergunta: item.pergunta || 'Pergunta não disponível',
      frequencia: Math.max(100 - (index * 10), 10), // Simular frequência decrescente
      _id: item._id,
      palavrasChave: item.palavrasChave || '',
      sinonimos: item.sinonimos || ''
    }));
    
    console.log(`✅ Top 10 FAQ carregado: ${top10FAQ.length} perguntas`);
    
    res.json({
      success: true,
      data: top10FAQ
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar Top 10 FAQ:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      data: []
    });
  }
});

// Endpoint único para buscar todos os dados
app.get('/api/data', async (req, res) => {
  try {
    if (!client) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB não configurado',
        data: { velonews: [], articles: [], faq: [] }
      });
    }
    
    console.log('🔌 Conectando ao MongoDB...');
    await connectToMongo();
    console.log('✅ Conexão estabelecida!');
    
    const db = client.db('console_conteudo');
    
    // Buscar dados de todas as collections de uma vez
    console.log('📊 Buscando dados das collections...');
    
    const [velonews, artigos, faq] = await Promise.all([
      db.collection('Velonews').find({}).sort({ createdAt: -1 }).toArray(),
      db.collection('Artigos').find({}).sort({ createdAt: -1 }).toArray(),
      db.collection('Bot_perguntas').find({}).sort({ createdAt: -1 }).toArray()
    ]);
    
    console.log(`📰 Velonews encontrados: ${velonews.length}`);
    console.log(`📚 Artigos encontrados: ${artigos.length}`);
    console.log(`❓ FAQ encontrados: ${faq.length}`);
    
    // Debug: mostrar estrutura dos primeiros velonews
    if (velonews.length > 0) {
      console.log('🔍 Estrutura do primeiro velonews:', JSON.stringify(velonews[0], null, 2));
    }
    
    // Mapear dados para o formato esperado pelo frontend
    const mappedData = {
      velonews: velonews.map(item => ({
        _id: item._id,
        title: item.title || item.velonews_titulo,
        content: item.content || item.velonews_conteudo,
        is_critical: item.alerta_critico === 'Y' || item.alerta_critico === true || item.is_critical === 'Y' || item.is_critical === true || item.isCritical === 'Y' || item.isCritical === true ? 'Y' : 'N',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      })),
      
      articles: artigos.map(item => ({
        _id: item._id,
        title: item.artigo_titulo,
        content: item.artigo_conteudo,
        category: item.categoria_titulo,
        category_id: item.categoria_id,
        tag: item.tag,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      })),
      
      faq: faq.map(item => ({
        _id: item._id,
        topic: item.topico || item.topic,
        context: item.contexto || item.context,
        keywords: item.keywords || '',
        question: item.topico || item.question,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))
    };
    
    console.log('✅ Dados mapeados com sucesso!');
    console.log(`📊 Resumo: ${mappedData.velonews.length} velonews, ${mappedData.articles.length} artigos, ${mappedData.faq.length} faq`);
    
    // Debug: mostrar velonews críticos mapeados
    const criticalNews = mappedData.velonews.filter(n => n.is_critical === 'Y');
    console.log(`🚨 Velonews críticos encontrados: ${criticalNews.length}`);
    if (criticalNews.length > 0) {
      console.log('🚨 Primeiro velonews crítico:', JSON.stringify(criticalNews[0], null, 2));
    }
    
    res.json({
      success: true,
      data: mappedData
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar dados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados',
      error: error.message
    });
  }
});

// Endpoints individuais mantidos para compatibilidade
app.get('/api/velo-news', async (req, res) => {
  try {
    if (!client) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB não configurado',
        data: []
      });
    }
    
    await connectToMongo();
    const db = client.db('console_conteudo');
    const collection = db.collection('Velonews');

    // Heurística para evitar "artigos" que vazaram pra cá
    const raw = await collection.find({
      $nor: [
        { artigo_titulo: { $exists: true } },
        { artigo_conteudo: { $exists: true } },
        { tipo: 'artigo' },
      ]
    })
    .sort({ createdAt: -1, _id: -1 })
    .toArray();

    console.log('🔍 Buscando dados da collection Velonews...');
    console.log(`📰 Encontrados ${raw.length} documentos na collection Velonews`);
    
    // ADICIONE ESTE LOG PARA DEPURAR
    console.log('DADOS BRUTOS DA COLLECTION VELONEWS:', JSON.stringify(raw, null, 2));
    
    // Debug: mostrar estrutura dos primeiros 3 documentos
    if (raw.length > 0) {
      console.log('🔍 Estrutura dos primeiros documentos:');
      raw.slice(0, 3).forEach((item, index) => {
        console.log(`Documento ${index + 1}:`, {
          _id: item._id,
          title: item.title,
          velonews_titulo: item.velonews_titulo,
          content: item.content ? item.content.substring(0, 100) + '...' : null,
          velonews_conteudo: item.velonews_conteudo ? item.velonews_conteudo.substring(0, 100) + '...' : null,
          alerta_critico: item.alerta_critico,
          is_critical: item.is_critical,
          createdAt: item.createdAt
        });
      });
    }

    const mappedNews = raw.map(item => {
      // Normalização de datas
      const createdAt =
        item.createdAt ??
        item.updatedAt ??
        (item._id && item._id.getTimestamp ? item._id.getTimestamp() : null);

      return {
        _id: item._id,
        // Usando campos padrão do schema
        title: item.titulo ?? '(sem título)',
        content: item.conteudo ?? '',
        is_critical: item.isCritical === true ? 'Y' : 'N',
        createdAt,
        updatedAt: item.updatedAt ?? createdAt,
        source: 'Velonews'
      };
    });
    
    console.log('✅ Dados mapeados com sucesso:', mappedNews.length, 'velonews');
    
    res.json({
      success: true,
      data: mappedNews
    });
  } catch (error) {
    console.error('Erro ao buscar notícias:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar notícias',
      error: error.message
    });
  }
});

app.get('/api/articles', async (req, res) => {
  try {
    if (!client) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB não configurado',
        data: []
      });
    }
    
    await connectToMongo();
    const db = client.db('console_conteudo');
    const collection = db.collection('Artigos');
    
    const articles = await collection.find({}).toArray();
    
    const mappedArticles = articles.map(item => ({
      _id: item._id,
      title: item.artigo_titulo,
      content: item.artigo_conteudo,
      category: item.categoria_titulo,
      category_id: item.categoria_id,
      tag: item.tag,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
    
    res.json({
      success: true,
      data: mappedArticles
    });
  } catch (error) {
    console.error('Erro ao buscar artigos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar artigos',
      error: error.message
    });
  }
});

app.get('/api/faq', async (req, res) => {
  try {
    if (!client) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB não configurado',
        data: []
      });
    }
    
    await connectToMongo();
    const db = client.db('console_conteudo');
    const collection = db.collection('Bot_perguntas');
    
    const faq = await collection.find({}).toArray();
    
    const mappedFaq = faq.map(item => ({
      _id: item._id,
      topic: item.topico || item.topic,
      context: item.contexto || item.context,
      keywords: item.keywords || '',
      question: item.topico || item.question,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
    
    res.json({
      success: true,
      data: mappedFaq
    });
  } catch (error) {
    console.error('Erro ao buscar FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar FAQ',
      error: error.message
    });
  }
});

// Sistema de Ponto - Endpoints seguros (não interferem nas APIs existentes)
app.post('/api/ponto/entrada', async (req, res) => {
  try {
    // Validar se usuário está autenticado (implementar conforme sua lógica)
    // const user = req.user; // Sua validação de usuário
    
    // Chamar API do Ponto Mais
    const response = await fetch('https://api.pontomais.com.br/time_clock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PONTO_MAIS_API_KEY}`,
      },
      body: JSON.stringify({
        type: 'in',
        timestamp: new Date().toISOString(),
        company_id: process.env.PONTO_MAIS_COMPANY_ID
      })
    });

    if (!response.ok) {
      throw new Error('Falha ao registrar entrada no Ponto Mais');
    }

    res.json({ success: true, message: 'Entrada registrada com sucesso!' });
  } catch (error) {
    console.error('Erro ao registrar entrada:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ponto/saida', async (req, res) => {
  try {
    // Validar se usuário está autenticado (implementar conforme sua lógica)
    // const user = req.user; // Sua validação de usuário
    
    // Chamar API do Ponto Mais
    const response = await fetch('https://api.pontomais.com.br/time_clock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PONTO_MAIS_API_KEY}`,
      },
      body: JSON.stringify({
        type: 'out',
        timestamp: new Date().toISOString(),
        company_id: process.env.PONTO_MAIS_COMPANY_ID
      })
    });

    if (!response.ok) {
      throw new Error('Falha ao registrar saída no Ponto Mais');
    }

    res.json({ success: true, message: 'Saída registrada com sucesso!' });
  } catch (error) {
    console.error('Erro ao registrar saída:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/ponto/status', async (req, res) => {
  try {
    // Validar se usuário está autenticado (implementar conforme sua lógica)
    // const user = req.user; // Sua validação de usuário
    
    // Chamar API do Ponto Mais para status
    const response = await fetch('https://api.pontomais.com.br/time_clock/current', {
      headers: {
        'Authorization': `Bearer ${process.env.PONTO_MAIS_API_KEY}`,
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar status no Ponto Mais');
    }

    const data = await response.json();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Iniciar limpeza automática de sessões
sessionService.startAutoCleanup();

/**
 * Filtra perguntas do MongoDB por keywords/sinônimos
 * @param {string} question - Pergunta do usuário
 * @param {Array} botPerguntasData - Dados do MongoDB
 * @returns {Array} Perguntas filtradas
 */
function filterByKeywords(question, botPerguntasData) {
  const questionWords = question.toLowerCase().split(/\s+/);
  const filtered = [];
  
  for (const item of botPerguntasData) {
    const palavrasChave = (item.palavrasChave || '').toLowerCase();
    const sinonimos = (item.sinonimos || '').toLowerCase();
    const pergunta = (item.pergunta || '').toLowerCase();
    
    // Combinar todos os campos de busca
    const searchText = `${palavrasChave} ${sinonimos} ${pergunta}`;
    
    // Verificar se alguma palavra da pergunta está presente
    const hasMatch = questionWords.some(word => {
      if (word.length < 2) return false; // Ignorar palavras muito curtas
      return searchText.includes(word);
    });
    
    if (hasMatch) {
      filtered.push(item);
    }
  }
  
  // Fallback: se filtro muito restritivo, retornar primeiras 50
  if (filtered.length === 0) {
    console.log('⚠️ Filtro muito restritivo, usando fallback (primeiras 50 perguntas)');
    return botPerguntasData.slice(0, 50);
  }
  
  // Limitar a 30 perguntas para não sobrecarregar a IA
  return filtered.slice(0, 30);
}

// ===== FUNÇÕES AUXILIARES =====

/**
 * Carrega dados do Bot_perguntas do MongoDB
 * @returns {Promise<Array>} Dados do Bot_perguntas
 */
const getBotPerguntasData = async () => {
  try {
    const client = await connectToMongo();
    const db = client.db('console_conteudo');
    const collection = db.collection('Bot_perguntas');
    const data = await collection.find({}).toArray();
    console.log(`📊 Bot_perguntas: ${data.length} perguntas carregadas do MongoDB`);
    return data;
  } catch (error) {
    console.error('❌ Erro ao carregar Bot_perguntas:', error);
    return [];
  }
};

/**
 * Carrega dados dos Artigos do MongoDB
 * @returns {Promise<Array>} Dados dos Artigos
 */
const getArticlesData = async () => {
  try {
    const client = await connectToMongo();
    const db = client.db('console_conteudo');
    const collection = db.collection('Artigos');
    const data = await collection.find({}).toArray();
    console.log(`📊 Artigos: ${data.length} artigos carregados do MongoDB`);
    return data;
  } catch (error) {
    console.error('❌ Erro ao carregar Artigos:', error);
    return [];
  }
};

// ===== API DO CHATBOT INTELIGENTE =====

/**
 * Inicialização do VeloBot - 3 Ações Essenciais
 * GET /api/chatbot/init
 */
app.get('/api/chatbot/init', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Validação - usuário já autenticado via OAuth
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }
    
    const cleanUserId = userId.trim();
    console.log(`🚀 VeloBot Init: Inicializando para ${cleanUserId}`);
    
    // 1. VALIDAÇÃO DA SESSÃO (memória de conversa - 10 minutos)
    const session = sessionService.getOrCreateSession(cleanUserId, null);
    console.log(`✅ VeloBot Init: Sessão criada/obtida: ${session.id}`);
    
    // 2. CARGA DO CACHE DO BOT_PERGUNTAS DO MONGODB
    console.log('📦 VeloBot Init: Carregando dados MongoDB no cache...');
    try {
      const botPerguntasData = await getBotPerguntasData();
      const articlesData = await getArticlesData();
      
      // Atualizar cache
      dataCache.updateBotPerguntas(botPerguntasData);
      dataCache.updateArticles(articlesData);
      
      console.log(`✅ VeloBot Init: Cache atualizado - Bot_perguntas: ${botPerguntasData.length}, Artigos: ${articlesData.length}`);
    } catch (error) {
      console.error('❌ VeloBot Init: Erro ao carregar dados no cache:', error.message);
    }
    
    // 3. HANDSHAKE PARA DETERMINAR IA PRIMÁRIA
    const aiStatus = await aiService.testConnection();
    let primaryAI = null;
    let fallbackAI = null;
    
    if (aiStatus.openai.available) {
      // Cenário 1: OpenAI OK → OpenAI primária + Gemini secundária + pesquisa convencional fallback
      primaryAI = 'OpenAI';
      fallbackAI = aiStatus.gemini.available ? 'Gemini' : null;
      console.log(`✅ VeloBot Init: Cenário 1 - OpenAI primária, Gemini secundária`);
    } else if (aiStatus.gemini.available) {
      // Cenário 2: OpenAI NULL + Gemini OK → Gemini primária + OpenAI secundária + pesquisa convencional fallback
      primaryAI = 'Gemini';
      fallbackAI = 'OpenAI'; // Sempre OpenAI como secundária, mesmo se não disponível
      console.log(`✅ VeloBot Init: Cenário 2 - Gemini primária, OpenAI secundária`);
    } else {
      // Cenário 3: OpenAI NULL + Gemini NULL → Mantém primeira opção + pesquisa convencional fallback
      primaryAI = 'OpenAI'; // Mantém primeira opção
      fallbackAI = null;
      console.log(`⚠️ VeloBot Init: Cenário 3 - Nenhuma IA disponível, usando pesquisa convencional`);
    }
    
    console.log(`✅ VeloBot Init: IA primária: ${primaryAI}, Fallback: ${fallbackAI}`);
    
    // RESPOSTA COMPLETA
    const response = {
      success: true,
      sessionId: session.id,
      aiStatus: {
        primaryAI: primaryAI,
        fallbackAI: fallbackAI,
        anyAvailable: aiStatus.openai.available || aiStatus.gemini.available
      },
      cacheStatus: {
        botPerguntas: dataCache.getBotPerguntasData()?.length || 0,
        articles: dataCache.getArticlesData()?.length || 0
      },
      message: 'VeloBot inicializado - memória de conversa ativa por 10 minutos',
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ VeloBot Init: Inicialização concluída para ${cleanUserId}`);
    res.json(response);
    
  } catch (error) {
    console.error('❌ VeloBot Init Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro na inicialização do VeloBot',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Clarification Direto - Resposta sem re-análise da IA
 * POST /api/chatbot/clarification
 */
app.post('/api/chatbot/clarification', async (req, res) => {
  try {
    const { question, userId, sessionId } = req.body;
    
    if (!question || !userId) {
      return res.status(400).json({
        success: false,
        error: 'question e userId são obrigatórios'
      });
    }
    
    const cleanUserId = userId.trim();
    const cleanSessionId = sessionId ? sessionId.trim() : null;
    const cleanQuestion = question.trim();
    
    console.log(`🔍 Clarification Direto: Buscando resposta para "${cleanQuestion}"`);
    
    // 1. BUSCAR RESPOSTA DIRETA NO CACHE
    let botPerguntasData = dataCache.getBotPerguntasData();
    
    // Se cache inválido, carregar do MongoDB
    if (!botPerguntasData) {
      console.log('⚠️ Clarification Direto: Cache inválido, carregando do MongoDB...');
      botPerguntasData = await getBotPerguntasData();
      dataCache.updateBotPerguntas(botPerguntasData);
    }
    const directMatch = botPerguntasData.find(item => 
      item.pergunta && item.pergunta.toLowerCase().includes(cleanQuestion.toLowerCase())
    );
    
    if (directMatch) {
      console.log(`✅ Clarification Direto: Resposta encontrada no MongoDB`);
      
      // 2. LOG DA ATIVIDADE
      await userActivityLogger.logQuestion(cleanUserId, cleanQuestion, cleanSessionId);
      
      // 3. RESPOSTA DIRETA
      const response = {
        success: true,
        response: directMatch.resposta || 'Resposta não encontrada',
        source: 'Bot_perguntas',
        sourceId: directMatch._id,
        sourceRow: directMatch.pergunta,
        timestamp: new Date().toISOString(),
        sessionId: cleanSessionId
      };
      
      console.log(`✅ Clarification Direto: Resposta enviada para ${cleanUserId}`);
      return res.json(response);
    }
    
    // 4. FALLBACK: BUSCA TRADICIONAL
    console.log(`⚠️ Clarification Direto: Nenhuma correspondência direta, usando busca tradicional`);
    
    const searchResults = await searchService.performHybridSearch(cleanQuestion, botPerguntasData, []);
    
    if (searchResults.botPergunta) {
      const response = {
        success: true,
        response: searchResults.botPergunta.resposta || 'Resposta não encontrada',
        source: 'Bot_perguntas',
        sourceId: searchResults.botPergunta._id,
        sourceRow: searchResults.botPergunta.pergunta,
        timestamp: new Date().toISOString(),
        sessionId: cleanSessionId
      };
      
      console.log(`✅ Clarification Direto: Resposta via busca tradicional para ${cleanUserId}`);
      return res.json(response);
    }
    
    // 5. RESPOSTA PADRÃO
    const response = {
      success: true,
      response: 'Não consegui encontrar uma resposta precisa para sua pergunta. Pode fornecer mais detalhes ou reformular sua pergunta para que eu possa ajudá-lo melhor?',
      source: 'fallback',
      timestamp: new Date().toISOString(),
      sessionId: cleanSessionId
    };
    
    console.log(`⚠️ Clarification Direto: Resposta padrão para ${cleanUserId}`);
    return res.json(response);
    
  } catch (error) {
    console.error('❌ Clarification Direto Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro no clarification direto',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Limpar Cache das IAs - Força novo teste
 * POST /api/chatbot/clear-cache
 */
app.post('/api/chatbot/clear-cache', async (req, res) => {
  try {
    console.log('🧹 Limpando cache das IAs...');
    
    // Limpar cache do aiService
    aiService.statusCache = {
      data: null,
      timestamp: null,
      ttl: 5 * 60 * 1000 // 5 minutos em ms
    };
    
    // Forçar novo teste
    const aiStatus = await aiService.testConnection();
    
    res.json({
      success: true,
      message: 'Cache limpo e IAs testadas',
      aiStatus: aiStatus,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao limpar cache das IAs',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Status do Cache de Dados
 * GET /api/chatbot/cache-status
 */
app.get('/api/chatbot/cache-status', async (req, res) => {
  try {
    const cacheStatus = dataCache.getCacheStatus();
    
    res.json({
      success: true,
      cacheStatus: cacheStatus,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Cache Status Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter status do cache',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Health Check das IAs - Determina IA primária
 * GET /api/chatbot/health-check
 */
app.get('/api/chatbot/health-check', async (req, res) => {
  try {
    console.log('🔍 Health Check: Testando disponibilidade das IAs...');
    
    const aiStatus = await aiService.testConnection();
    
    // Determinar IA primária baseada na disponibilidade
    let primaryAI = null;
    let fallbackAI = null;
    
    if (aiStatus.openai.available) {
      primaryAI = 'OpenAI';
      fallbackAI = aiStatus.gemini.available ? 'Gemini' : null;
    } else if (aiStatus.gemini.available) {
      primaryAI = 'Gemini';
      fallbackAI = null;
    }
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      aiStatus: aiStatus,
      primaryAI: primaryAI,
      fallbackAI: fallbackAI,
      anyAvailable: aiStatus.openai.available || aiStatus.gemini.available
    };
    
    console.log(`✅ Health Check: IA primária: ${primaryAI}, Fallback: ${fallbackAI}`);
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Health Check Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar status das IAs',
      timestamp: new Date().toISOString()
    });
  }
});

// API de Chat Inteligente - Simplificada
app.post('/api/chatbot/ask', async (req, res) => {
  try {
    const { question, userId, sessionId } = req.body;

    // Validação simplificada
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Pergunta é obrigatória'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId é obrigatório'
      });
    }

    const cleanQuestion = question.trim();
    const cleanUserId = userId.trim();
    const cleanSessionId = sessionId || null;

    console.log(`🤖 Chat V2: Nova pergunta de ${cleanUserId}: "${cleanQuestion}"`);

    // Obter sessão para memória de conversa (10 minutos)
    const session = sessionService.getOrCreateSession(cleanUserId, cleanSessionId);
    
    // Adicionar pergunta à sessão (memória de conversa)
    sessionService.addMessage(session.id, 'user', cleanQuestion, {
      timestamp: new Date(),
      userId: cleanUserId
    });

    // Log da atividade (MongoDB)
    await userActivityLogger.logQuestion(cleanUserId, cleanQuestion, session.id);

    // Log para Google Sheets (RESTAURADO)
    if (logsService.isConfigured()) {
      await logsService.logAIUsage(cleanUserId, cleanQuestion, 'Pergunta Inicial');
    }

    // Buscar dados do MongoDB
    const client = await connectToMongo();
    const db = client.db('console_conteudo');
    const botPerguntasCollection = db.collection('Bot_perguntas'); // Nome correto da coleção
    const articlesCollection = db.collection('Artigos');

    // Buscar Bot_perguntas e artigos em paralelo
    // 1. TENTAR USAR CACHE PRIMEIRO
    console.log('📦 Chat V2: Verificando cache do Bot_perguntas...');
    let botPerguntasData = dataCache.getBotPerguntasData();
    let articlesData = dataCache.getArticlesData();
    
    console.log('📦 Chat V2: Cache status - Bot_perguntas:', !!botPerguntasData, 'Artigos:', !!articlesData);
    
    // Se cache inválido, carregar do MongoDB
    if (!botPerguntasData || !articlesData) {
      console.log('⚠️ Chat V2: Cache inválido, carregando do MongoDB...');
      console.log('📦 Chat V2: Carregando Bot_perguntas da collection...');
      
      [botPerguntasData, articlesData] = await Promise.all([
        botPerguntasCollection.find({}).toArray(),
        articlesCollection.find({}).toArray()
      ]);
      
      console.log(`📦 Chat V2: MongoDB - Bot_perguntas: ${botPerguntasData.length}, Artigos: ${articlesData.length}`);
      
      // Atualizar cache
      dataCache.updateBotPerguntas(botPerguntasData);
      dataCache.updateArticles(articlesData);
      
      console.log('✅ Chat V2: Cache atualizado com dados do MongoDB');
    } else {
      console.log('✅ Chat V2: Usando dados do cache');
    }

    console.log(`📋 Chat V2: ${botPerguntasData.length} perguntas do Bot_perguntas e ${articlesData.length} artigos carregados`);

    // FILTRO MONGODB por keywords/sinônimos
    const filteredBotPerguntas = filterByKeywords(cleanQuestion, botPerguntasData);
    console.log(`🔍 Chat V2: Filtro aplicado - ${filteredBotPerguntas.length} perguntas relevantes (de ${botPerguntasData.length})`);

    // PONTO 3: CHAMADA DE IA PRIMÁRIA
    let aiResponse = null;
    let searchResults = null;
    
    if (aiService.isConfigured()) {
      console.log(`🤖 Chat V2: PONTO 3 - Chamada de IA primária para: "${cleanQuestion}"`);
      console.log(`🔍 Chat V2: Perguntas localizadas na base: ${botPerguntasData.length}, Filtradas: ${filteredBotPerguntas.length}`);
      console.log(`🔍 Chat V2: IA configurada - Gemini: ${aiService.isGeminiConfigured()}, OpenAI: ${aiService.isOpenAIConfigured()}`);
      
      // Obter histórico da sessão para contexto
      const sessionHistory = sessionService.getSessionHistory(session.id);
      
      // Determinar IA primária baseada na disponibilidade
      const aiStatus = await aiService.testConnection();
      let primaryAI = null;
      let fallbackAI = null;
      
      if (aiStatus.openai.available) {
        primaryAI = 'OpenAI';
        fallbackAI = aiStatus.gemini.available ? 'Gemini' : null;
      } else if (aiStatus.gemini.available) {
        primaryAI = 'Gemini';
        fallbackAI = 'OpenAI';
      } else {
        primaryAI = 'OpenAI';
        fallbackAI = null;
      }
      
      // Tentar IA primária
      const aiResult = await aiService.generateResponse(
        cleanQuestion,
        '', // context vazio para resposta direta
        sessionHistory,
        cleanUserId,
        userEmail,
        null, // searchResults
        'conversational',
        primaryAI
      );
      
      if (aiResult.success) {
        // IA primária funcionou - PONTO 4: Análise IA
        console.log(`✅ Chat V2: IA primária funcionou - ${aiResult.provider}`);
        
        // PONTO 4: ANÁLISE IA (analyzeQuestionWithAI)
        console.log(`🤖 Chat V2: PONTO 4 - Análise IA com dados filtrados`);
        const aiAnalysis = await aiService.analyzeQuestionWithAI(cleanQuestion, filteredBotPerguntas, sessionHistory);
        console.log(`🔍 Chat V2: PONTO 4 - Resultado da análise IA:`, JSON.stringify(aiAnalysis, null, 2));
        
        if (aiAnalysis.needsClarification) {
          // IA identificou múltiplas opções relevantes - mostrar menu de esclarecimento
          const clarificationMenu = searchService.generateClarificationMenuFromAI(aiAnalysis.relevantOptions, cleanQuestion);
          
          // Log da necessidade de esclarecimento
          if (logsService.isConfigured()) {
            await logsService.logAIUsage(userEmail, cleanQuestion, 'Clarificação IA');
          }

          return res.json({
            success: true,
            data: {
              ...clarificationMenu,
              sessionId: session.id,
              timestamp: new Date().toISOString()
            }
          });
        } else if (aiAnalysis.bestMatch) {
          // IA identificou uma opção específica - usar diretamente
          console.log(`✅ Chat V2: IA identificou match específico: "${aiAnalysis.bestMatch.pergunta}"`);
          
          // Log do uso da IA
          if (logsService.isConfigured()) {
            await logsService.logAIResponse(userEmail, cleanQuestion, 'Gemini');
          }
          
          return res.json({
            success: true,
            response: aiAnalysis.bestMatch.resposta || 'Resposta não encontrada',
            source: 'Bot_perguntas',
            sourceId: aiAnalysis.bestMatch._id,
            sourceRow: aiAnalysis.bestMatch.pergunta,
            sessionId: session.id,
            timestamp: new Date().toISOString()
          });
        } else {
          // IA não encontrou opções - usar resposta da IA primária
          if (logsService.isConfigured()) {
            await logsService.logAIResponse(userEmail, cleanQuestion, aiResult.provider);
          }
          
          return res.json({
            success: true,
            response: aiResult.response,
            source: 'ai',
            aiProvider: aiResult.provider,
            model: aiResult.model,
            sessionId: session.id,
            timestamp: new Date().toISOString()
          });
        }
      } else if (fallbackAI) {
        // IA primária falhou - tentar IA secundária
        console.warn(`⚠️ Chat V2: IA primária (${primaryAI}) falhou, tentando IA secundária (${fallbackAI})`);
        
        const fallbackResult = await aiService.generateResponse(
          cleanQuestion,
          '',
          sessionHistory,
          cleanUserId,
          userEmail,
          null,
          'conversational',
          fallbackAI
        );
        
        if (fallbackResult.success) {
          // IA secundária funcionou - PONTO 4: Análise IA
          console.log(`✅ Chat V2: IA secundária funcionou - ${fallbackResult.provider}`);
          
          // PONTO 4: ANÁLISE IA (analyzeQuestionWithAI)
          console.log(`🤖 Chat V2: PONTO 4 - Análise IA com dados filtrados`);
          const aiAnalysis = await aiService.analyzeQuestionWithAI(cleanQuestion, filteredBotPerguntas, sessionHistory);
          console.log(`🔍 Chat V2: PONTO 4 - Resultado da análise IA:`, JSON.stringify(aiAnalysis, null, 2));
          
          if (aiAnalysis.needsClarification) {
            // IA identificou múltiplas opções relevantes - mostrar menu de esclarecimento
            const clarificationMenu = searchService.generateClarificationMenuFromAI(aiAnalysis.relevantOptions, cleanQuestion);
            
            // Log da necessidade de esclarecimento
            if (logsService.isConfigured()) {
              await logsService.logAIUsage(userEmail, cleanQuestion, 'Clarificação IA');
            }

            return res.json({
              success: true,
              data: {
                ...clarificationMenu,
                sessionId: session.id,
                timestamp: new Date().toISOString()
              }
            });
          } else if (aiAnalysis.bestMatch) {
            // IA identificou uma opção específica - usar diretamente
            console.log(`✅ Chat V2: IA identificou match específico: "${aiAnalysis.bestMatch.pergunta}"`);
            
            // Log do uso da IA
            if (logsService.isConfigured()) {
              await logsService.logAIResponse(userEmail, cleanQuestion, 'Gemini');
            }
            
            return res.json({
              success: true,
              response: aiAnalysis.bestMatch.resposta || 'Resposta não encontrada',
              source: 'Bot_perguntas',
              sourceId: aiAnalysis.bestMatch._id,
              sourceRow: aiAnalysis.bestMatch.pergunta,
              sessionId: session.id,
              timestamp: new Date().toISOString()
            });
          } else {
            // IA não encontrou opções - usar resposta da IA secundária
            if (logsService.isConfigured()) {
              await logsService.logAIResponse(userEmail, cleanQuestion, fallbackResult.provider);
            }
            
            return res.json({
              success: true,
              response: fallbackResult.response,
              source: 'ai',
              aiProvider: fallbackResult.provider,
              model: fallbackResult.model,
              sessionId: session.id,
              timestamp: new Date().toISOString()
            });
          }
        }
      }
      
      // Ambas IAs falharam - usar busca tradicional e ir direto para CLARIFICATION
      console.warn('⚠️ Chat V2: Ambas IAs falharam, usando busca tradicional → CLARIFICATION');
      searchResults = await searchService.hybridSearch(cleanQuestion, botPerguntasData, articlesData);
      
    } else {
      // IA não configurada - usar busca tradicional
      console.log(`⚠️ Chat V2: IA não configurada, usando busca tradicional`);
      searchResults = await searchService.hybridSearch(cleanQuestion, botPerguntasData, articlesData);
    }
      
    // Verificar se precisa de esclarecimento (sistema tradicional)
    const clarificationResult = searchService.findMatchesWithDeduplication(cleanQuestion, botPerguntasData);
    
    if (clarificationResult.needsClarification) {
      const clarificationMenu = searchService.generateClarificationMenu(clarificationResult.matches, cleanQuestion);
      
      // Log da necessidade de esclarecimento
      if (logsService.isConfigured()) {
        await logsService.logAIUsage(userEmail, cleanQuestion, 'Clarificação Tradicional');
      }

      return res.json({
        success: true,
        data: {
          ...clarificationMenu,
          sessionId: session.id,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Obter histórico da sessão
    const sessionHistory = sessionService.getSessionHistory(session.id);

    // Construir contexto aprimorado
    let context = '';
    
    // Contexto do Bot_perguntas (estrutura MongoDB: Bot_perguntas)
    if (searchResults.botPergunta) {
      context += `Pergunta relevante encontrada:\nPergunta: ${searchResults.botPergunta.pergunta}\nResposta: ${searchResults.botPergunta.resposta}\n\n`;
    }
    
    // Contexto dos artigos
    if (searchResults.articles.length > 0) {
      context += `Artigos relacionados:\n`;
      searchResults.articles.forEach(article => {
        context += `- ${article.title}: ${article.content.substring(0, 200)}...\n`;
      });
      context += '\n';
    }

    // Gerar resposta com IA (Gemini primário, OpenAI fallback)
    let response;
    let responseSource = 'fallback';
    let aiProvider = null;

    if (aiService.isConfigured()) {
      try {
        // Determinar IA primária baseada na disponibilidade (mesma lógica da inicialização)
        const aiStatus = await aiService.testConnection();
        let primaryAI = null;
        
        if (aiStatus.openai.available) {
          // Cenário 1: OpenAI OK → OpenAI primária + Gemini secundária + pesquisa convencional fallback
          primaryAI = 'OpenAI';
        } else if (aiStatus.gemini.available) {
          // Cenário 2: OpenAI NULL + Gemini OK → Gemini primária + OpenAI secundária + pesquisa convencional fallback
          primaryAI = 'Gemini';
        } else {
          // Cenário 3: OpenAI NULL + Gemini NULL → Mantém primeira opção + pesquisa convencional fallback
          primaryAI = 'OpenAI';
        }
        
        const aiResult = await aiService.generateResponse(
          cleanQuestion,
          context,
          sessionHistory,
          cleanUserId,
          userEmail,
          null, // searchResults
          'conversational', // formatType
          primaryAI
        );
        
        response = aiResult.response;
        responseSource = aiResult.success ? 'ai' : 'error';
        aiProvider = aiResult.provider;
        
        console.log(`✅ Chat V2: Resposta gerada pela ${aiProvider} (${aiResult.model})`);
        
        // Log do uso da IA
        if (logsService.isConfigured() && aiResult.success) {
          await logsService.logAIResponse(userEmail, cleanQuestion, aiProvider);
        }
        
      } catch (aiError) {
        console.error('❌ Chat V2: Erro na IA:', aiError.message);
        response = 'Desculpe, não consegui processar sua pergunta no momento. Tente novamente.';
        responseSource = 'error';
        aiProvider = 'Error';
        
        // Log do erro
        if (logsService.isConfigured()) {
          await logsService.logNotFoundQuestion(userEmail, cleanQuestion);
        }
      }
    } else {
      // Fallback para Bot_perguntas se nenhuma IA estiver configurada
      if (searchResults.botPergunta) {
        response = searchResults.botPergunta.resposta || 'Resposta encontrada na base de conhecimento.';
        responseSource = 'bot_perguntas';
        console.log(`✅ Chat V2: Resposta do Bot_perguntas (IA não configurada)`);
        
        // Log da resposta do banco de dados
        if (logsService.isConfigured()) {
          await logsService.logMongoDBResponse(userEmail, cleanQuestion, searchResults.botPergunta._id);
        }
      } else {
        response = 'Não consegui encontrar uma resposta precisa para sua pergunta. Pode fornecer mais detalhes ou reformular sua pergunta para que eu possa ajudá-lo melhor?';
        responseSource = 'no_results';
        console.log(`❌ Chat V2: Nenhuma resposta encontrada`);
        
        // Log da pergunta não encontrada
        if (logsService.isConfigured()) {
          await logsService.logNotFoundQuestion(userEmail, cleanQuestion);
        }
      }
    }

    // Adicionar resposta à sessão
    const messageId = sessionService.addMessage(session.id, 'bot', response, {
      timestamp: new Date(),
      source: responseSource,
      aiProvider: aiProvider,
      botPerguntaUsed: searchResults.botPergunta ? searchResults.botPergunta._id : null,
      articlesUsed: searchResults.articles.map(a => a._id),
      sitesUsed: false // Sites externos removidos
    });

    // Preparar resposta para o frontend
    const responseData = {
      success: true,
      messageId: messageId,
      response: response,
      source: responseSource,
      aiProvider: aiProvider,
      sessionId: session.id,
      articles: searchResults.articles.slice(0, 3).map(article => ({
        id: article._id,
        title: article.title,
        content: article.content.substring(0, 150) + '...',
        relevanceScore: article.relevanceScore
      })),
      botPerguntaUsed: searchResults.botPergunta ? {
        id: searchResults.botPergunta._id,
        question: searchResults.botPergunta.pergunta,
        answer: searchResults.botPergunta.resposta,
        relevanceScore: searchResults.botPergunta.relevanceScore
      } : null,
      sitesUsed: false, // Sites externos removidos
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Chat V2: Resposta enviada para ${cleanUserId} (${responseSource}${aiProvider ? ` - ${aiProvider}` : ''})`);
    
    // Verificar se headers já foram enviados
    if (res.headersSent) {
      console.error('❌ CRÍTICO: Headers já foram enviados! Stack:', new Error().stack);
      return;
    }
    
    // Debug: Verificar se há caracteres especiais na resposta
    const responseString = JSON.stringify(responseData);
    console.log('🔍 Debug: Resposta JSON:', responseString.substring(0, 200) + '...');
    console.log('🔍 Debug: Primeiros caracteres:', responseString.substring(0, 10).split('').map(c => c.charCodeAt(0)));
    console.log('🔍 Debug: First byte hex:', Buffer.from(responseString)[0].toString(16));
    
    res.json(responseData);

  } catch (error) {
    console.error('❌ Chat V2 Error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// API de Feedback
app.post('/api/chatbot/feedback', async (req, res) => {
  try {
    const { messageId, feedbackType, comment, userId, sessionId, question, answer } = req.body;

    // Validação básica
    if (!messageId || !feedbackType) {
      return res.status(400).json({
        success: false,
        error: 'messageId e feedbackType são obrigatórios'
      });
    }

    if (!['positive', 'negative'].includes(feedbackType)) {
      return res.status(400).json({
        success: false,
        error: 'feedbackType deve ser "positive" ou "negative"'
      });
    }

    const cleanUserId = userId || 'anonymous';
    const cleanSessionId = sessionId || null;

    console.log(`📝 Feedback: Novo feedback de ${cleanUserId} - ${feedbackType} para mensagem ${messageId}`);

    // Preparar dados do feedback
    const feedbackData = {
      userId: cleanUserId,
      messageId: messageId,
      feedbackType: feedbackType,
      comment: comment || '',
      question: question || '',
      answer: answer || '',
      sessionId: cleanSessionId,
      metadata: {
        timestamp: new Date(),
        userAgent: req.get('User-Agent'),
        ip: req.ip
      }
    };

    // Registrar feedback no Google Sheets
    const feedbackSuccess = await feedbackService.logFeedback(feedbackData);

    if (!feedbackSuccess) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao registrar feedback no Google Sheets'
      });
    }

    // Log da atividade
    await userActivityLogger.logFeedback(cleanUserId, feedbackType, messageId, cleanSessionId, {
      hasComment: !!comment,
      commentLength: comment ? comment.length : 0
    });

    // Resposta de sucesso
    const responseData = {
      success: true,
      data: {
        messageId: messageId,
        feedbackType: feedbackType,
        timestamp: new Date().toISOString(),
        message: feedbackType === 'positive' ? 
          'Obrigado pelo seu feedback positivo!' : 
          'Obrigado pelo seu feedback. Vamos melhorar com base na sua sugestão.'
      }
    };

    console.log(`✅ Feedback: Feedback registrado com sucesso para ${cleanUserId}`);
    
    res.json(responseData);

  } catch (error) {
    console.error('❌ Feedback Error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// API de Log de Atividade
app.post('/api/chatbot/activity', async (req, res) => {
  try {
    const { action, details, userId, sessionId, source } = req.body;

    // Validação básica
    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'action é obrigatório'
      });
    }

    const cleanUserId = userId || 'anonymous';
    const cleanSessionId = sessionId || null;
    const cleanSource = source || 'chatbot';

    console.log(`📊 Activity: Nova atividade de ${cleanUserId} - ${action}`);

    // Preparar dados da atividade
    const activityData = {
      userId: cleanUserId,
      action: action,
      details: details || {},
      sessionId: cleanSessionId,
      source: cleanSource,
      metadata: {
        timestamp: new Date(),
        userAgent: req.get('User-Agent'),
        ip: req.ip
      }
    };

    // Registrar atividade no MongoDB
    const activitySuccess = await userActivityLogger.logActivity(activityData);

    if (!activitySuccess) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao registrar atividade no banco de dados'
      });
    }

    // Resposta de sucesso
    const responseData = {
      success: true,
      data: {
        action: action,
        userId: cleanUserId,
        sessionId: cleanSessionId,
        timestamp: new Date().toISOString(),
        message: 'Atividade registrada com sucesso'
      }
    };

    console.log(`✅ Activity: Atividade registrada com sucesso para ${cleanUserId}`);
    
    res.json(responseData);

  } catch (error) {
    console.error('❌ Activity Error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// API do Botão IA - Resposta Conversacional
app.post('/api/chatbot/ai-response', async (req, res) => {
  try {
    const { question, botPerguntaResponse, articleContent, userId, sessionId, formatType } = req.body;

    // Debug: Log dos dados recebidos
    console.log('🔍 AI Response Debug - Dados recebidos:', {
      question: question ? 'presente' : 'ausente',
      botPerguntaResponse: botPerguntaResponse ? 'presente' : 'ausente',
      articleContent: articleContent ? 'presente' : 'ausente',
      userId: userId || 'não fornecido',
      sessionId: sessionId || 'não fornecido',
      formatType: formatType || 'conversational'
    });

    if (!question || !botPerguntaResponse) {
      console.log('❌ AI Response: Validação falhou - question:', !!question, 'botPerguntaResponse:', !!botPerguntaResponse);
      return res.status(400).json({
        success: false,
        error: 'Pergunta e resposta do Bot_perguntas são obrigatórias'
      });
    }

    const cleanUserId = userId || 'anonymous';
    const cleanSessionId = sessionId || null;

    console.log(`🤖 AI Button: Nova solicitação de ${cleanUserId} para resposta conversacional`);

    // Verificar se IA está configurada
    if (!aiService.isConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Serviço de IA não configurado',
        response: 'Desculpe, o serviço de IA não está disponível no momento.'
      });
    }

    // Construir contexto para a IA
    let context = `Resposta do Bot_perguntas: ${botPerguntaResponse}`;
    
    if (articleContent) {
      context += `\n\nConteúdo do artigo relacionado: ${articleContent}`;
    }

    // Obter ou criar sessão se disponível
    const session = cleanSessionId ? sessionService.getOrCreateSession(cleanUserId, cleanSessionId) : null;
    const sessionHistory = session ? sessionService.getSessionHistory(session.id) : [];

    // Determinar IA primária baseada na disponibilidade (mesma lógica da inicialização)
    const aiStatus = await aiService.testConnection();
    let primaryAI = null;
    
    if (aiStatus.openai.available) {
      // Cenário 1: OpenAI OK → OpenAI primária + Gemini secundária + pesquisa convencional fallback
      primaryAI = 'OpenAI';
    } else if (aiStatus.gemini.available) {
      // Cenário 2: OpenAI NULL + Gemini OK → Gemini primária + OpenAI secundária + pesquisa convencional fallback
      primaryAI = 'Gemini';
    } else {
      // Cenário 3: OpenAI NULL + Gemini NULL → Mantém primeira opção + pesquisa convencional fallback
      primaryAI = 'OpenAI';
    }
    
    // Gerar resposta conversacional da IA
    const aiResult = await aiService.generateResponse(
      question,
      context,
      sessionHistory,
      cleanUserId,
      cleanUserId,
      null, // searchResults
      formatType || 'conversational',
      primaryAI
    );

    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao gerar resposta da IA',
        response: aiResult.response
      });
    }

    // Adicionar mensagem à sessão
    if (session) {
      sessionService.addMessage(session.id, 'bot', aiResult.response, {
        timestamp: new Date(),
        source: 'ai_button',
        aiProvider: aiResult.provider,
        botPerguntaUsed: null,
        articlesUsed: [],
        sitesUsed: false
      });
    }

    // Log da atividade
    await userActivityLogger.logQuestion(cleanUserId, `AI Button: ${question}`, cleanSessionId);

    // Resposta de sucesso
    const responseData = {
      success: true,
      response: aiResult.response,
      aiProvider: aiResult.provider,
      model: aiResult.model,
      source: 'ai_button',
      timestamp: new Date().toISOString(),
      sessionId: cleanSessionId
    };

    console.log(`✅ AI Button: Resposta conversacional gerada por ${aiResult.provider} para ${cleanUserId}`);
    
    res.json(responseData);

  } catch (error) {
    console.error('❌ AI Button Error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      response: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Rota para servir o React app (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
console.log('🔄 Iniciando servidor...');
console.log(`📍 Porta configurada: ${PORT}`);
console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`📁 Diretório de trabalho: ${process.cwd()}`);
console.log(`📁 Arquivos no diretório:`, require('fs').readdirSync('.'));

console.log('🚀 Tentando iniciar servidor na porta', PORT);

const server = app.listen(PORT, '0.0.0.0', (error) => {
  if (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
  
  console.log(`✅ Servidor backend rodando na porta ${PORT}`);
  console.log(`🌐 Acessível em: http://localhost:${PORT}`);
  console.log(`🌐 Acessível na rede local: http://0.0.0.0:${PORT}`);
  console.log(`📡 Endpoint principal: http://localhost:${PORT}/api/data`);
  console.log(`📡 Teste a API em: http://localhost:${PORT}/api/test`);
  
  // Tentar conectar ao MongoDB em background (não bloqueia o startup)
  connectToMongo().catch(error => {
    console.warn('⚠️ MongoDB: Falha na conexão inicial, tentando reconectar...', error.message);
  });
  
  // Inicializar cache de status dos módulos
  setTimeout(async () => {
    try {
      console.log('🚀 Inicializando cache de status dos módulos...');
      await getModuleStatus();
      console.log('✅ Cache de status inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar cache de status:', error);
    }
  }, 2000); // Aguardar 2 segundos para MongoDB conectar
});

// Log de erro se o servidor não conseguir iniciar
server.on('error', (error) => {
  console.error('❌ Erro no servidor:', error);
  process.exit(1);
});

server.on('listening', () => {
  console.log('🎉 Servidor está escutando na porta', PORT);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  // Não encerrar o processo, apenas logar o erro
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  // Não encerrar o processo, apenas logar o erro
});

// ========================================
// SISTEMA DE CONTROLE DE STATUS DOS MÓDULOS
// ========================================

// Cache do status dos módulos (atualizado do MongoDB)
let moduleStatusCache = {
  'credito-trabalhador': 'on',
  'credito-pessoal': 'on',
  'antecipacao': 'off',
  'pagamento-antecipado': 'on',
  'modulo-irpf': 'off'
};

// Timestamp do último cache para controle de validade
let lastCacheUpdate = null;
const CACHE_VALIDITY_MS = 3 * 60 * 1000; // 3 minutos

// Forçar atualização imediata do cache na inicialização
console.log('🔄 Forçando atualização inicial do cache de status...');

/**
 * Busca o status mais recente dos módulos no MongoDB
 * @returns {Promise<Object>} Status dos módulos
 */
const fetchModuleStatusFromMongoDB = async () => {
  try {
    console.log('🔍 fetchModuleStatusFromMongoDB: Iniciando busca...');
    
    if (!client) {
      console.warn('⚠️ MongoDB client não configurado - usando cache local');
      return moduleStatusCache;
    }

    console.log('🔍 Conectando ao MongoDB...');
    await connectToMongo();
    const db = client.db('console_config');
    const collection = db.collection('module_status');

    console.log('🔍 Buscando documento mais recente na collection module_status...');
    // Buscar o documento mais recente (maior createdAt)
    const latestStatus = await collection
      .findOne({}, { sort: { createdAt: -1 } });

    console.log('🔍 Documento encontrado no MongoDB:', latestStatus);

    if (!latestStatus) {
      console.warn('⚠️ Nenhum status encontrado no MongoDB - usando cache local');
      return moduleStatusCache;
    }

    // Mapear campos do MongoDB para o formato esperado pelo frontend
    const mappedStatus = {
      'credito-trabalhador': latestStatus._trabalhador || 'on',
      'credito-pessoal': latestStatus._pessoal || 'on',
      'antecipacao': latestStatus._antecipacao || 'revisao',
      'pagamento-antecipado': latestStatus._pgtoAntecip || 'off',
      'modulo-irpf': latestStatus._irpf || 'on'
    };

    console.log('📊 Status dos módulos mapeado do MongoDB:', mappedStatus);
    console.log('📊 Campos originais do MongoDB:', {
      _trabalhador: latestStatus._trabalhador,
      _pessoal: latestStatus._pessoal,
      _antecipacao: latestStatus._antecipacao,
      _pgtoAntecip: latestStatus._pgtoAntecip,
      _irpf: latestStatus._irpf
    });
    
    console.log('✅ fetchModuleStatusFromMongoDB: Busca concluída com sucesso');
    return mappedStatus;

  } catch (error) {
    console.error('❌ Erro ao buscar status dos módulos do MongoDB:', error);
    console.error('❌ Stack trace:', error.stack);
    console.log('🔄 Usando cache local como fallback');
    return moduleStatusCache; // Fallback para cache local
  }
};

/**
 * Atualiza o cache se necessário (baseado no tempo)
 * @returns {Promise<Object>} Status atual dos módulos
 */
const getModuleStatus = async () => {
  const now = Date.now();
  
  // Se cache é válido, retornar cache
  if (lastCacheUpdate && (now - lastCacheUpdate) < CACHE_VALIDITY_MS) {
    console.log('📊 Cache válido - retornando cache:', moduleStatusCache);
    return moduleStatusCache;
  }

  // Cache expirado ou inexistente - buscar do MongoDB
  console.log('🔄 Cache expirado - buscando status do MongoDB...');
  console.log('🔄 Cache atual:', moduleStatusCache);
  console.log('🔄 Última atualização:', lastCacheUpdate);
  
  const freshStatus = await fetchModuleStatusFromMongoDB();
  
  // Atualizar cache
  moduleStatusCache = freshStatus;
  lastCacheUpdate = now;
  
  console.log('🔄 Cache atualizado:', moduleStatusCache);
  return moduleStatusCache;
};

// Endpoint para buscar status dos módulos (GET)
app.get('/api/module-status', async (req, res) => {
  try {
    console.log('📊 Status dos módulos solicitado - Iniciando...');
    console.log('📊 Headers da requisição:', req.headers);
    
    // Garantir que sempre retornamos JSON
    res.setHeader('Content-Type', 'application/json');
    
    const currentStatus = await getModuleStatus();
    console.log('📊 Status obtido do MongoDB/cache:', currentStatus);
    
    // Garantir que sempre retornamos dados válidos
    const validStatus = {
      'credito-trabalhador': currentStatus['credito-trabalhador'] || 'on',
      'credito-pessoal': currentStatus['credito-pessoal'] || 'on',
      'antecipacao': currentStatus['antecipacao'] || 'revisao',
      'pagamento-antecipado': currentStatus['pagamento-antecipado'] || 'off',
      'modulo-irpf': currentStatus['modulo-irpf'] || 'on'
    };
    
    console.log('📊 Retornando status dos módulos:', validStatus);
    console.log('📊 Status dos módulos enviado com sucesso');
    
    res.json(validStatus);
  } catch (error) {
    console.error('❌ Erro ao buscar status dos módulos:', error);
    console.error('❌ Stack trace:', error.stack);
    
    // Garantir que sempre retornamos JSON mesmo em caso de erro
    res.setHeader('Content-Type', 'application/json');
    
    // Fallback com dados padrão em caso de erro
    const fallbackStatus = {
      'credito-trabalhador': 'on',
      'credito-pessoal': 'on',
      'antecipacao': 'off',
      'pagamento-antecipado': 'on',
      'modulo-irpf': 'off'
    };
    
    console.log('🔄 Usando status fallback:', fallbackStatus);
    console.log('🔄 Status fallback enviado com sucesso');
    
    res.json(fallbackStatus);
  }
});

// Endpoint para atualizar status dos módulos (POST) - Console VeloHub
app.post('/api/module-status', async (req, res) => {
  try {
    const { moduleKey, status } = req.body;
    
    // Validar entrada
    if (!moduleKey || !status) {
      return res.status(400).json({ error: 'moduleKey e status são obrigatórios' });
    }
    
    if (!['on', 'off', 'revisao'].includes(status)) {
      return res.status(400).json({ error: 'Status deve ser: on, off ou revisao' });
    }
    
    // Validar se o módulo existe no cache atual
    const currentStatus = await getModuleStatus();
    if (!currentStatus.hasOwnProperty(moduleKey)) {
      return res.status(400).json({ error: 'Módulo não encontrado' });
    }
    
    // Mapear moduleKey para campo do MongoDB
    const mongoFieldMap = {
      'credito-trabalhador': '_trabalhador',
      'credito-pessoal': '_pessoal',
      'antecipacao': '_antecipacao',
      'pagamento-antecipado': '_pgtoAntecip',
      'modulo-irpf': '_irpf'
    };
    
    const mongoField = mongoFieldMap[moduleKey];
    if (!mongoField) {
      return res.status(400).json({ error: 'Módulo não mapeado para MongoDB' });
    }
    
    // Atualizar no MongoDB
    if (client) {
      try {
        await connectToMongo();
        const db = client.db('console_config');
        const collection = db.collection('module_status');
        
        // Criar novo documento com status atualizado
        const updateData = {
          ...currentStatus,
          [mongoField]: status,
          updatedAt: new Date()
        };
        
        // Mapear de volta para campos do MongoDB
        const mongoData = {
          _trabalhador: updateData['credito-trabalhador'],
          _pessoal: updateData['credito-pessoal'],
          _antecipacao: updateData['antecipacao'],
          _pgtoAntecip: updateData['pagamento-antecipado'],
          _irpf: updateData['modulo-irpf'],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await collection.insertOne(mongoData);
        console.log(`✅ Status do módulo ${moduleKey} salvo no MongoDB: ${status}`);
        
        // Invalidar cache para forçar refresh na próxima consulta
        lastCacheUpdate = null;
        
      } catch (mongoError) {
        console.error('❌ Erro ao salvar no MongoDB:', mongoError);
        // Continuar com atualização local mesmo se MongoDB falhar
      }
    }
    
    // Atualizar cache local
    const oldStatus = currentStatus[moduleKey];
    moduleStatusCache[moduleKey] = status;
    lastCacheUpdate = Date.now();
    
    console.log(`🔄 Status do módulo ${moduleKey} alterado: ${oldStatus} → ${status}`);
    
    res.json({ 
      success: true, 
      message: `Status do módulo ${moduleKey} atualizado para ${status}`,
      moduleStatus: moduleStatusCache 
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar status dos módulos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para atualizar múltiplos módulos (PUT) - Console VeloHub
app.put('/api/module-status', async (req, res) => {
  try {
    const newStatus = req.body;
    
    // Validar se é um objeto
    if (typeof newStatus !== 'object' || Array.isArray(newStatus)) {
      return res.status(400).json({ error: 'Body deve ser um objeto com os status dos módulos' });
    }
    
    // Obter status atual
    const currentStatus = await getModuleStatus();
    
    // Validar cada status
    for (const [moduleKey, status] of Object.entries(newStatus)) {
      if (!currentStatus.hasOwnProperty(moduleKey)) {
        return res.status(400).json({ error: `Módulo ${moduleKey} não encontrado` });
      }
      
      if (!['on', 'off', 'revisao'].includes(status)) {
        return res.status(400).json({ error: `Status inválido para ${moduleKey}: ${status}` });
      }
    }
    
    // Atualizar no MongoDB
    if (client) {
      try {
        await connectToMongo();
        const db = client.db('console_config');
        const collection = db.collection('module_status');
        
        // Criar novo documento com todos os status atualizados
        const updatedStatus = { ...currentStatus, ...newStatus };
        
        // Mapear para campos do MongoDB
        const mongoData = {
          _trabalhador: updatedStatus['credito-trabalhador'],
          _pessoal: updatedStatus['credito-pessoal'],
          _antecipacao: updatedStatus['antecipacao'],
          _pgtoAntecip: updatedStatus['pagamento-antecipado'],
          _irpf: updatedStatus['modulo-irpf'],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await collection.insertOne(mongoData);
        console.log('✅ Status dos módulos salvos no MongoDB em lote:', newStatus);
        
        // Invalidar cache para forçar refresh na próxima consulta
        lastCacheUpdate = null;
        
      } catch (mongoError) {
        console.error('❌ Erro ao salvar no MongoDB:', mongoError);
        // Continuar com atualização local mesmo se MongoDB falhar
      }
    }
    
    // Atualizar cache local
    const oldStatus = { ...currentStatus };
    Object.assign(moduleStatusCache, newStatus);
    lastCacheUpdate = Date.now();
    
    console.log('🔄 Status dos módulos atualizados em lote:', newStatus);
    
    res.json({ 
      success: true, 
      message: 'Status dos módulos atualizados com sucesso',
      moduleStatus: moduleStatusCache,
      changes: newStatus
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar status dos módulos em lote:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
