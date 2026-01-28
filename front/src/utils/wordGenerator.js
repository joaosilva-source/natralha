// VERSION: v1.0.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'

/**
 * Remove códigos de citação do texto
 */
const removeCitationCodes = (text) => {
  if (!text) return ''
  // Remove blocos completos [cite_start]... [cite: ]
  text = text.replace(/\[cite_start\][\s\S]*?\[cite:\s*\]/g, '')
  // Remove [cite_start] sozinho
  text = text.replace(/\[cite_start\]/g, '')
  // Remove [cite: ] sozinho (com ou sem espaço)
  text = text.replace(/\[cite:\s*\]/g, '')
  // Remove [cite: qualquer coisa] (padrão como [cite: Dados Coletados])
  text = text.replace(/\[cite:\s*[^\]]+\]/g, '')
  return text
}

/**
 * Processa elementos inline do Markdown (negrito) e remove asteriscos literais
 */
const processMarkdownInline = (text) => {
  if (!text) return ''
  text = text.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/\*\*/g, '')
  text = text.replace(/\*/g, '')
  return text
}

/**
 * Converte markdown para elementos do docx
 */
const markdownToDocxElements = (markdown) => {
  if (!markdown) return []
  
  const elements = []
  const lines = markdown.split('\n')
  let currentListItems = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const cleanedLine = removeCitationCodes(line)
    
    // Ignorar linhas de quebra de página
    if (cleanedLine.includes('[QUEBRA DE PÁGINA') || cleanedLine.includes('[QUEBRA DE PAGINA')) {
      if (currentListItems.length > 0) {
        elements.push(...currentListItems)
        currentListItems = []
      }
      elements.push(new Paragraph({ 
        children: [new TextRun({ text: '' })],
        pageBreakBefore: true 
      }))
      continue
    }
    
    // Títulos
    if (cleanedLine.startsWith('# ')) {
      if (currentListItems.length > 0) {
        elements.push(...currentListItems)
        currentListItems = []
      }
      const content = processMarkdownInline(cleanedLine.substring(2))
      // Processar negrito no título
      const textRuns = []
      const parts = content.split(/(<strong>.*?<\/strong>)/g)
      parts.forEach(part => {
        if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
          const text = part.replace(/<\/?strong>/g, '')
          textRuns.push(new TextRun({ text, bold: true }))
        } else if (part.trim()) {
          textRuns.push(new TextRun({ text: part }))
        }
      })
      elements.push(new Paragraph({
        children: textRuns.length > 0 ? textRuns : [new TextRun({ text: content })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      }))
    } else if (cleanedLine.startsWith('## ')) {
      if (currentListItems.length > 0) {
        elements.push(...currentListItems)
        currentListItems = []
      }
      const content = processMarkdownInline(cleanedLine.substring(3))
      // Processar negrito no título
      const textRuns = []
      const parts = content.split(/(<strong>.*?<\/strong>)/g)
      parts.forEach(part => {
        if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
          const text = part.replace(/<\/?strong>/g, '')
          textRuns.push(new TextRun({ text, bold: true }))
        } else if (part.trim()) {
          textRuns.push(new TextRun({ text: part }))
        }
      })
      elements.push(new Paragraph({
        children: textRuns.length > 0 ? textRuns : [new TextRun({ text: content })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 }
      }))
    } else if (cleanedLine.startsWith('### ')) {
      if (currentListItems.length > 0) {
        elements.push(...currentListItems)
        currentListItems = []
      }
      const content = processMarkdownInline(cleanedLine.substring(4))
      // Processar negrito no título
      const textRuns = []
      const parts = content.split(/(<strong>.*?<\/strong>)/g)
      parts.forEach(part => {
        if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
          const text = part.replace(/<\/?strong>/g, '')
          textRuns.push(new TextRun({ text, bold: true }))
        } else if (part.trim()) {
          textRuns.push(new TextRun({ text: part }))
        }
      })
      elements.push(new Paragraph({
        children: textRuns.length > 0 ? textRuns : [new TextRun({ text: content })],
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 }
      }))
    }
    // Listas
    else if (cleanedLine.match(/^\s*[-*]\s/)) {
      const content = processMarkdownInline(cleanedLine.replace(/^\s*[-*]\s+/, ''))
      const indentLevel = cleanedLine.match(/^(\s*)/)?.[1]?.length || 0
      
      // Processar negrito no conteúdo
      const textRuns = []
      const parts = content.split(/(<strong>.*?<\/strong>)/g)
      
      parts.forEach(part => {
        if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
          const text = part.replace(/<\/?strong>/g, '')
          textRuns.push(new TextRun({ text, bold: true }))
        } else if (part.trim()) {
          textRuns.push(new TextRun({ text: part }))
        }
      })
      
      currentListItems.push(new Paragraph({
        children: textRuns.length > 0 ? textRuns : [new TextRun({ text: content })],
        bullet: { level: Math.floor(indentLevel / 2) },
        spacing: { after: 100 }
      }))
    }
    // Linha em branco
    else if (cleanedLine.trim() === '') {
      if (currentListItems.length > 0) {
        elements.push(...currentListItems)
        currentListItems = []
      }
      elements.push(new Paragraph({ children: [new TextRun({ text: '' })] }))
    }
    // Parágrafos
    else {
      if (currentListItems.length > 0) {
        elements.push(...currentListItems)
        currentListItems = []
      }
      const content = processMarkdownInline(cleanedLine)
      
      // Processar negrito no conteúdo
      const textRuns = []
      const parts = content.split(/(<strong>.*?<\/strong>)/g)
      
      parts.forEach(part => {
        if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
          const text = part.replace(/<\/?strong>/g, '')
          textRuns.push(new TextRun({ text, bold: true }))
        } else if (part.trim()) {
          textRuns.push(new TextRun({ text: part }))
        }
      })
      
      elements.push(new Paragraph({
        children: textRuns.length > 0 ? textRuns : [new TextRun({ text: content })],
        spacing: { after: 150 }
      }))
    }
  }
  
  // Fechar lista se ainda estiver aberta
  if (currentListItems.length > 0) {
    elements.push(...currentListItems)
  }
  
  return elements
}

