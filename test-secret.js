// Teste de Isolamento - Secret Manager API
// VERSION: v1.0.0 | DATE: 2025-01-30 | AUTHOR: Lucas Gravina - VeloHub Development Team
// Teste para verificar se a Conta de Serviço consegue acessar secrets

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

// Configurações do projeto VeloHub
const projectId = 'velohub-278491073220';
const secretName = 'MONGO_ENV'; // Nome do secret do MongoDB

async function accessSecret() {
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
  console.log(`=== TESTE DE ISOLAMENTO - SECRET MANAGER ===`);
  console.log(`Tentando acessar o secret: ${name}`);
  console.log(`Project ID: ${projectId}`);
  console.log(`Secret Name: ${secretName}`);
  console.log(`==========================================`);

  try {
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload.data.toString('utf8');

    console.log('✅ SUCESSO! O secret foi acessado pela biblioteca cliente.');
    console.log(`Tamanho do payload recuperado: ${payload.length} caracteres.`);
    console.log(`Primeiros 50 caracteres: ${payload.substring(0, 50)}...`);
    console.log('Isto prova que a permissão e a API estão funcionando corretamente.');
    console.log('==========================================');
    console.log('CONCLUSÃO: O problema NÃO está na infraestrutura do Google Cloud.');
    console.log('O problema está na aplicação VeloHub (código, bibliotecas, configuração).');

    testResults.secretAccess = {
      success: true,
      payloadLength: payload.length,
      preview: payload.substring(0, 50),
      conclusion: 'Infraestrutura OK - Problema na aplicação'
    };

  } catch (error) {
    console.error('❌ ERRO AO ACESSAR O SECRET:', error.message);
    console.error('Código do erro:', error.code);
    console.error('Detalhes:', error.details);
    console.log('==========================================');
    console.log('CONCLUSÃO: O problema ESTÁ na infraestrutura do Google Cloud.');
    console.log('Verificar: permissões, rede, nome do secret, projeto, etc.');

    testResults.secretAccess = {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
      conclusion: 'Problema na infraestrutura Google Cloud'
    };
  }
}

// Teste adicional: listar todos os secrets disponíveis
async function listSecrets() {
  console.log(`\n=== LISTANDO SECRETS DISPONÍVEIS ===`);
  try {
    const [secrets] = await client.listSecrets({
      parent: `projects/${projectId}`,
    });
    
    console.log(`Secrets encontrados no projeto ${projectId}:`);
    const secretNames = [];
    secrets.forEach(secret => {
      const secretName = secret.name.split('/').pop();
      console.log(`- ${secretName}`);
      secretNames.push(secretName);
    });
    
    if (secrets.length === 0) {
      console.log('Nenhum secret encontrado no projeto.');
    }

    testResults.secretsList = {
      success: true,
      count: secrets.length,
      secrets: secretNames
    };
  } catch (error) {
    console.error('Erro ao listar secrets:', error.message);
    testResults.secretsList = {
      success: false,
      error: error.message
    };
  }
  console.log(`=====================================`);
}

// Criar servidor HTTP para Cloud Run
import { createServer } from 'http';

const port = process.env.PORT || 8080;
let testResults = {
  status: 'running',
  secretAccess: null,
  secretsList: null,
  error: null
};

// Executar testes
console.log('Iniciando teste de isolamento...\n');

async function runTests() {
  try {
    await accessSecret();
    await listSecrets();
    testResults.status = 'completed';
    console.log('\nTeste de isolamento concluído.');
  } catch (error) {
    testResults.status = 'error';
    testResults.error = error.message;
    console.error('Erro geral no teste:', error);
  }
}

// Executar testes imediatamente
runTests();

// Criar servidor HTTP
const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.url === '/health') {
    res.statusCode = 200;
    res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
  } else {
    res.statusCode = 200;
    res.end(JSON.stringify({
      message: 'Teste de Isolamento Secret Manager',
      status: testResults.status,
      results: testResults,
      timestamp: new Date().toISOString()
    }, null, 2));
  }
});

server.listen(port, () => {
  console.log(`Servidor de teste rodando na porta ${port}`);
  console.log(`Acesse: http://localhost:${port} para ver os resultados`);
});
