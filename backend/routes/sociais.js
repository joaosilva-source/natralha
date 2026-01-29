// VERSION: v1.2.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
const express = require('express');
const router = express.Router();
const SociaisMetricas = require('../models/SociaisMetricas');

// Middleware para adicionar headers CORS em todas as rotas
const addCorsHeaders = (req, res, next) => {
  const origin = req.headers.origin;
  
  // Lista de origens permitidas (mesma do server.js)
  const allowedOrigins = [
    'https://app.velohub.velotax.com.br',
    'https://natralha-rrm3.onrender.com',
    'https://velohub-backend.onrender.com',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5000'
  ];
  
  const isAllowed = !origin || 
    allowedOrigins.includes(origin) ||
    /^https:\/\/.*\.onrender\.com$/.test(origin) ||
    /^https:\/\/.*\.vercel\.(app|sh)$/.test(origin);
  
  if (isAllowed && origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  }
  
  next();
};

// IMPORTANTE: Tratamento de OPTIONS DEVE SER O PRIMEIRO, antes de qualquer outra rota
// Isso garante que requisições preflight sejam tratadas corretamente
router.options('*', (req, res) => {
  const origin = req.headers.origin;
  console.log(`🔍 [OPTIONS Preflight] ${req.method} ${req.path} - Origin: ${origin || 'sem origem'}`);
  
  const allowedOrigins = [
    'https://app.velohub.velotax.com.br',
    'https://natralha-rrm3.onrender.com',
    'https://velohub-backend.onrender.com',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5000'
  ];
  
  const isAllowed = !origin || 
    allowedOrigins.includes(origin) ||
    /^https:\/\/.*\.onrender\.com$/.test(origin) ||
    /^https:\/\/.*\.vercel\.(app|sh)$/.test(origin);
  
  if (isAllowed) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    console.log(`✅ [OPTIONS] Headers CORS enviados para: ${origin || 'sem origem'}`);
    return res.status(200).end();
  }
  
  console.log(`⚠️ [OPTIONS] Origem não permitida: ${origin}`);
  res.status(403).end();
});

// Aplicar middleware CORS em todas as rotas (depois do OPTIONS)
router.use(addCorsHeaders);

// Garantir que funções globais existam (no-op se não estiverem definidas)
if (typeof global.emitTraffic !== 'function') {
  global.emitTraffic = () => {};
}
if (typeof global.emitLog !== 'function') {
  global.emitLog = () => {};
}
if (typeof global.emitJson !== 'function') {
  global.emitJson = () => {};
}
if (typeof global.emitJsonInput !== 'function') {
  global.emitJsonInput = () => {};
}

// Lazy require do geminiService para não bloquear startup se módulo não estiver disponível
let geminiService = null;
const getGeminiService = () => {
  if (!geminiService) {
    try {
      geminiService = require('../services/geminiService');
    } catch (error) {
      console.error('⚠️ Erro ao carregar geminiService:', error.message);
      console.error('⚠️ Funcionalidades de IA não estarão disponíveis');
      geminiService = { error: true, message: error.message };
    }
  }
  return geminiService;
};