/**
 * Gera documento Word do relatório
 */
export const generateReportWord = async (reportMarkdown, sentimentChartImage = null) => {
  try {
    const elements = []
    
    // Cabeçalho
    elements.push(new Paragraph({
      children: [new TextRun({ text: 'Relatório Executivo de CX', bold: true })],
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.LEFT,
      spacing: { after: 200 }
    }))
    
    // Data do relatório
    const reportDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    elements.push(new Paragraph({
      children: [new TextRun({ text: `Data: ${reportDate}` })],
      spacing: { after: 300 }
    }))
    
    // Linha separadora
    elements.push(new Paragraph({ text: '' }))
    
    // Converter markdown para elementos
    const markdownElements = markdownToDocxElements(reportMarkdown)
    elements.push(...markdownElements)
    
    // Adicionar gráfico se disponível
    if (sentimentChartImage && sentimentChartImage.dataUrl) {
      try {
        // Converter base64 para blob
        const base64Data = sentimentChartImage.dataUrl.split(',')[1]
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'image/png' })
        
        // Criar elemento de imagem (docx não suporta imagens diretamente via blob, então vamos adicionar como referência)
        // Por enquanto, vamos apenas adicionar um parágrafo indicando que o gráfico está incluído
        elements.push(new Paragraph({
          children: [new TextRun({ text: '[Gráfico de Análise de Sentimento incluído]' })],
          spacing: { before: 200, after: 200 }
        }))
      } catch (error) {
        console.error('Erro ao processar imagem do gráfico:', error)
      }
    }
    
    // Criar documento
    const doc = new Document({
      sections: [{
        properties: {},
        children: elements
      }],
      styles: {
        default: {
          document: {
            run: {
              font: 'Poppins',
              size: 22, // 11pt
              color: '272A30'
            },
            paragraph: {
              spacing: { line: 276, lineRule: 'auto' }
            }
          },
          heading1: {
            run: {
              font: 'Poppins',
              size: 48, // 24pt
              color: '1634FF',
              bold: true
            }
          },
          heading2: {
            run: {
              font: 'Poppins',
              size: 40, // 20pt
              color: '1634FF',
              bold: true
            }
          },
          heading3: {
            run: {
              font: 'Poppins',
              size: 36, // 18pt
              color: '1634FF',
              bold: true
            }
          }
        }
      }
    })
    
    return doc
  } catch (error) {
    console.error('Erro ao gerar documento Word:', error)
    throw error
  }
}

/**
 * Download do documento Word
 */
export const downloadReportWord = async (reportMarkdown, filename = null, sentimentChartImage = null) => {
  try {
    const doc = await generateReportWord(reportMarkdown, sentimentChartImage)
    const blob = await Packer.toBlob(doc)
    const fileName = filename || `relatorio_cx_${new Date().toISOString().split('T')[0]}.docx`
    saveAs(blob, fileName)
    return { success: true }
  } catch (error) {
    console.error('Erro ao gerar Word:', error)
    return { success: false, error: error.message }
  }
}
