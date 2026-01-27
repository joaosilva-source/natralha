// VERSION: v1.0.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
// Script para importar tabulações do Google Sheets (Excel/CSV) para MongoDB

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { getMongoUri } = require('../config/mongodb');

// Configuração
const SOCIAIS_DB_NAME = process.env.CONSOLE_SOCIAIS_DB || 'console_sociais';
const COLLECTION_NAME = 'sociais_metricas';

// Validações
const validNetworks = ['WhatsApp', 'Instagram', 'Facebook', 'TikTok', 'Messenger', 'YouTube', 'PlayStore'];
const validReasons = ['Produto', 'Suporte', 'Bug', 'Elogio', 'Reclamação', 'Oculto', 'Outro'];
const validSentiments = ['Positivo', 'Neutro', 'Negativo'];

// Função para ler arquivo Excel
async function readExcelFile(filePath) {
  try {
    // Tentar usar xlsx (se disponível)
    const xlsx = require('xlsx');
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    return data;
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error('Biblioteca xlsx não encontrada. Execute: npm install xlsx');
    }
    throw error;
  }
}

// Função para ler arquivo CSV
async function readCSVFile(filePath) {
  try {
    const csv = require('csv-parser');
    const results = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error('Biblioteca csv-parser não encontrada. Execute: npm install csv-parser');
    }
    throw error;
  }
}

// Normalizar nome da coluna (case-insensitive, remove espaços)
function normalizeColumnName(name) {
  if (!name) return null;
  return String(name).trim().toLowerCase().replace(/\s+/g, '');
}

// Mapear colunas do arquivo para campos do modelo
function mapRowToTabulation(row) {
  // Criar mapa de colunas normalizadas
  const columnMap = {};
  Object.keys(row).forEach(key => {
    const normalized = normalizeColumnName(key);
    columnMap[normalized] = key;
  });

  // Função auxiliar para obter valor
  const getValue = (possibleNames) => {
    for (const name of possibleNames) {
      const normalized = normalizeColumnName(name);
      if (columnMap[normalized]) {
        const value = row[columnMap[normalized]];
        return value !== undefined && value !== null && value !== '' ? String(value).trim() : null;
      }
    }
    return null;
  };

  // Mapear campos
  const clientName = getValue(['clientName', 'client_name', 'nome_cliente', 'cliente']);
  const socialNetwork = getValue(['socialNetwork', 'social_network', 'rede_social', 'rede']);
  const messageText = getValue(['messageText', 'message_text', 'mensagem', 'texto']);
  const rating = getValue(['rating', 'avaliacao', 'nota']);
  const contactReason = getValue(['contactReason', 'contact_reason', 'motivo', 'motivo_contato']);
  const sentiment = getValue(['sentiment', 'sentimento']);
  const directedCenter = getValue(['directedCenter', 'directed_center', 'direcionado_centro', 'centro']);
  const link = getValue(['link', 'url']);
  const createdAt = getValue(['createdAt', 'created_at', 'data', 'data_criacao', 'timestamp']);

  return {
    clientName,
    socialNetwork,
    messageText,
    rating,
    contactReason,
    sentiment,
    directedCenter,
    link,
    createdAt
  };
}

