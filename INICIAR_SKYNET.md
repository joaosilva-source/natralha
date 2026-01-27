# Como Iniciar o SKYNET

## Pré-requisitos

1. **Node.js** instalado (>=16.0.0)
2. **MongoDB** configurado e acessível
3. **Variável de ambiente** `MONGO_ENV` configurada

## Passos para Iniciar

### 1. Navegar para o diretório do SKYNET

```bash
cd "C:\DEV - Ecosistema Velohub\EXP- Console GCP\Dev - SKYNET"
```

### 2. Verificar/Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto SKYNET (ou configure via sistema):

```env
MONGO_ENV=mongodb+srv://usuario:senha@cluster.mongodb.net/console_conteudo
PORT=3001
NODE_ENV=development
```

**OU** configure via PowerShell:

```powershell
$env:MONGO_ENV="mongodb+srv://usuario:senha@cluster.mongodb.net/console_conteudo"
$env:PORT="3001"
```

### 3. Instalar Dependências (se necessário)

```bash
npm install
```

### 4. Iniciar o Servidor

**Modo desenvolvimento (com auto-reload):**
```bash
npm run dev
```

**Modo produção:**
```bash
npm start
```

### 5. Verificar se Está Rodando

O servidor deve iniciar na porta **3001** e exibir:

```
✅ Conectado ao MongoDB
🔄 Inicializando serviço WhatsApp...
✅ Serviço WhatsApp inicializado
📊 Console de Conteúdo VeloHub v4.2.0
🌐 Ambiente: development
📡 Monitor Skynet: http://localhost:3001/monitor
🔄 SSE Events: http://localhost:3001/events
```

### 6. Testar Endpoint

Acesse no navegador ou via curl:

```bash
curl http://localhost:3001/api/health
```

Deve retornar JSON com status "OK".

## Troubleshooting

### Erro: "MONGO_ENV não configurada"
- Configure a variável de ambiente `MONGO_ENV` com a string de conexão do MongoDB

### Erro: "Porta 3001 já em uso"
- Verifique se outro processo está usando a porta 3001
- Altere a porta no `.env` ou variável `PORT`

### Erro: "Cannot connect to MongoDB"
- Verifique se o MongoDB está acessível
- Verifique se a string de conexão está correta
- Verifique firewall/rede

### Console não consegue conectar
- Certifique-se de que o SKYNET está rodando na porta 3001
- Verifique se não há firewall bloqueando
- Verifique a URL no Console: deve ser `http://localhost:3001`

## Verificar Status

Após iniciar, você pode verificar:

1. **Health Check:**
   ```
   http://localhost:3001/api/health
   ```

2. **WhatsApp Status:**
   ```
   http://localhost:3001/api/whatsapp/status
   ```

3. **Monitor:**
   ```
   http://localhost:3001/monitor
   ```

