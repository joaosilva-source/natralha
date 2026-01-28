import * as XLSX from 'xlsx'

/**
 * Formata data para exibição
 */
const formatDateForExcel = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return ''
  }
}

/**
 * Exporta dados do feed para Excel
 * @param {Array} data - Array de dados do feed
 * @param {Object} filters - Filtros aplicados
 * @param {string} filename - Nome do arquivo (opcional)
 */
export const exportFeedToExcel = (data, filters = {}, filename = null) => {
  try {
    if (!data || data.length === 0) {
      alert('Não há dados para exportar')
      return { success: false, error: 'Nenhum dado disponível' }
    }

    // Preparar dados para Excel
    const excelData = data.map((item, index) => ({
      'Nº': index + 1,
      'Data/Hora': formatDateForExcel(item.createdAt),
      'Rede Social': item.socialNetwork || 'N/A',
      'Cliente': item.clientName || 'N/A',
      'Mensagem': item.messageText || '',
      'Motivo': item.contactReason || 'N/A',
      'Sentimento': item.sentiment || 'N/A',
      'Avaliação': item.rating ? `${item.rating}⭐` : 'N/A',
      'Direcionado para Central': item.directedCenter ? 'Sim' : 'Não',
      'Link': item.link || ''
    }))

    // Criar workbook
    const wb = XLSX.utils.book_new()

    // Criar worksheet com dados
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 5 },   // Nº
      { wch: 20 },  // Data/Hora
      { wch: 15 },  // Rede Social
      { wch: 25 },  // Cliente
      { wch: 50 },  // Mensagem
      { wch: 15 },  // Motivo
      { wch: 15 },  // Sentimento
      { wch: 12 },  // Avaliação
      { wch: 25 },  // Direcionado para Central
      { wch: 40 }   // Link
    ]
    ws['!cols'] = colWidths

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Tabulações')

    // Criar sheet de informações sobre filtros
    const filterInfo = [
      ['Informações da Exportação'],
      [''],
      ['Data da Exportação:', new Date().toLocaleString('pt-BR')],
      ['Total de Registros:', data.length],
      [''],
      ['Filtros Aplicados:'],
      ['Rede Social:', filters.socialNetwork || 'Todas'],
      ['Motivo:', filters.contactReason || 'Todos'],
      ['Sentimento:', filters.sentiment || 'Todos'],
      ['Data Inicial:', filters.dateFrom || 'Não especificada'],
      ['Data Final:', filters.dateTo || 'Não especificada'],
      ['Palavra-Chave:', filters.keyword || 'Nenhuma']
    ]
    const wsInfo = XLSX.utils.aoa_to_sheet(filterInfo)
    wsInfo['!cols'] = [{ wch: 25 }, { wch: 30 }]
    XLSX.utils.book_append_sheet(wb, wsInfo, 'Informações')

    // Gerar nome do arquivo
    const fileName = filename || `tabulacoes_${new Date().toISOString().split('T')[0]}.xlsx`

    // Salvar arquivo
    XLSX.writeFile(wb, fileName)

    return { success: true, filename: fileName }
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error)
    return { success: false, error: error.message }
  }
}
