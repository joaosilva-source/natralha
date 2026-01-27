# 🔄 Scripts de Migração MongoDB - Padronização de Schemas

## 📋 Descrição

Estes scripts foram criados para migrar os dados existentes no MongoDB para o novo padrão de nomenclatura estabelecido. Eles atualizam os campos das collections para manter compatibilidade com o frontend e backend padronizados.

## 🗂️ Collections Migradas

### 1. **Bot_perguntas** (`001_migrate_botperguntas.js`)
- `Pergunta` → `pergunta`
- `Resposta` → `resposta`
- `"Palavras-chave"` → `palavrasChave`
- `Sinonimos` → `sinonimos`
- `Tabulação` → `tabulacao`

### 2. **Velonews** (`002_migrate_velonews.js`)
- `title` → `titulo`
- `content` → `conteudo`

### 3. **qualidade_funcionarios** (`003_migrate_qualidade_funcionarios.js`)
- `nomeCompleto` → `colaboradorNome`

### 4. **qualidade_avaliacoes_gpt** (`004_migrate_qualidade_avaliacoes_gpt.js`)
- `avaliacaoId` (String) → `avaliacao_id` (ObjectId)

## 🚀 Como Executar

### Opção 1: Executar Todas as Migrações
```bash
cd backend/scripts/migrations
node migrate_all.js
```

### Opção 2: Executar Migrações Individuais
```bash
cd backend/scripts/migrations

# Migrar Bot_perguntas
node 001_migrate_botperguntas.js

# Migrar Velonews
node 002_migrate_velonews.js

# Migrar qualidade_funcionarios
node 003_migrate_qualidade_funcionarios.js

# Migrar qualidade_avaliacoes_gpt
node 004_migrate_qualidade_avaliacoes_gpt.js
```

## ⚙️ Configuração

### Variáveis de Ambiente Necessárias:
```bash
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/
MONGODB_DB_NAME=console_conteudo
CONSOLE_ANALISES_DB=console_analises
```

### Ou usar as configurações padrão:
- **MongoDB URI**: Configurada no código
- **Database console_conteudo**: Para Bot_perguntas e Velonews
- **Database console_analises**: Para collections de qualidade

## 🔍 O Que os Scripts Fazem

1. **Conectam** ao MongoDB usando as configurações especificadas
2. **Identificam** documentos que ainda usam campos antigos
3. **Migram** os dados para os novos campos padronizados
4. **Removem** os campos antigos após a migração
5. **Adicionam** timestamps (`createdAt`, `updatedAt`) se não existirem
6. **Relatam** o progresso e resultados da migração

## ⚠️ Importante

- **Backup**: Sempre faça backup do banco antes de executar as migrações
- **Teste**: Execute primeiro em ambiente de desenvolvimento
- **Logs**: Os scripts fornecem logs detalhados do processo
- **Idempotência**: Os scripts podem ser executados múltiplas vezes sem problemas

## 📊 Exemplo de Saída

```
🚀 Iniciando migração completa do MongoDB para padrões atualizados...

📋 Executando migração: Bot_perguntas
==================================================
🔄 Iniciando migração da collection Bot_perguntas...
📊 Encontrados 15 documentos para migrar
✅ Documento 507f1f77bcf86cd799439011 migrado com sucesso
✅ Documento 507f1f77bcf86cd799439012 migrado com sucesso
...

📈 Resumo da migração:
✅ Documentos migrados: 15
❌ Erros: 0
📊 Total processado: 15
🎉 Migração da collection Bot_perguntas concluída com sucesso!

============================================================
📊 RESUMO FINAL DAS MIGRAÇÕES
============================================================
✅ Bot_perguntas: SUCCESS
✅ Velonews: SUCCESS
✅ qualidade_funcionarios: SUCCESS
✅ qualidade_avaliacoes_gpt: SUCCESS

📈 Estatísticas:
✅ Migrações bem-sucedidas: 4
❌ Migrações com erro: 0
⏱️  Tempo total: 2.34s

🎉 Todas as migrações foram concluídas com sucesso!
🔄 O MongoDB está agora totalmente padronizado.
```

## 🛠️ Troubleshooting

### Erro de Conexão
- Verifique se as variáveis de ambiente estão configuradas
- Confirme se o MongoDB está acessível
- Verifique as credenciais de acesso

### Erro de Permissão
- Confirme se o usuário tem permissões de escrita no banco
- Verifique se as collections existem

### Erro de Validação
- Verifique se os dados existentes estão no formato esperado
- Alguns campos podem precisar de tratamento especial

## 📞 Suporte

Para problemas ou dúvidas sobre as migrações, consulte a equipe de desenvolvimento VeloHub.
