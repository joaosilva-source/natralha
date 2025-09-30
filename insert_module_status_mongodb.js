// Script para inserir status dos módulos no MongoDB
// Execute este script no MongoDB Compass ou mongosh

// Conectar ao database console_config
use console_config;

// Inserir configuração de status dos módulos
db.module_status.insertOne({
  "_trabalhador": "on",
  "_pessoal": "on", 
  "_pgtoAntecip": "on",
  "_antecipacao": "off",
  "_irpf": "off",
  "createdAt": new Date(),
  "updatedAt": new Date()
});

// Verificar se foi inserido corretamente
db.module_status.find().sort({createdAt: -1}).limit(1);