// Validar e processar dados
function validateAndProcessTabulation(data, rowIndex) {
  const errors = [];
  const warnings = [];

  // Campos obrigatórios
  if (!data.clientName) errors.push('clientName é obrigatório');
  if (!data.socialNetwork) errors.push('socialNetwork é obrigatório');
  if (!data.messageText) errors.push('messageText é obrigatório');

  // Validar enums
  if (data.socialNetwork && !validNetworks.includes(data.socialNetwork)) {
    errors.push(`socialNetwork inválido: "${data.socialNetwork}". Valores válidos: ${validNetworks.join(', ')}`);
  }

  if (data.contactReason && !validReasons.includes(data.contactReason)) {
    errors.push(`contactReason inválido: "${data.contactReason}". Valores válidos: ${validReasons.join(', ')}`);
  }

  if (data.sentiment && !validSentiments.includes(data.sentiment)) {
    errors.push(`sentiment inválido: "${data.sentiment}". Valores válidos: ${validSentiments.join(', ')}`);
  }

  // Validar rating
  let ratingValue = null;
  if (data.rating) {
    ratingValue = typeof data.rating === 'string' 
      ? parseInt(data.rating.replace(/[^0-9]/g, ''), 10) 
      : Number(data.rating);
    
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      warnings.push(`rating inválido na linha ${rowIndex + 2}: "${data.rating}". Deve ser entre 1 e 5.`);
      ratingValue = null;
    }
  }

  // Validar rating obrigatório para PlayStore
  if (data.socialNetwork === 'PlayStore' && !ratingValue) {
    errors.push('rating é obrigatório para PlayStore');
  }

  // Processar data
  let createdAtDate = new Date();
  if (data.createdAt) {
    const dateString = String(data.createdAt).trim();
    
    // Tentar diferentes formatos de data
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Formato YYYY-MM-DD
      createdAtDate = new Date(dateString + 'T00:00:00');
    } else if (dateString.match(/^\d{2}\/\d{2}\/\d{4}/)) {
      // Formato DD/MM/YYYY
      const [day, month, year] = dateString.split('/');
      createdAtDate = new Date(`${year}-${month}-${day}T00:00:00`);
    } else {
      // Tentar parse direto
      const parsed = new Date(dateString);
      if (!isNaN(parsed.getTime())) {
        createdAtDate = parsed;
      } else {
        warnings.push(`Data inválida na linha ${rowIndex + 2}: "${dateString}". Usando data atual.`);
      }
    }
  }

  // Processar directedCenter (boolean)
  let directedCenterValue = false;
  if (data.directedCenter) {
    const value = String(data.directedCenter).toLowerCase().trim();
    directedCenterValue = ['true', 'sim', 'yes', '1', 's'].includes(value);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    tabulation: {
      clientName: data.clientName,
      socialNetwork: data.socialNetwork,
      messageText: data.messageText,
      rating: ratingValue,
      contactReason: data.contactReason || null,
      sentiment: data.sentiment || null,
      directedCenter: directedCenterValue,
      link: data.link || null,
      createdAt: createdAtDate,
      updatedAt: new Date()
    }
  };
}

