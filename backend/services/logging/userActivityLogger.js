// User Activity Logger - Log de atividades dos usuários
// VERSION: v1.1.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
const { MongoClient } = require('mongodb');
require('dotenv').config();

class UserActivityLogger {
  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;
    this.isConnected = false;
  }

  /**
   * Conecta ao MongoDB
   */
  async connect() {
    if (this.isConnected) return;

    try {
      this.client = new MongoClient(process.env.MONGO_ENV);
      await this.client.connect();
      this.db = this.client.db('console_conteudo');
      this.collection = this.db.collection('user_activity');
      this.isConnected = true;
      
      console.log('✅ ActivityLogger: Conectado ao MongoDB');
    } catch (error) {
      console.error('❌ ActivityLogger: Erro ao conectar MongoDB:', error.message);
      throw error;
    }
  }

  /**
   * Registra atividade do usuário seguindo schema console_conteudo.user_activity
   * @param {Object} activityData - Dados da atividade
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async logActivity(activityData) {
    try {
      await this.connect();

      const now = new Date();
      const activity = {
        colaboradorNome: activityData.colaboradorNome || activityData.userId || 'anonymous',
        action: activityData.action, // 'question_asked', 'feedback_given', 'article_viewed', 'ai_button_used'
        details: activityData.details || {},
        sessionId: activityData.sessionId || null,
        source: activityData.source || 'chatbot',
        createdAt: now,
        updatedAt: now
      };

      const result = await this.collection.insertOne(activity);
      
      console.log(`✅ ActivityLogger: Atividade registrada com ID ${result.insertedId}`);
      
      return true;

    } catch (error) {
      console.error('❌ ActivityLogger: Erro ao registrar atividade:', error.message);
      return false;
    }
  }

  /**
   * Registra pergunta do usuário
   * @param {string} colaboradorNome - Nome do colaborador
   * @param {string} question - Pergunta feita
   * @param {string} sessionId - ID da sessão
   * @param {Object} metadata - Metadados adicionais
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async logQuestion(colaboradorNome, question, sessionId = null, metadata = {}) {
    return await this.logActivity({
      colaboradorNome,
      action: 'question_asked',
      details: { question },
      sessionId,
      source: 'chatbot'
    });
  }

  /**
   * Registra feedback do usuário
   * @param {string} colaboradorNome - Nome do colaborador
   * @param {string} feedbackType - Tipo do feedback
   * @param {string} messageId - ID da mensagem
   * @param {string} sessionId - ID da sessão
   * @param {Object} metadata - Metadados adicionais
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async logFeedback(colaboradorNome, feedbackType, messageId, sessionId = null, metadata = {}) {
    return await this.logActivity({
      colaboradorNome,
      action: 'feedback_given',
      details: { feedbackType, messageId },
      sessionId,
      source: 'chatbot'
    });
  }

  /**
   * Registra visualização de artigo
   * @param {string} colaboradorNome - Nome do colaborador
   * @param {string} articleId - ID do artigo
   * @param {string} articleTitle - Título do artigo
   * @param {string} sessionId - ID da sessão
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async logArticleView(colaboradorNome, articleId, articleTitle, sessionId = null) {
    return await this.logActivity({
      colaboradorNome,
      action: 'article_viewed',
      details: { articleId, articleTitle },
      sessionId,
      source: 'chatbot'
    });
  }

  /**
   * Registra uso do botão AI
   * @param {string} colaboradorNome - Nome do colaborador
   * @param {string} formatType - Tipo de formatação (whatsapp/email)
   * @param {string} sessionId - ID da sessão
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async logAIButtonUsage(colaboradorNome, formatType, sessionId = null) {
    return await this.logActivity({
      colaboradorNome,
      action: 'ai_button_used',
      details: { formatType },
      sessionId,
      source: 'ai_button'
    });
  }

  /**
   * Obtém atividades do usuário
   * @param {string} colaboradorNome - Nome do colaborador
   * @param {number} limit - Limite de resultados
   * @param {Date} startDate - Data de início (opcional)
   * @param {Date} endDate - Data de fim (opcional)
   * @returns {Promise<Array>} Atividades do usuário
   */
  async getUserActivities(colaboradorNome, limit = 50, startDate = null, endDate = null) {
    try {
      await this.connect();

      const filter = { colaboradorNome };
      
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = startDate;
        if (endDate) filter.createdAt.$lte = endDate;
      }

      const activities = await this.collection
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      console.log(`📋 ActivityLogger: ${activities.length} atividades obtidas para colaborador ${colaboradorNome}`);
      
      return activities;

    } catch (error) {
      console.error('❌ ActivityLogger: Erro ao obter atividades:', error.message);
      return [];
    }
  }

  /**
   * Obtém estatísticas de atividade
   * @param {Date} startDate - Data de início
   * @param {Date} endDate - Data de fim
   * @returns {Promise<Object>} Estatísticas de atividade
   */
  async getActivityStats(startDate, endDate) {
    try {
      await this.connect();

      const filter = {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      };

      const pipeline = [
        { $match: filter },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: '$colaboradorNome' }
          }
        },
        {
          $project: {
            action: '$_id',
            count: 1,
            uniqueUsers: { $size: '$uniqueUsers' }
          }
        },
        { $sort: { count: -1 } }
      ];

      const stats = await this.collection.aggregate(pipeline).toArray();
      
      // Calcular total de usuários únicos
      const totalUniqueUsers = await this.collection.distinct('colaboradorNome', filter);
      
      const result = {
        period: { start: startDate, end: endDate },
        totalActivities: stats.reduce((sum, stat) => sum + stat.count, 0),
        totalUniqueUsers: totalUniqueUsers.length,
        actions: stats
      };

      console.log(`📊 ActivityLogger: Estatísticas obtidas - ${result.totalActivities} atividades`);
      
      return result;

    } catch (error) {
      console.error('❌ ActivityLogger: Erro ao obter estatísticas:', error.message);
      return null;
    }
  }

  /**
   * Obtém usuários mais ativos
   * @param {number} limit - Limite de resultados
   * @param {Date} startDate - Data de início (opcional)
   * @param {Date} endDate - Data de fim (opcional)
   * @returns {Promise<Array>} Usuários mais ativos
   */
  async getMostActiveUsers(limit = 10, startDate = null, endDate = null) {
    try {
      await this.connect();

      const filter = {};
      
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = startDate;
        if (endDate) filter.createdAt.$lte = endDate;
      }

      const pipeline = [
        { $match: filter },
        {
          $group: {
            _id: '$colaboradorNome',
            activityCount: { $sum: 1 },
            lastActivity: { $max: '$createdAt' },
            actions: { $addToSet: '$action' }
          }
        },
        { $sort: { activityCount: -1 } },
        { $limit: limit }
      ];

      const activeUsers = await this.collection.aggregate(pipeline).toArray();
      
      console.log(`📋 ActivityLogger: ${activeUsers.length} usuários mais ativos obtidos`);
      
      return activeUsers;

    } catch (error) {
      console.error('❌ ActivityLogger: Erro ao obter usuários ativos:', error.message);
      return [];
    }
  }

  /**
   * Fecha a conexão com MongoDB
   */
  async close() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('🔌 ActivityLogger: Conexão MongoDB fechada');
    }
  }

  /**
   * Testa a conexão com MongoDB
   * @returns {Promise<boolean>} Status da conexão
   */
  async testConnection() {
    try {
      await this.connect();
      await this.collection.findOne({});
      console.log('✅ ActivityLogger: Teste de conexão bem-sucedido');
      return true;
    } catch (error) {
      console.error('❌ ActivityLogger: Erro no teste de conexão:', error.message);
      return false;
    }
  }
}

module.exports = new UserActivityLogger();
