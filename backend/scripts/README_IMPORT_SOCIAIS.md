# 📊 Script de Importação de Tabulações do Google Sheets

## 📋 Descrição

Script Node.js para importar tabulações do Google Sheets (exportadas como Excel ou CSV) para o banco de dados MongoDB.

## 🚀 Instalação

Primeiro, instale as dependências necessárias:

```bash
cd Back
npm install
```

As dependências necessárias (`xlsx` e `csv-parser`) serão instaladas automaticamente.

## 📝 Formato do Arquivo

O arquivo deve ter as seguintes colunas (nomes case-insensitive, aceita variações):

| Coluna | Variações Aceitas | Obrigatório | Valores Válidos |
|--------|-------------------|-------------|-----------------|
| `clientName` | clientName, client_name, nome_cliente, cliente | ✅ Sim | Qualquer texto |
| `socialNetwork` | socialNetwork, social_network, rede_social, rede | ✅ Sim | WhatsApp, Instagram, Facebook, TikTok, Messenger, YouTube, PlayStore |
| `messageText` | messageText, message_text, mensagem, texto | ✅ Sim | Qualquer texto |
| `rating` | rating, avaliacao, nota | ⚠️ Sim para PlayStore | 1-5 (número) |
| `contactReason` | contactReason, contact_reason, motivo, motivo_contato | ❌ Não | Produto, Suporte, Bug, Elogio, Reclamação, Oculto, Outro |
| `sentiment` | sentiment, sentimento | ❌ Não | Positivo, Neutro, Negativo |
| `directedCenter` | directedCenter, directed_center, direcionado_centro, centro | ❌ Não | true/false, sim/não, 1/0 |
| `link` | link, url | ❌ Não | URL válida |
| `createdAt` | createdAt, created_at, data, data_criacao, timestamp | ❌ Não | Data (YYYY-MM-DD ou DD/MM/YYYY) |

## 📤 Exportando do Google Sheets

### Opção 1: Exportar como Excel (.xlsx)
1. Abra seu Google Sheets
2. Arquivo → Fazer download → Microsoft Excel (.xlsx)
3. Salve o arquivo em um local acessível

### Opção 2: Exportar como CSV
1. Abra seu Google Sheets
2. Arquivo → Fazer download → Valores separados por vírgula (.csv)
3. Salve o arquivo em um local acessível

## 🔧 Uso

### Comando Básico

```bash
cd Back
npm run import-sociais <caminho-do-arquivo>
```

### Exemplos

```bash
# Importar arquivo Excel
npm run import-sociais ../tabulacoes.xlsx

# Importar arquivo CSV
npm run import-sociais ../tabulacoes.csv

# Simular importação (dry-run) - não insere dados, apenas valida
npm run import-sociais ../tabulacoes.xlsx --dry-run

# Usar tamanho de lote personalizado (padrão: 100)
npm run import-sociais ../tabulacoes.xlsx --batch-size=50

# Não pular duplicatas (inserir mesmo se já existir)
npm run import-sociais ../tabulacoes.xlsx --no-skip-dups
```

### Opções Disponíveis

- `--dry-run`: Simula a importação sem inserir dados no banco. Útil para validar o arquivo antes da importação real.
- `--batch-size=N`: Define o tamanho do lote para inserção em massa (padrão: 100). Valores maiores são mais rápidos mas consomem mais memória.
- `--no-skip-dups`: Por padrão, o script tenta evitar duplicatas. Use esta opção para forçar inserção mesmo se houver duplicatas.

## 📊 Relatório de Importação

Após a execução, o script exibe um relatório completo:

```
═══════════════════════════════════════════════════════════
📊 RELATÓRIO DE IMPORTAÇÃO
═══════════════════════════════════════════════════════════
📁 Arquivo: tabulacoes.xlsx
📊 Total de linhas processadas: 500
✅ Válidas: 485
❌ Inválidas: 15
⚠️  Avisos: 3
💾 Inseridas: 485
⏭️  Ignoradas (duplicatas/erros): 0
```

### Erros Comuns

O script valida todos os dados e reporta erros específicos:

- **Campos obrigatórios ausentes**: Linhas sem `clientName`, `socialNetwork` ou `messageText`
- **Valores inválidos**: Valores que não estão na lista de valores permitidos
- **Rating inválido**: Ratings fora do intervalo 1-5 ou formato incorreto
- **Data inválida**: Datas em formato não reconhecido

## ⚠️ Importante

1. **Backup**: Sempre faça backup do banco de dados antes de importar grandes volumes de dados
2. **Validação**: Use `--dry-run` primeiro para validar o arquivo antes da importação real
3. **Duplicatas**: O script tenta evitar duplicatas, mas não garante 100% de prevenção. Verifique manualmente após a importação
4. **Performance**: Para arquivos muito grandes (>1000 linhas), considere dividir em arquivos menores ou aumentar o `batch-size`

## 🔍 Troubleshooting

### Erro: "Biblioteca xlsx não encontrada"
```bash
npm install xlsx
```

### Erro: "Biblioteca csv-parser não encontrada"
```bash
npm install csv-parser
```

### Erro: "Banco de dados não conectado"
- Verifique se o arquivo `.env` está configurado corretamente
- Verifique se as variáveis de ambiente `MONGO_ENV` estão definidas
- Teste a conexão com o MongoDB manualmente

### Erro: "Formato de arquivo não suportado"
- Certifique-se de que o arquivo tem extensão `.xlsx`, `.xls` ou `.csv`
- Verifique se o arquivo não está corrompido

## 📞 Suporte

Para problemas ou dúvidas, verifique:
1. Os logs de erro no console
2. O formato do arquivo (deve corresponder ao formato esperado)
3. As validações do modelo `SociaisMetricas`
