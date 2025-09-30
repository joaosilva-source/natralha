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

  } catch (error) {
    console.error('❌ ERRO AO ACESSAR O SECRET:', error.message);
    console.error('Código do erro:', error.code);
    console.error('Detalhes:', error.details);
    console.log('==========================================');
    console.log('CONCLUSÃO: O problema ESTÁ na infraestrutura do Google Cloud.');
    console.log('Verificar: permissões, rede, nome do secret, projeto, etc.');
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
    secrets.forEach(secret => {
      const secretName = secret.name.split('/').pop();
      console.log(`- ${secretName}`);
    });
    
    if (secrets.length === 0) {
      console.log('Nenhum secret encontrado no projeto.');
    }
  } catch (error) {
    console.error('Erro ao listar secrets:', error.message);
  }
  console.log(`=====================================`);
}

// Executar testes
console.log('Iniciando teste de isolamento...\n');
accessSecret().then(() => {
  return listSecrets();
}).then(() => {
  console.log('\nTeste de isolamento concluído.');
  process.exit(0);
}).catch((error) => {
  console.error('Erro geral no teste:', error);
  process.exit(1);
});