// Função principal de importação
async function importTabulations(filePath, options = {}) {
  const {
    dryRun = false,
    batchSize = 100,
    skipDuplicates = true
  } = options;

  console.log('🔄 Iniciando importação de tabulações...');
  console.log(`📁 Arquivo: ${filePath}`);
  console.log(`🔍 Modo: ${dryRun ? 'DRY RUN (simulação)' : 'IMPORTAÇÃO REAL'}`);
  console.log('');

  // Verificar se arquivo existe
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

  // Determinar tipo de arquivo
  const ext = path.extname(filePath).toLowerCase();
  let rows = [];

  if (ext === '.xlsx' || ext === '.xls') {
    console.log('📊 Lendo arquivo Excel...');
    rows = await readExcelFile(filePath);
  } else if (ext === '.csv') {
    console.log('📊 Lendo arquivo CSV...');
    rows = await readCSVFile(filePath);
  } else {
    throw new Error(`Formato de arquivo não suportado: ${ext}. Use .xlsx, .xls ou .csv`);
  }

  console.log(`✅ ${rows.length} linhas lidas do arquivo`);
  console.log('');

  // Conectar ao MongoDB
  console.log('🔄 Conectando ao MongoDB...');
  const MONGODB_URI = getMongoUri();
  const client = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  await client.connect();
  console.log('✅ Conectado ao MongoDB');

  const db = client.db(SOCIAIS_DB_NAME);
  const collection = db.collection(COLLECTION_NAME);

  // Estatísticas
  let processed = 0;
  let valid = 0;
  let invalid = 0;
  let skipped = 0;
  let inserted = 0;
  const errors = [];
  const warnings = [];

  // Processar em lotes
  const batches = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const mapped = mapRowToTabulation(row);
    const validation = validateAndProcessTabulation(mapped, i);

    processed++;

    if (!validation.isValid) {
      invalid++;
      errors.push({
        row: i + 2, // +2 porque linha 1 é cabeçalho e arrays começam em 0
        data: mapped,
        errors: validation.errors
      });
      continue;
    }

    // Adicionar warnings
    if (validation.warnings.length > 0) {
      warnings.push({
        row: i + 2,
        warnings: validation.warnings
      });
    }

    valid++;
    batches.push(validation.tabulation);

    // Processar lote quando atingir batchSize
    if (batches.length >= batchSize) {
      if (!dryRun) {
        try {
          // Verificar duplicatas se necessário
          if (skipDuplicates) {
            // Criar índices únicos baseados em clientName + socialNetwork + messageText + createdAt
            // Por enquanto, vamos inserir e deixar o MongoDB lidar com duplicatas
            const result = await collection.insertMany(batches, { ordered: false });
            inserted += result.insertedCount;
          } else {
            const result = await collection.insertMany(batches);
            inserted += result.insertedCount;
          }
        } catch (error) {
          // Alguns documentos podem falhar (duplicatas, etc)
          if (error.writeErrors) {
            inserted += batches.length - error.writeErrors.length;
            errors.push({
              row: `batch ${Math.floor(i / batchSize)}`,
              errors: error.writeErrors.map(e => e.errmsg)
            });
          } else {
            throw error;
          }
        }
      } else {
        inserted += batches.length;
      }

      batches.length = 0; // Limpar array
      console.log(`📊 Processado: ${processed}/${rows.length} linhas...`);
    }
  }

  // Processar lote restante
  if (batches.length > 0) {
    if (!dryRun) {
      try {
        if (skipDuplicates) {
          const result = await collection.insertMany(batches, { ordered: false });
          inserted += result.insertedCount;
        } else {
          const result = await collection.insertMany(batches);
          inserted += result.insertedCount;
        }
      } catch (error) {
        if (error.writeErrors) {
          inserted += batches.length - error.writeErrors.length;
          errors.push({
            row: `batch final`,
            errors: error.writeErrors.map(e => e.errmsg)
          });
        } else {
          throw error;
        }
      }
    } else {
      inserted += batches.length;
    }
  }

  // Fechar conexão
  await client.close();

  // Relatório final
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 RELATÓRIO DE IMPORTAÇÃO');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📁 Arquivo: ${path.basename(filePath)}`);
  console.log(`📊 Total de linhas processadas: ${processed}`);
  console.log(`✅ Válidas: ${valid}`);
  console.log(`❌ Inválidas: ${invalid}`);
  console.log(`⚠️  Avisos: ${warnings.length}`);
  console.log(`💾 ${dryRun ? 'Simuladas' : 'Inseridas'}: ${inserted}`);
  console.log(`⏭️  Ignoradas (duplicatas/erros): ${valid - inserted}`);
  console.log('');

  if (warnings.length > 0) {
    console.log('⚠️  AVISOS:');
    warnings.slice(0, 10).forEach(w => {
      console.log(`   Linha ${w.row}: ${w.warnings.join(', ')}`);
    });
    if (warnings.length > 10) {
      console.log(`   ... e mais ${warnings.length - 10} avisos`);
    }
    console.log('');
  }

  if (errors.length > 0) {
    console.log('❌ ERROS:');
    errors.slice(0, 20).forEach(e => {
      console.log(`   Linha ${e.row}:`);
      e.errors.forEach(err => console.log(`     - ${err}`));
    });
    if (errors.length > 20) {
      console.log(`   ... e mais ${errors.length - 20} erros`);
    }
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════');

  return {
    processed,
    valid,
    invalid,
    inserted,
    skipped: valid - inserted,
    errors,
    warnings
  };
}

// Executar script
async function main() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('📋 Script de Importação de Tabulações do Google Sheets');
      console.log('');
      console.log('Uso:');
      console.log('  node import-sociais-sheets.js <caminho-do-arquivo> [opções]');
      console.log('');
      console.log('Opções:');
      console.log('  --dry-run          Simular importação sem inserir dados');
      console.log('  --batch-size=N     Tamanho do lote (padrão: 100)');
      console.log('  --no-skip-dups     Não pular duplicatas');
      console.log('');
      console.log('Exemplos:');
      console.log('  node import-sociais-sheets.js tabulacoes.xlsx');
      console.log('  node import-sociais-sheets.js tabulacoes.csv --dry-run');
      console.log('  node import-sociais-sheets.js tabulacoes.xlsx --batch-size=50');
      console.log('');
      console.log('Formato esperado do arquivo:');
      console.log('  clientName | socialNetwork | messageText | rating | contactReason | sentiment | directedCenter | link | createdAt');
      console.log('');
      process.exit(0);
    }

    const filePath = args[0];
    const options = {
      dryRun: args.includes('--dry-run'),
      batchSize: parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || '100'),
      skipDuplicates: !args.includes('--no-skip-dups')
    };

    await importTabulations(filePath, options);
    
    console.log('');
    console.log('✅ Importação concluída!');
  } catch (error) {
    console.error('');
    console.error('❌ Erro durante importação:');
    console.error(error.message);
    console.error('');
    if (error.stack) {
      console.error('Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { importTabulations };