// POST /api/sociais/tabulation - Criar nova tabulação
router.post('/tabulation', async (req, res) => {
  console.log('📥 [Route] POST /api/sociais/tabulation - Requisição recebida');
  console.log('📥 [Route] Origin:', req.headers.origin);
  console.log('📥 [Route] Headers:', JSON.stringify(req.headers, null, 2));
  console.log('📥 [Route] Body recebido:', JSON.stringify(req.body, null, 2));
  
  // Garantir headers CORS na resposta
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://app.velohub.velotax.com.br',
    'https://natralha-rrm3.onrender.com',
    'https://velohub-backend.onrender.com',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5000'
  ];
  
  const isAllowed = !origin || 
    allowedOrigins.includes(origin) ||
    /^https:\/\/.*\.onrender\.com$/.test(origin) ||
    /^https:\/\/.*\.vercel\.(app|sh)$/.test(origin);
  
  if (isAllowed && origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  }
  
  try {
    // Garantir que o banco está conectado antes de processar
    const { connectToDatabase } = require('../config/database');
    try {
      await connectToDatabase();
      console.log('✅ [Route] MongoDB conectado antes de processar tabulação');
    } catch (dbError) {
      console.error('❌ [Route] Erro ao conectar ao MongoDB:', dbError.message);
      console.error('❌ [Route] Stack:', dbError.stack);
      // Retornar erro se não conseguir conectar
      return res.status(503).json({
        success: false,
        error: 'Serviço temporariamente indisponível: Banco de dados não conectado',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }
    
    global.emitTraffic('Sociais', 'received', 'Entrada recebida - POST /api/sociais/tabulation');
    global.emitLog('info', 'POST /api/sociais/tabulation - Criando nova tabulação');
    
    const { clientName, socialNetwork, messageText, rating, contactReason, sentiment, directedCenter, link, createdAt } = req.body;
    
    console.log('📥 [Route] Dados extraídos:', {
      clientName,
      socialNetwork,
      messageText: messageText ? `${messageText.substring(0, 50)}...` : null,
      rating,
      contactReason,
      sentiment,
      directedCenter,
      link,
      createdAt
    });
    
    if (!clientName || !socialNetwork || !messageText) {
      global.emitTraffic('Sociais', 'error', 'Dados obrigatórios ausentes');
      global.emitLog('error', 'POST /api/sociais/tabulation - clientName, socialNetwork e messageText são obrigatórios');
      return res.status(400).json({ 
        success: false, 
        error: 'clientName, socialNetwork e messageText são obrigatórios' 
      });
    }

    const tabulationData = {
      clientName,
      socialNetwork,
      messageText,
      rating: rating || null,
      contactReason: contactReason || null,
      sentiment: sentiment || null,
      directedCenter: directedCenter !== undefined ? Boolean(directedCenter) : false,
      link: link || null,
      createdAt: createdAt || null
    };

    // OUTBOUND: Schema sendo enviado para MongoDB
    global.emitJson(tabulationData);

    global.emitTraffic('Sociais', 'processing', 'Transmitindo para DB');
    console.log('🔄 [Route] Chamando SociaisMetricas.create...');
    const result = await SociaisMetricas.create(tabulationData);
    console.log('📥 [Route] Resultado de SociaisMetricas.create:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      global.emitTraffic('Sociais', 'completed', 'Concluído - Tabulação criada com sucesso');
      global.emitLog('success', `POST /api/sociais/tabulation - Tabulação criada com sucesso`);
      
      console.log('✅ [Route] Tabulação criada com sucesso, enviando resposta 201');
      // INBOUND: Resposta para o frontend
      global.emitJsonInput(result);
      return res.status(201).json(result);
    } else {
      global.emitTraffic('Sociais', 'error', result.error || 'Erro ao criar tabulação');
      global.emitLog('error', `POST /api/sociais/tabulation - ${result.error}`);
      console.error('❌ [Route] Erro ao criar tabulação:', result.error);
      return res.status(400).json(result);
    }
  } catch (error) {
    global.emitTraffic('Sociais', 'error', 'Erro interno do servidor');
    global.emitLog('error', `POST /api/sociais/tabulation - Erro: ${error.message}`);
    console.error('❌ [Route] Erro detalhado em /tabulation:', error);
    console.error('❌ [Route] Stack trace:', error.stack);
    console.error('❌ [Route] Error name:', error.name);
    console.error('❌ [Route] Error message:', error.message);
    
    // Retornar mensagem de erro mais detalhada
    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : `Erro interno do servidor: ${error.message}`;
    
    return res.status(500).json({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/sociais/tabulations - Listar tabulações com filtros
router.get('/tabulations', async (req, res) => {
  try {
    console.log('📊 [Route] GET /api/sociais/tabulations - Requisição recebida');
    console.log('📊 [Route] Origin:', req.headers.origin);
    console.log('📊 [Route] Query params:', req.query);
    
    global.emitTraffic('Sociais', 'received', 'Entrada recebida - GET /api/sociais/tabulations');
    global.emitLog('info', 'GET /api/sociais/tabulations - Listando tabulações');
    
    // Extrair filtros da query string
    const filters = {};
    
    if (req.query.socialNetwork) {
      filters.socialNetwork = Array.isArray(req.query.socialNetwork) 
        ? req.query.socialNetwork 
        : [req.query.socialNetwork];
    }
    
    if (req.query.contactReason) {
      filters.contactReason = Array.isArray(req.query.contactReason) 
        ? req.query.contactReason 
        : [req.query.contactReason];
    }
    
    if (req.query.sentiment) {
      filters.sentiment = Array.isArray(req.query.sentiment) 
        ? req.query.sentiment 
        : [req.query.sentiment];
    }
    
    if (req.query.dateFrom) {
      filters.dateFrom = req.query.dateFrom;
    }
    
    if (req.query.dateTo) {
      filters.dateTo = req.query.dateTo;
    }
    
    global.emitTraffic('Sociais', 'processing', 'Consultando DB');
    const result = await SociaisMetricas.getAll(filters);
    
    global.emitTraffic('Sociais', 'completed', 'Concluído - Tabulações listadas com sucesso');
    global.emitLog('success', `GET /api/sociais/tabulations - ${result.count} tabulações encontradas`);
    
    // INBOUND: Resposta para o frontend
    global.emitJsonInput(result);
    res.json(result);
  } catch (error) {
    global.emitTraffic('Sociais', 'error', 'Erro ao listar tabulações');
    global.emitLog('error', `GET /api/sociais/tabulations - Erro: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// GET /api/sociais/dashboard/metrics - Métricas do dashboard
router.get('/dashboard/metrics', async (req, res) => {
  try {
    console.log('📊 [Route] GET /api/sociais/dashboard/metrics - Requisição recebida');
    console.log('📊 [Route] Origin:', req.headers.origin);
    console.log('📊 [Route] Query params:', req.query);
    
    global.emitTraffic('Sociais', 'received', 'Entrada recebida - GET /api/sociais/dashboard/metrics');
    global.emitLog('info', 'GET /api/sociais/dashboard/metrics - Obtendo métricas');
    
    // Verificar se o banco está conectado
    try {
      const { getSociaisDatabase } = require('../config/database');
      getSociaisDatabase();
    } catch (dbError) {
      global.emitTraffic('Sociais', 'error', 'Banco de dados não conectado');
      global.emitLog('error', `GET /api/sociais/dashboard/metrics - Banco não conectado: ${dbError.message}`);
      return res.status(503).json({ 
        success: false, 
        error: 'Banco de dados não disponível. Tente novamente em alguns instantes.',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }
    
    // Extrair filtros da query string
    const filters = {};
    
    if (req.query.socialNetwork) {
      filters.socialNetwork = Array.isArray(req.query.socialNetwork) 
        ? req.query.socialNetwork 
        : [req.query.socialNetwork];
    }
    
    if (req.query.contactReason) {
      filters.contactReason = Array.isArray(req.query.contactReason) 
        ? req.query.contactReason 
        : [req.query.contactReason];
    }
    
    if (req.query.dateFrom) {
      filters.dateFrom = req.query.dateFrom;
    }
    
    if (req.query.dateTo) {
      filters.dateTo = req.query.dateTo;
    }
    
    global.emitTraffic('Sociais', 'processing', 'Calculando métricas');
    const result = await SociaisMetricas.getMetrics(filters);
    
    if (result.success) {
      global.emitTraffic('Sociais', 'completed', 'Concluído - Métricas obtidas com sucesso');
      global.emitLog('success', 'GET /api/sociais/dashboard/metrics - Métricas obtidas com sucesso');
      
      // INBOUND: Resposta para o frontend
      global.emitJsonInput(result);
      res.json(result);
    } else {
      global.emitTraffic('Sociais', 'error', result.error);
      global.emitLog('error', `GET /api/sociais/dashboard/metrics - ${result.error}`);
      res.status(500).json(result);
    }
  } catch (error) {
    global.emitTraffic('Sociais', 'error', 'Erro interno do servidor');
    global.emitLog('error', `GET /api/sociais/dashboard/metrics - Erro: ${error.message}`);
    console.error('Erro detalhado em /dashboard/metrics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/sociais/dashboard/charts - Dados para gráficos
router.get('/dashboard/charts', async (req, res) => {
  try {
    console.log('📊 [Route] GET /api/sociais/dashboard/charts - Requisição recebida');
    console.log('📊 [Route] Origin:', req.headers.origin);
    console.log('📊 [Route] Query params:', req.query);
    
    global.emitTraffic('Sociais', 'received', 'Entrada recebida - GET /api/sociais/dashboard/charts');
    global.emitLog('info', 'GET /api/sociais/dashboard/charts - Obtendo dados para gráficos');
    
    // Verificar se o banco está conectado
    try {
      const { getSociaisDatabase } = require('../config/database');
      getSociaisDatabase();
    } catch (dbError) {
      global.emitTraffic('Sociais', 'error', 'Banco de dados não conectado');
      global.emitLog('error', `GET /api/sociais/dashboard/charts - Banco não conectado: ${dbError.message}`);
      return res.status(503).json({ 
        success: false, 
        error: 'Banco de dados não disponível. Tente novamente em alguns instantes.',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }
    
    // Extrair filtros da query string
    const filters = {};
    
    if (req.query.socialNetwork) {
      filters.socialNetwork = Array.isArray(req.query.socialNetwork) 
        ? req.query.socialNetwork 
        : [req.query.socialNetwork];
    }
    
    if (req.query.contactReason) {
      filters.contactReason = Array.isArray(req.query.contactReason) 
        ? req.query.contactReason 
        : [req.query.contactReason];
    }
    
    if (req.query.dateFrom) {
      filters.dateFrom = req.query.dateFrom;
    }
    
    if (req.query.dateTo) {
      filters.dateTo = req.query.dateTo;
    }
    
    global.emitTraffic('Sociais', 'processing', 'Consultando dados para gráficos');
    const result = await SociaisMetricas.getChartData(filters);
    
    if (result.success) {
      global.emitTraffic('Sociais', 'completed', 'Concluído - Dados para gráficos obtidos com sucesso');
      global.emitLog('success', 'GET /api/sociais/dashboard/charts - Dados obtidos com sucesso');
      
      // INBOUND: Resposta para o frontend
      global.emitJsonInput(result);
      res.json(result);
    } else {
      global.emitTraffic('Sociais', 'error', result.error);
      global.emitLog('error', `GET /api/sociais/dashboard/charts - ${result.error}`);
      res.status(500).json(result);
    }
  } catch (error) {
    global.emitTraffic('Sociais', 'error', 'Erro interno do servidor');
    global.emitLog('error', `GET /api/sociais/dashboard/charts - Erro: ${error.message}`);
    console.error('Erro detalhado em /dashboard/charts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/sociais/rating/average - Média de ratings
router.get('/rating/average', async (req, res) => {
  try {
    console.log('📊 [Route] GET /api/sociais/rating/average - Requisição recebida');
    console.log('📊 [Route] Origin:', req.headers.origin);
    console.log('📊 [Route] Query params:', req.query);
    
    global.emitTraffic('Sociais', 'received', 'Entrada recebida - GET /api/sociais/rating/average');
    global.emitLog('info', 'GET /api/sociais/rating/average - Obtendo média de ratings');
    
    // Verificar se o banco está conectado
    try {
      const { getSociaisDatabase } = require('../config/database');
      getSociaisDatabase();
    } catch (dbError) {
      global.emitTraffic('Sociais', 'error', 'Banco de dados não conectado');
      global.emitLog('error', `GET /api/sociais/rating/average - Banco não conectado: ${dbError.message}`);
      return res.status(503).json({ 
        success: false, 
        error: 'Banco de dados não disponível. Tente novamente em alguns instantes.',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }
    
    // Extrair filtros da query string
    const filters = {};
    
    if (req.query.socialNetwork && req.query.socialNetwork !== '') {
      filters.socialNetwork = req.query.socialNetwork;
    }
    
    if (req.query.dateFrom) {
      filters.dateFrom = req.query.dateFrom;
    }
    
    if (req.query.dateTo) {
      filters.dateTo = req.query.dateTo;
    }
    
    global.emitTraffic('Sociais', 'processing', 'Calculando média de ratings');
    const result = await SociaisMetricas.getRatingAverage(filters);
    
    if (result.success) {
      global.emitTraffic('Sociais', 'completed', 'Concluído - Média de ratings obtida com sucesso');
      global.emitLog('success', `GET /api/sociais/rating/average - Média: ${result.data?.average || 'N/A'}`);
      
      // INBOUND: Resposta para o frontend
      global.emitJsonInput(result);
      res.json(result);
    } else {
      global.emitTraffic('Sociais', 'error', result.error);
      global.emitLog('error', `GET /api/sociais/rating/average - ${result.error}`);
      res.status(500).json(result);
    }
  } catch (error) {
    global.emitTraffic('Sociais', 'error', 'Erro interno do servidor');
    global.emitLog('error', `GET /api/sociais/rating/average - Erro: ${error.message}`);
    console.error('Erro detalhado em /rating/average:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/sociais/feed - Feed de atendimentos
router.get('/feed', async (req, res) => {
  try {
    global.emitTraffic('Sociais', 'received', 'Entrada recebida - GET /api/sociais/feed');
    global.emitLog('info', 'GET /api/sociais/feed - Obtendo feed de atendimentos');
    
    // Extrair filtros da query string (mesmo padrão do tabulations)
    const filters = {};
    
    if (req.query.socialNetwork) {
      filters.socialNetwork = Array.isArray(req.query.socialNetwork) 
        ? req.query.socialNetwork 
        : [req.query.socialNetwork];
    }
    
    if (req.query.contactReason) {
      filters.contactReason = Array.isArray(req.query.contactReason) 
        ? req.query.contactReason 
        : [req.query.contactReason];
    }
    
    if (req.query.sentiment) {
      filters.sentiment = Array.isArray(req.query.sentiment) 
        ? req.query.sentiment 
        : [req.query.sentiment];
    }
    
    if (req.query.dateFrom) {
      filters.dateFrom = req.query.dateFrom;
    }
    
    if (req.query.dateTo) {
      filters.dateTo = req.query.dateTo;
    }
    
    global.emitTraffic('Sociais', 'processing', 'Consultando feed');
    const result = await SociaisMetricas.getAll(filters);
    
    global.emitTraffic('Sociais', 'completed', 'Concluído - Feed obtido com sucesso');
    global.emitLog('success', `GET /api/sociais/feed - ${result.count} atendimentos encontrados`);
    
    // INBOUND: Resposta para o frontend
    global.emitJsonInput(result);
    res.json(result);
  } catch (error) {
    global.emitTraffic('Sociais', 'error', 'Erro ao obter feed');
    global.emitLog('error', `GET /api/sociais/feed - Erro: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// POST /api/sociais/analyze - Análise de sentimento/motivo via IA
router.post('/analyze', async (req, res) => {
  try {
    global.emitTraffic('Sociais', 'received', 'Entrada recebida - POST /api/sociais/analyze');
    global.emitLog('info', 'POST /api/sociais/analyze - Analisando texto com IA');
    
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      global.emitTraffic('Sociais', 'error', 'Texto inválido');
      global.emitLog('error', 'POST /api/sociais/analyze - Texto é obrigatório');
      return res.status(400).json({ 
        success: false, 
        error: 'Texto é obrigatório' 
      });
    }

    global.emitTraffic('Sociais', 'processing', 'Consultando IA');
    const gemini = getGeminiService();
    if (gemini.error || !gemini.analyzeSentimentAndReason) {
      return res.status(503).json({
        success: false,
        error: 'Serviço de IA não disponível',
        fallback: {
          sentiment: 'Neutro',
          reason: 'Suporte'
        }
      });
    }
    const result = await gemini.analyzeSentimentAndReason(text);
    
    if (result.success) {
      global.emitTraffic('Sociais', 'completed', 'Concluído - Análise realizada com sucesso');
      global.emitLog('success', `POST /api/sociais/analyze - Análise: ${result.data.sentiment} / ${result.data.reason}`);
      
      // INBOUND: Resposta para o frontend
      global.emitJsonInput(result);
      res.json(result);
    } else {
      // Se falhar, retornar fallback se disponível
      if (result.fallback) {
        global.emitTraffic('Sociais', 'warning', 'Usando fallback da análise');
        global.emitLog('warning', `POST /api/sociais/analyze - Usando valores padrão: ${result.fallback.sentiment} / ${result.fallback.reason}`);
        res.json({
          success: true,
          data: result.fallback,
          warning: result.error
        });
      } else {
        global.emitTraffic('Sociais', 'error', result.error);
        global.emitLog('error', `POST /api/sociais/analyze - ${result.error}`);
        res.status(500).json(result);
      }
    }
  } catch (error) {
    global.emitTraffic('Sociais', 'error', 'Erro interno do servidor');
    global.emitLog('error', `POST /api/sociais/analyze - Erro: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// POST /api/sociais/report - Gerar relatório executivo via IA
router.post('/report', async (req, res) => {
  try {
    global.emitTraffic('Sociais', 'received', 'Entrada recebida - POST /api/sociais/report');
    global.emitLog('info', 'POST /api/sociais/report - Gerando relatório executivo');
    
    // Pode receber dados diretamente ou filtros para buscar dados
    let data = req.body.data;
    const filters = req.body.filters;
    
    // Se filtros fornecidos, buscar dados do banco
    if (filters && !data) {
      global.emitTraffic('Sociais', 'processing', 'Buscando dados com filtros');
      const tabulationsResult = await SociaisMetricas.getAll(filters);
      
      if (!tabulationsResult.success || tabulationsResult.count === 0) {
        return res.status(404).json({
          success: false,
          error: 'Nenhum dado encontrado para os filtros fornecidos'
        });
      }
      
      // Preparar dados para o relatório
      data = tabulationsResult.data.map(item => ({
        socialNetwork: item.socialNetwork,
        contactReason: item.contactReason,
        sentiment: item.sentiment,
        messageText: item.messageText
      }));
    }
    
    if (!data) {
      global.emitTraffic('Sociais', 'error', 'Dados não fornecidos');
      global.emitLog('error', 'POST /api/sociais/report - Dados ou filtros são obrigatórios');
      return res.status(400).json({ 
        success: false, 
        error: 'Dados ou filtros são obrigatórios' 
      });
    }

    global.emitTraffic('Sociais', 'processing', 'Gerando relatório com IA');
    const gemini = getGeminiService();
    if (gemini.error || !gemini.generateExecutiveReport) {
      return res.status(503).json({
        success: false,
        error: 'Serviço de IA não disponível'
      });
    }
    const result = await gemini.generateExecutiveReport(data);
    
    if (result.success) {
      global.emitTraffic('Sociais', 'completed', 'Concluído - Relatório gerado com sucesso');
      global.emitLog('success', 'POST /api/sociais/report - Relatório gerado com sucesso');
      
      // INBOUND: Resposta para o frontend
      global.emitJsonInput(result);
      res.json(result);
    } else {
      global.emitTraffic('Sociais', 'error', result.error);
      global.emitLog('error', `POST /api/sociais/report - ${result.error}`);
      res.status(500).json(result);
    }
  } catch (error) {
    global.emitTraffic('Sociais', 'error', 'Erro interno do servidor');
    global.emitLog('error', `POST /api/sociais/report - Erro: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// GET /api/sociais/:id - Obter tabulação por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    global.emitTraffic('Sociais', 'received', `Entrada recebida - GET /api/sociais/${id}`);
    global.emitLog('info', `GET /api/sociais/${id} - Obtendo tabulação por ID`);
    
    global.emitTraffic('Sociais', 'processing', 'Consultando DB');
    const result = await SociaisMetricas.getById(id);
    
    if (result.success) {
      global.emitTraffic('Sociais', 'completed', 'Concluído - Tabulação obtida com sucesso');
      global.emitLog('success', `GET /api/sociais/${id} - Tabulação obtida com sucesso`);
      
      // INBOUND: Resposta para o frontend
      global.emitJsonInput(result);
      res.json(result);
    } else {
      global.emitTraffic('Sociais', 'error', result.error);
      global.emitLog('error', `GET /api/sociais/${id} - ${result.error}`);
      res.status(result.error === 'Tabulação não encontrada' ? 404 : 500).json(result);
    }
  } catch (error) {
    global.emitTraffic('Sociais', 'error', 'Erro interno do servidor');
    global.emitLog('error', `GET /api/sociais/:id - Erro: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// PUT /api/sociais/:id - Atualizar tabulação
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    global.emitTraffic('Sociais', 'received', `Entrada recebida - PUT /api/sociais/${id}`);
    global.emitLog('info', `PUT /api/sociais/${id} - Atualizando tabulação`);
    global.emitJson({ id, ...req.body });
    
    global.emitTraffic('Sociais', 'processing', 'Transmitindo para DB');
    const result = await SociaisMetricas.update(id, req.body);
    
    if (result.success) {
      global.emitTraffic('Sociais', 'completed', 'Concluído - Tabulação atualizada com sucesso');
      global.emitLog('success', `PUT /api/sociais/${id} - Tabulação atualizada com sucesso`);
      global.emitJson(result);
      res.json(result);
    } else {
      global.emitTraffic('Sociais', 'error', result.error);
      global.emitLog('error', `PUT /api/sociais/${id} - ${result.error}`);
      res.status(result.error === 'Tabulação não encontrada' ? 404 : 500).json(result);
    }
  } catch (error) {
    global.emitTraffic('Sociais', 'error', 'Erro interno do servidor');
    global.emitLog('error', `PUT /api/sociais/:id - Erro: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

// DELETE /api/sociais/:id - Deletar tabulação
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    global.emitTraffic('Sociais', 'received', `Entrada recebida - DELETE /api/sociais/${id}`);
    global.emitLog('info', `DELETE /api/sociais/${id} - Deletando tabulação`);
    global.emitJson({ id });

    global.emitTraffic('Sociais', 'processing', 'Transmitindo para DB');
    const result = await SociaisMetricas.delete(id);
    
    if (result.success) {
      global.emitTraffic('Sociais', 'completed', 'Concluído - Tabulação deletada com sucesso');
      global.emitLog('success', `DELETE /api/sociais/${id} - Tabulação deletada com sucesso`);
      global.emitJson(result);
      // INBOUND: Confirmação para o frontend
      global.emitJsonInput(result);
      res.json(result);
    } else {
      global.emitTraffic('Sociais', 'error', result.error);
      global.emitLog('error', `DELETE /api/sociais/${id} - ${result.error}`);
      res.status(result.error === 'Tabulação não encontrada' ? 404 : 500).json(result);
    }
  } catch (error) {
    global.emitTraffic('Sociais', 'error', 'Erro interno do servidor');
    global.emitLog('error', `DELETE /api/sociais/:id - Erro: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;
