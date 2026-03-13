// VERSION: v4.16.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
// Carregar variáveis de ambiente PRIMEIRO, antes de qualquer require que precise delas
// No Cloud Run, as variáveis já estão em process.env, então dotenv só é necessário em desenvolvimento
try {
  require('dotenv').config();
} catch (error) {
  // Ignorar erro se dotenv não conseguir carregar (normal em produção)
}

// Tratamento de erros não capturados
// IMPORTANTE: Não fazer exit(1) imediatamente para permitir que servidor escute na porta
let serverStarted = false;

process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado (uncaughtException):', error);
  console.error('❌ Stack trace:', error.stack);
  // Só fazer exit se servidor já iniciou (após timeout para Cloud Run)
  if (serverStarted) {
    setTimeout(() => process.exit(1), 5000);
  } else {
    console.error('⚠️ Erro antes do servidor iniciar, mas continuando...');
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada (unhandledRejection):', reason);
  console.error('❌ Promise:', promise);
  // Só fazer exit se servidor já iniciou
  if (serverStarted) {
    setTimeout(() => process.exit(1), 5000);
  } else {
    console.error('⚠️ Promise rejeitada antes do servidor iniciar, mas continuando...');
  }
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { connectToDatabase, checkDatabaseHealth } = require('./config/database');
const { initializeCollections, getCollectionsStats } = require('./config/collections');

// Importar rotas
const artigosRoutes = require('./routes/artigos');
const velonewsRoutes = require('./routes/velonews');
const botPerguntasRoutes = require('./routes/botPerguntas');
const igpRoutes = require('./routes/igp');
const tkConteudosRoutes = require('./routes/tkConteudos');
const tkGestaoRoutes = require('./routes/tkGestao');
const userPingRoutes = require('./routes/userPing');
const usersRoutes = require('./routes/users');
const moduleStatusRoutes = require('./routes/moduleStatus');
const faqBotRoutes = require('./routes/faqBot');
const qualidadeRoutes = require('./routes/qualidade');
const botAnalisesRoutes = require('./routes/botAnalises');
const botFeedbackRoutes = require('./routes/botFeedback');
const hubSessionsRoutes = require('./routes/hubSessions');
const velonewsAcknowledgmentsRoutes = require('./routes/velonewsAcknowledgments');
const hubAnalisesRoutes = require('./routes/hubAnalises');
const supportRoutes = require('./routes/support');
const academyCourseProgressRoutes = require('./routes/academyCourseProgress');
const academyCursosConteudoRoutes = require('./routes/academyCursosConteudo');
const academyCursosRoutes = require('./routes/academyCursos');
const academyModulosRoutes = require('./routes/academyModulos');
const academySecoesRoutes = require('./routes/academySecoes');
const academyAulasRoutes = require('./routes/academyAulas');
const mongodbInsertRoutes = require('./routes/mongodbInsert');
const mongodbCertificadosRoutes = require('./routes/mongodbCertificados');
const mongodbReprovasRoutes = require('./routes/mongodbReprovas');
const audioAnaliseRoutes = require('./routes/audioAnalise');
const uploadsRoutes = require('./routes/uploads');
const sociaisRoutes = require('./routes/sociais');

// Lazy require do WhatsApp para não bloquear startup se módulo não estiver disponível
let whatsappRoutes = null;
let baileysService = null;
const getWhatsappRoutes = () => {
  if (!whatsappRoutes) {
    try {
      whatsappRoutes = require('./routes/whatsapp');
    } catch (error) {
      console.error('⚠️ Erro ao carregar whatsappRoutes:', error.message);
      console.error('⚠️ Rotas WhatsApp não estarão disponíveis');
      whatsappRoutes = { error: true };
    }
  }
  return whatsappRoutes;
};

const getBaileysService = () => {
  if (!baileysService) {
    try {
      baileysService = require('./services/whatsapp/baileysService');
    } catch (error) {
      console.error('⚠️ Erro ao carregar baileysService:', error.message);
      console.error('⚠️ Serviço WhatsApp não estará disponível');
      baileysService = { error: true, initialize: async () => {} };
    }
  }
  return baileysService;
};

// Importar middleware
const { checkMonitoringFunctions } = require('./middleware/monitoring');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Configuração SSE - substitui Socket.IO
let sseClients = [];  // Array de { res, lastEventId }
let eventBuffer = []; // Buffer de eventos para reconexões

// Função para enviar evento SSE
const sendSSEEvent = (res, data, eventType = 'message', id = uuidv4()) => {
  const eventData = `id: ${id}\nevent: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  res.write(eventData);
};

// Broadcast para todos clientes
const broadcastEvent = (data, eventType = 'message') => {
  const id = uuidv4();
  // Adiciona ao buffer para reconexões
  eventBuffer.push({ id, type: eventType, data, timestamp: Date.now() });
  // Limpa buffer antigo (últimos 100 eventos)
  if (eventBuffer.length > 100) eventBuffer = eventBuffer.slice(-100);

  // Envia para clientes conectados
  sseClients.forEach(({ res, lastEventId }) => {
    if (!lastEventId || id > lastEventId) {
      sendSSEEvent(res, data, eventType, id);
    }
  });
};

// Broadcast específico para eventos de áudio
const broadcastAudioEvent = (audioId, status, data = {}) => {
  const eventData = {
    type: 'audio-analysis',
    audioId: audioId,
    status: status, // 'processando', 'concluido', 'erro'
    timestamp: new Date().toISOString(),
    ...data
  };
  broadcastEvent(eventData, 'audio-analysis');
};

// Tratamento explícito de requisições OPTIONS (preflight) - DEVE VIR PRIMEIRO
// Handler manual para garantir que preflight sempre retorne headers CORS corretos
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  // Permite origens do Render, Vercel, Cloud Run e localhost
  const isAllowed = !origin || 
    origin.includes('.onrender.com') || 
    origin.includes('.vercel.app') || 
    origin.includes('.run.app') ||
    origin.startsWith('http://localhost') ||
    origin.startsWith('https://localhost');
  
  res.setHeader('Access-Control-Allow-Origin', isAllowed && origin ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-User-Email, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

// Configuração CORS - DEVE VIR ANTES DO HELMET
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    // Lista de origens permitidas
    const allowedOrigins = [
      'https://natralha.onrender.com',
      'https://natralha-rrm3.onrender.com',
      'https://velohub-backend.onrender.com',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
      'https://velohub-278491073220.us-east1.run.app',
      'https://staging-skynet-278491073220.us-east1.run.app'
    ];
    
    // Permitir todas as origens do Render.com
    if (origin.includes('.onrender.com') || origin.includes('.vercel.app') || origin.includes('.run.app')) {
      return callback(null, true);
    }
    
    // Verificar se a origem está na lista permitida
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Em desenvolvimento, permitir todas as origens
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(null, true); // Permitir todas para evitar problemas
      }
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With", 
    "X-User-Email",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers"
  ],
  exposedHeaders: ["Content-Length", "Content-Type"],
  maxAge: 86400, // 24 horas
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Middleware de segurança - AJUSTADO PARA NÃO BLOQUEAR CORS
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-hashes'", "https://fonts.googleapis.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "ws:", "wss:", "https:", "*"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting - EXCLUIR OPTIONS (preflight requests)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // máximo 1000 requests por IP
  skip: (req) => req.method === 'OPTIONS' // Não aplicar rate limit em preflight requests
});
app.use('/api/', limiter);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (página de monitoramento)
app.use(express.static(path.join(__dirname, 'public')));

// Rota para favicon
app.get('/favicon.ico', (req, res) => {
  res.setHeader('Content-Type', 'image/x-icon');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.status(204).end();
});

// Middleware de monitoramento
app.use(checkMonitoringFunctions);

// Rotas da API
app.use('/api/artigos', artigosRoutes);
app.use('/api/velonews', velonewsRoutes);
app.use('/api/bot-perguntas', botPerguntasRoutes);
app.use('/api/igp', igpRoutes);
app.use('/api/tk-conteudos', tkConteudosRoutes);
app.use('/api/tk-gestao', tkGestaoRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/user-ping', userPingRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/module-status', moduleStatusRoutes);
app.use('/api/faq-bot', faqBotRoutes);
app.use('/api/qualidade', qualidadeRoutes);
app.use('/api/bot-analises', botAnalisesRoutes);
app.use('/api/bot-feedback', botFeedbackRoutes);
app.use('/api/hub-sessions', hubSessionsRoutes);
app.use('/api/velonews-acknowledgments', velonewsAcknowledgmentsRoutes);
app.use('/api/hub-analises', hubAnalisesRoutes);
app.use('/api/academy/course-progress', academyCourseProgressRoutes);
app.use('/api/academy/cursos-conteudo', academyCursosConteudoRoutes);
app.use('/api/academy/cursos', academyCursosRoutes);
app.use('/api/academy/modulos', academyModulosRoutes);
app.use('/api/academy/secoes', academySecoesRoutes);
app.use('/api/academy/aulas', academyAulasRoutes);
app.use('/api/mongodb', mongodbInsertRoutes);
app.use('/api/mongodb/certificados', mongodbCertificadosRoutes);
app.use('/api/mongodb/reprovas', mongodbReprovasRoutes);
app.use('/api/audio-analise', audioAnaliseRoutes);
app.use('/api/uploads', uploadsRoutes);
// Rotas WhatsApp com lazy loading
try {
  const whatsappRoutesLoaded = getWhatsappRoutes();
  if (!whatsappRoutesLoaded.error) {
    app.use('/api/whatsapp', whatsappRoutesLoaded);
  } else {
    app.use('/api/whatsapp', (req, res) => {
      res.status(503).json({ success: false, error: 'Serviço WhatsApp não disponível' });
    });
  }
} catch (error) {
  console.error('⚠️ Erro ao registrar rotas WhatsApp:', error.message);
  app.use('/api/whatsapp', (req, res) => {
    res.status(503).json({ success: false, error: 'Serviço WhatsApp não disponível' });
  });
}
app.use('/api/sociais', sociaisRoutes);

// Rota de health check
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const collectionsStats = await getCollectionsStats();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      version: '4.2.0',
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth,
      collections: collectionsStats
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      version: '4.2.0',
      error: error.message
    });
  }
});

// Rota raiz para verificar se a API está funcionando
app.get('/', (req, res) => {
  res.json({ 
    message: 'Console de Conteúdo VeloHub API v4.2.0',
    status: 'OK',
    timestamp: new Date().toISOString(),
    monitor: '/monitor.html'
  });
});

// Rota para a página de monitoramento
app.get('/monitor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'monitor.html'));
});

// Rota SSE principal para monitoramento
app.get('/events', (req, res) => {
  // Headers SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Reconexão: envia eventos perdidos via Last-Event-ID
  const lastEventId = req.headers['last-event-id'] || '0';
  const client = { res, lastEventId };

  sseClients.push(client);
  req.socket.setTimeout(0);  // Mantém conexão aberta

  // Envia eventos pendentes
  eventBuffer
    .filter(event => event.id > lastEventId)
    .forEach(event => sendSSEEvent(res, event.data, event.type, event.id));

  // Envia heartbeat a cada 15s para manter vivo
  const heartbeat = setInterval(() => {
    if (!res.writableEnded) {
      res.write(`: heartbeat\n\n`);
    }
  }, 15000);

  // Cleanup no disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients = sseClients.filter(c => c.res !== res);
    res.end();
  });

  // Mensagem inicial
  sendSSEEvent(res, { message: 'Conectado ao Monitor Skynet via SSE' }, 'connected');
});

// Rota catch-all para rotas não encontradas (deve vir ANTES do error handler)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.path,
    method: req.method,
    message: 'A rota solicitada não existe nesta API'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  });
});

// Funções globais de monitoramento via SSE
global.emitLog = (level, message) => {
  broadcastEvent({ 
    level, 
    message, 
    timestamp: new Date().toISOString() 
  }, 'console-log');
};

global.emitTraffic = (origin, status, message, details = null) => {
  broadcastEvent({ 
    origin, 
    status, 
    message, 
    details, 
    timestamp: new Date().toISOString() 
  }, 'api-traffic');
};

// Função para emitir dados OUTBOUND (Backend → MongoDB)
// Usado para mostrar schemas/dados que estão sendo enviados para o banco de dados
global.emitJson = (data) => {
  broadcastEvent({ 
    data, 
    timestamp: new Date().toISOString() 
  }, 'current-json');
};

// Função para emitir dados INBOUND (Backend → Frontend)
// Usado para mostrar payloads que estão sendo enviados para o frontend
global.emitJsonInput = (data) => {
  broadcastEvent({ 
    data, 
    timestamp: new Date().toISOString() 
  }, 'current-json-input');
};

// Função para broadcast de eventos de áudio via SSE
global.broadcastAudioEvent = (audioId, status, data = {}) => {
  broadcastAudioEvent(audioId, status, data);
};

// Inicializar servidor
const startServer = async () => {
  // Iniciar servidor PRIMEIRO para garantir que escute na porta (requisito do Cloud Run)
  console.log(`🔄 Iniciando servidor HTTP na porta ${PORT}...`);
  server.listen(PORT, '0.0.0.0', async () => {
    serverStarted = true; // Marcar que servidor iniciou
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Console de Conteúdo VeloHub v4.16.0`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 Monitor Skynet: http://localhost:${PORT}/monitor`);
    console.log(`🔄 SSE Events: http://localhost:${PORT}/events`);
    
    // Conectar ao MongoDB após servidor iniciar (não crítico para startup)
    try {
      console.log('🔄 Conectando ao MongoDB...');
      console.log(`📋 PORT: ${PORT}`);
      console.log(`📋 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📋 MONGO_ENV configurada: ${process.env.MONGO_ENV ? 'SIM' : 'NÃO'}`);
      
      await connectToDatabase();
      console.log('✅ MongoDB conectado via MongoClient');
      
      console.log('🔄 Inicializando collections...');
      await initializeCollections();
      console.log('✅ Collections inicializadas');
      
      // Configurar Mongoose
      const { getMongoUri } = require('./config/mongodb');
      const MONGODB_URI = getMongoUri();
      
      console.log('🔄 Conectando Mongoose...');
      await mongoose.connect(MONGODB_URI, {
        dbName: 'console_conteudo'
      });
      
      console.log(`🗄️ MongoDB: Conectado`);
      console.log(`📊 Collections: Inicializadas`);
      console.log(`🔗 Mongoose: Conectado ao console_conteudo`);
    } catch (error) {
      console.error('⚠️ Erro ao conectar MongoDB (não crítico):', error.message);
      console.error('⚠️ Servidor continuará rodando, MongoDB pode ser conectado posteriormente');
    }
    
    // Inicializar serviço WhatsApp
    try {
      const baileysServiceLoaded = getBaileysService();
      if (!baileysServiceLoaded.error) {
        console.log('🔄 Inicializando serviço WhatsApp...');
        await baileysServiceLoaded.initialize();
        console.log('✅ Serviço WhatsApp inicializado');
      } else {
        console.log('⚠️ Serviço WhatsApp não disponível (módulo não carregado)');
      }
    } catch (error) {
      console.error('⚠️ Erro ao inicializar WhatsApp (não crítico):', error.message);
      console.log('⚠️ WhatsApp pode ser inicializado posteriormente via endpoint');
    }
  });
  
  // Tratamento de erros do servidor
  server.on('error', (error) => {
    console.error('❌ Erro no servidor HTTP:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Porta ${PORT} já está em uso`);
    }
    process.exit(1);
  });
};

startServer();
