// VERSION: v1.0.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
// Script de migração: Fundir audio_analise_status em qualidade_avaliacoes
// e atualizar referências em audio_analise_results

require('dotenv').config();
const mongoose = require('mongoose');
const AudioAnaliseStatus = require('../../models/AudioAnaliseStatus');
const AudioAnaliseResult = require('../../models/AudioAnaliseResult');
const QualidadeAvaliacao = require('../../models/QualidadeAvaliacao');

// Configurar conexão MongoDB
const MONGO_ENV = process.env.MONGO_ENV || 'production';
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://lucasgravina:nKQu8bSN6iZl8FPo@velohubcentral.od7vwts.mongodb.net/?retryWrites=true&w=majority&appName=VelohubCentral';

async function migrateAudioStatusToAvaliacoes() {
  let connection;
  
  try {
    console.log('🚀 Iniciando migração: audio_analise_status → qualidade_avaliacoes');
    console.log(`📊 Ambiente: ${MONGO_ENV}`);
    
    // Conectar ao MongoDB
    connection = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado ao MongoDB');
    
    // Estatísticas
    let stats = {
      audioStatusTotal: 0,
      audioStatusMigrados: 0,
      audioStatusSemAvaliacao: 0,
      resultsAtualizados: 0,
      errors: []
    };
    
    // 1. Buscar todos os documentos de audio_analise_status
    console.log('\n📋 Buscando documentos de audio_analise_status...');
    const audioStatusDocs = await AudioAnaliseStatus.find({});
    stats.audioStatusTotal = audioStatusDocs.length;
    console.log(`   Encontrados ${stats.audioStatusTotal} documentos`);
    
    // 2. Migrar cada documento de audio_analise_status para qualidade_avaliacoes
    console.log('\n🔄 Migrando dados para qualidade_avaliacoes...');
    for (const audioStatus of audioStatusDocs) {
      try {
        if (audioStatus.avaliacaoId) {
          // Buscar avaliação correspondente
          const avaliacao = await QualidadeAvaliacao.findById(audioStatus.avaliacaoId);
          
          if (avaliacao) {
            // Atualizar avaliação com campos de status de áudio
            avaliacao.nomeArquivoAudio = audioStatus.nomeArquivo;
            avaliacao.audioSent = audioStatus.sent;
            avaliacao.audioTreated = audioStatus.treated;
            avaliacao.audioCreatedAt = audioStatus.createdAt;
            avaliacao.audioUpdatedAt = audioStatus.updatedAt;
            
            await avaliacao.save();
            stats.audioStatusMigrados++;
            
            if (stats.audioStatusMigrados % 10 === 0) {
              console.log(`   Migrados ${stats.audioStatusMigrados}/${stats.audioStatusTotal}...`);
            }
          } else {
            console.warn(`   ⚠️  Avaliação ${audioStatus.avaliacaoId} não encontrada para audioStatus ${audioStatus._id}`);
            stats.errors.push({
              type: 'avaliacao_not_found',
              audioStatusId: audioStatus._id,
              avaliacaoId: audioStatus.avaliacaoId
            });
          }
        } else {
          stats.audioStatusSemAvaliacao++;
          console.warn(`   ⚠️  AudioStatus ${audioStatus._id} não possui avaliacaoId`);
          stats.errors.push({
            type: 'no_avaliacao_id',
            audioStatusId: audioStatus._id
          });
        }
      } catch (error) {
        console.error(`   ❌ Erro ao migrar audioStatus ${audioStatus._id}:`, error.message);
        stats.errors.push({
          type: 'migration_error',
          audioStatusId: audioStatus._id,
          error: error.message
        });
      }
    }
    
    console.log(`\n✅ Migração de audio_analise_status concluída:`);
    console.log(`   - Total: ${stats.audioStatusTotal}`);
    console.log(`   - Migrados: ${stats.audioStatusMigrados}`);
    console.log(`   - Sem avaliacaoId: ${stats.audioStatusSemAvaliacao}`);
    console.log(`   - Erros: ${stats.errors.length}`);
    
    // 3. Atualizar referências em audio_analise_results
    console.log('\n🔄 Atualizando referências em audio_analise_results...');
    const results = await AudioAnaliseResult.find({});
    console.log(`   Encontrados ${results.length} resultados`);
    
    for (const result of results) {
      try {
        if (result.audioStatusId) {
          // Buscar audioStatus para obter avaliacaoId
          const audioStatus = await AudioAnaliseStatus.findById(result.audioStatusId);
          
          if (audioStatus && audioStatus.avaliacaoId) {
            // Atualizar resultado com avaliacaoMonitorId
            result.avaliacaoMonitorId = audioStatus.avaliacaoId;
            // Manter audioStatusId temporariamente para rollback se necessário
            // result.audioStatusId = undefined; // Descomentar após validação
            
            await result.save();
            stats.resultsAtualizados++;
            
            if (stats.resultsAtualizados % 10 === 0) {
              console.log(`   Atualizados ${stats.resultsAtualizados}/${results.length}...`);
            }
          } else {
            console.warn(`   ⚠️  AudioStatus ${result.audioStatusId} não encontrado ou sem avaliacaoId para result ${result._id}`);
            stats.errors.push({
              type: 'result_update_error',
              resultId: result._id,
              audioStatusId: result.audioStatusId
            });
          }
        } else {
          console.warn(`   ⚠️  Result ${result._id} não possui audioStatusId`);
          stats.errors.push({
            type: 'no_audio_status_id',
            resultId: result._id
          });
        }
      } catch (error) {
        console.error(`   ❌ Erro ao atualizar result ${result._id}:`, error.message);
        stats.errors.push({
          type: 'result_update_error',
          resultId: result._id,
          error: error.message
        });
      }
    }
    
    console.log(`\n✅ Atualização de audio_analise_results concluída:`);
    console.log(`   - Total: ${results.length}`);
    console.log(`   - Atualizados: ${stats.resultsAtualizados}`);
    
    // 4. Resumo final
    console.log('\n📊 RESUMO DA MIGRAÇÃO:');
    console.log('='.repeat(50));
    console.log(`Audio Status Total: ${stats.audioStatusTotal}`);
    console.log(`Audio Status Migrados: ${stats.audioStatusMigrados}`);
    console.log(`Audio Status Sem Avaliação: ${stats.audioStatusSemAvaliacao}`);
    console.log(`Results Atualizados: ${stats.resultsAtualizados}`);
    console.log(`Total de Erros: ${stats.errors.length}`);
    
    if (stats.errors.length > 0) {
      console.log('\n⚠️  ERROS ENCONTRADOS:');
      stats.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.type}:`, error);
      });
    }
    
    console.log('\n✅ Migração concluída com sucesso!');
    console.log('\n⚠️  PRÓXIMOS PASSOS:');
    console.log('   1. Validar dados migrados manualmente');
    console.log('   2. Testar APIs após migração');
    console.log('   3. Após validação, remover campo audioStatusId de audio_analise_results');
    console.log('   4. Após validação completa, remover collection audio_analise_status');
    
  } catch (error) {
    console.error('\n❌ Erro fatal na migração:', error);
    throw error;
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log('\n🔌 Desconectado do MongoDB');
    }
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  migrateAudioStatusToAvaliacoes()
    .then(() => {
      console.log('\n✅ Script finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script falhou:', error);
      process.exit(1);
    });
}

module.exports = migrateAudioStatusToAvaliacoes;

