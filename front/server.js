// Servidor simples para servir arquivos estáticos no Render
// VERSION: 1.0.0 | DATE: 2026-01-28

import { createServer } from 'http'
import { readFileSync, existsSync, statSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = process.env.PORT || 3000
const DIST_DIR = join(__dirname, 'dist')

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
}

function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase()
  return MIME_TYPES[ext] || 'application/octet-stream'
}

function serveFile(filePath, res) {
  try {
    if (!existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('404 Not Found')
      return
    }

    const stats = statSync(filePath)
    if (stats.isDirectory()) {
      filePath = join(filePath, 'index.html')
    }

    if (!existsSync(filePath)) {
      // Para SPA, servir index.html para todas as rotas
      filePath = join(DIST_DIR, 'index.html')
    }

    const content = readFileSync(filePath)
    const mimeType = getMimeType(filePath)

    res.writeHead(200, { 'Content-Type': mimeType })
    res.end(content)
  } catch (error) {
    console.error('Error serving file:', error)
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('500 Internal Server Error')
  }
}

const server = createServer((req, res) => {
  let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0])

  // Para SPA, todas as rotas devem servir index.html
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(DIST_DIR, 'index.html')
  }

  serveFile(filePath, res)
})

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📁 Servindo arquivos de: ${DIST_DIR}`)
})
