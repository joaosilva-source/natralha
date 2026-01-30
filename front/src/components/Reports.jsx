// VERSION: v1.3.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
import { useState } from 'react'
import { AssessmentOutlined, DownloadOutlined, RocketLaunchOutlined } from '@mui/icons-material'
import { getTabulations, getChartData } from '../services/api'
import { generateExecutiveReport } from '../services/geminiService'
import { downloadReportPDF } from '../utils/pdfGenerator'
import { downloadReportWord } from '../utils/wordGenerator'
import { generateDashboardChartsImages, generateSentimentPieChart } from '../utils/chartExporter'

const Reports = () => {
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [downloadingPDF, setDownloadingPDF] = useState(false)
  const [downloadingWord, setDownloadingWord] = useState(false)
  const [chartImages, setChartImages] = useState(null)
  const [sentimentChartImage, setSentimentChartImage] = useState(null)

  // Calcular dados de sentimento por rede social
  const calculateSentimentByNetwork = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return []
    }

    // Agrupar por rede social primeiro
    const networks = {}
    
    data.forEach(item => {
      const network = item.socialNetwork || 'Desconhecido'
      const sentiment = item.sentiment || 'Neutro'
      
      if (!networks[network]) {
        networks[network] = {
          Positivo: 0,
          Neutro: 0,
          Negativo: 0,
          total: 0
        }
      }
      
      if (networks[network][sentiment] !== undefined) {
        networks[network][sentiment]++
      }
      networks[network].total++
    })

    // Calcular percentuais por rede social e retornar array
    const result = []
    Object.keys(networks).forEach(network => {
      const networkData = networks[network]
      const sentiments = ['Positivo', 'Neutro', 'Negativo']
      
      sentiments.forEach(sentiment => {
        const count = networkData[sentiment] || 0
        const percentage = networkData.total > 0 ? (count / networkData.total) * 100 : 0
        
        if (count > 0) {
          result.push({
            network,
            sentiment,
            count,
            percentage
          })
        }
      })
    })

    return result
  }
  const [filters, setFilters] = useState({
    socialNetwork: '',
    contactReason: '',
    dateFrom: '',
    dateTo: ''
  })

  const socialNetworks = ['Instagram', 'Facebook', 'TikTok', 'Messenger', 'YouTube', 'PlayStore']
  const reasons = ['Produto', 'Suporte', 'Bug', 'Elogio', 'Reclamação', 'Oculto', 'Outro']

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGenerateReport = async () => {
    setLoading(true)
    setReport('')
    setChartImages(null)

    try {
      console.log('🔍 [Reports] Filtros aplicados:', filters)
      console.log('🔍 [Reports] URL da API:', import.meta.env.VITE_API_URL || '/api/sociais')      
      // Buscar dados com filtros
      const tabulationsResult = await getTabulations(filters)
      
      console.log('📊 [Reports] Resultado da busca:', {
        success: tabulationsResult.success,
        count: tabulationsResult.count,
        hasData: !!tabulationsResult.data,
        dataLength: tabulationsResult.data?.length,
        error: tabulationsResult.error,
        fullResponse: tabulationsResult
      })
      
      if (!tabulationsResult.success) {
        const errorMsg = tabulationsResult.error || 'Erro desconhecido ao buscar dados'
        setReport(`Erro ao buscar dados: ${errorMsg}`)
        setLoading(false)
        return
      }
      
      if (tabulationsResult.count === 0) {
        setReport('Nenhum dado encontrado para os filtros selecionados. Tente remover os filtros ou ajustar as datas.')
        setLoading(false)
        return
      }

      // Buscar dados dos gráficos
      let chartResult = null
      try {
        chartResult = await getChartData(filters)
        console.log('📊 [Reports] Dados dos gráficos:', chartResult)
      } catch (error) {
        console.warn('⚠️ [Reports] Erro ao buscar dados dos gráficos:', error)
      }

      // Gerar imagens dos gráficos se disponíveis
      if (chartResult?.data) {
        try {
          console.log('🔄 [Reports] Gerando imagens dos gráficos...', chartResult.data)
          const imagesResult = await generateDashboardChartsImages(chartResult.data)
          console.log('📊 [Reports] Resultado da geração de imagens:', imagesResult)
          
          if (imagesResult.success) {
            setChartImages(imagesResult.charts)
            console.log('✅ [Reports] Imagens dos gráficos geradas com sucesso')
            console.log('📸 [Reports] Chart Images:', {
              hasNetworkVolume: !!imagesResult.charts.networkVolume,
              hasReasonFrequency: !!imagesResult.charts.reasonFrequency,
              networkVolumeDataUrl: imagesResult.charts.networkVolume?.dataUrl?.substring(0, 50) + '...',
              reasonFrequencyDataUrl: imagesResult.charts.reasonFrequency?.dataUrl?.substring(0, 50) + '...'
            })
          } else {
            console.warn('⚠️ [Reports] Erro ao gerar imagens dos gráficos:', imagesResult.error)
          }
        } catch (error) {
          console.error('❌ [Reports] Erro ao gerar imagens dos gráficos:', error)
          console.error('❌ [Reports] Stack:', error.stack)
        }
      } else {
        console.warn('⚠️ [Reports] Dados dos gráficos não disponíveis:', chartResult)
      }

      // Preparar dados para o relatório (incluindo rating quando disponível)
      const data = tabulationsResult.data.map(item => ({
        socialNetwork: item.socialNetwork,
        contactReason: item.contactReason,
        sentiment: item.sentiment,
        messageText: item.messageText,
        rating: item.rating || null
      }))

      // LOG DETALHADO: Verificar quais redes estão nos dados recebidos
      const redesNosDados = [...new Set(data.map(item => item.socialNetwork).filter(Boolean))]
      const distribuicaoPorRede = data.reduce((acc, item) => {
        const network = item.socialNetwork || 'N/A'
        acc[network] = (acc[network] || 0) + 1
        return acc
      }, {})
      console.log('🔍 [Reports] Análise de redes sociais nos dados:', {
        totalItens: data.length,
        redesPresentes: redesNosDados,
        distribuicaoPorRede,
        filtrosAplicados: filters,
        temFiltroRede: !!filters.socialNetwork && filters.socialNetwork !== ''
      })

      // Calcular dados de sentimento por rede social
      const sentimentData = calculateSentimentByNetwork(data)
      console.log('📊 [Reports] Dados de sentimento calculados:', sentimentData)

      // Gerar gráfico de sentimento se houver dados
      if (sentimentData.length > 0) {
        try {
          console.log('🔄 [Reports] Gerando gráfico de sentimento...')
          const sentimentChart = await generateSentimentPieChart(sentimentData)
          setSentimentChartImage(sentimentChart)
          console.log('✅ [Reports] Gráfico de sentimento gerado com sucesso')
        } catch (error) {
          console.error('❌ [Reports] Erro ao gerar gráfico de sentimento:', error)
          setSentimentChartImage(null)
        }
      } else {
        setSentimentChartImage(null)
      }

      // Log para debug - confirmar dados antes de enviar
      console.log('DADOS ENVIADOS:', data)
      console.log('Quantidade de itens:', data.length)
      console.log('Primeiro item:', data[0] || 'Nenhum item')

      // Gerar relatório diretamente pelo frontend usando Gemini AI
      const result = await generateExecutiveReport(data, filters)
      
      if (result.success) {
        setReport(result.data)
      } else {
        setReport(`Erro ao gerar relatório: ${result.error}`)
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      setReport(`Erro ao gerar relatório: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!report) return

    setDownloadingPDF(true)
    try {
      console.log('📄 [Reports] Iniciando geração de PDF...')
      console.log('📊 [Reports] Chart Images disponíveis:', {
        hasChartImages: !!chartImages,
        hasNetworkVolume: !!chartImages?.networkVolume,
        hasReasonFrequency: !!chartImages?.reasonFrequency,
        networkVolumeDataUrl: chartImages?.networkVolume?.dataUrl?.substring(0, 50) + '...',
        reasonFrequencyDataUrl: chartImages?.reasonFrequency?.dataUrl?.substring(0, 50) + '...'
      })
      
      // Se as imagens não estiverem disponíveis, tentar gerá-las novamente
      let imagesToUse = chartImages
      if (!chartImages || !chartImages.networkVolume || !chartImages.reasonFrequency) {
        console.log('⚠️ [Reports] Imagens não disponíveis, tentando gerar novamente...')
        try {
          const chartResult = await getChartData(filters)
          if (chartResult?.data) {
            const imagesResult = await generateDashboardChartsImages(chartResult.data)
            if (imagesResult.success) {
              imagesToUse = imagesResult.charts
              setChartImages(imagesResult.charts)
              console.log('✅ [Reports] Imagens geradas novamente com sucesso')
            } else {
              console.warn('⚠️ [Reports] Não foi possível gerar imagens:', imagesResult.error)
            }
          }
        } catch (error) {
          console.warn('⚠️ [Reports] Erro ao tentar gerar imagens novamente:', error)
        }
      }
      
      console.log('📊 [Reports] Usando imagens para PDF:', {
        hasImages: !!imagesToUse,
        hasNetworkVolume: !!imagesToUse?.networkVolume,
        hasReasonFrequency: !!imagesToUse?.reasonFrequency
      })
      
      const result = await downloadReportPDF(report, imagesToUse, null, sentimentChartImage)
      
      if (!result.success) {
        console.error('❌ [Reports] Erro ao gerar PDF:', result.error)
        alert(`Erro ao gerar PDF: ${result.error || 'Erro desconhecido'}`)
      } else {
        console.log('✅ [Reports] PDF gerado com sucesso')
      }
    } catch (error) {
      console.error('❌ [Reports] Erro ao baixar PDF:', error)
      console.error('❌ [Reports] Stack:', error.stack)
      alert('Erro ao gerar PDF. Tente novamente.')
    } finally {
      setDownloadingPDF(false)
    }
  }

  const handleDownloadWord = async () => {
    if (!report) return

    setDownloadingWord(true)
    try {
      console.log('📄 [Reports] Iniciando geração de Word...')
      const result = await downloadReportWord(report, null, sentimentChartImage)
      
      if (!result.success) {
        console.error('❌ [Reports] Erro ao gerar Word:', result.error)
        alert(`Erro ao gerar Word: ${result.error || 'Erro desconhecido'}`)
      } else {
        console.log('✅ [Reports] Word gerado com sucesso')
      }
    } catch (error) {
      console.error('❌ [Reports] Erro ao baixar Word:', error)
      console.error('❌ [Reports] Stack:', error.stack)
      alert('Erro ao gerar Word. Tente novamente.')
    } finally {
      setDownloadingWord(false)
    }
  }

  return (
    <div className="velohub-container">
      <h2 className="section-title">
        <AssessmentOutlined className="section-icon" />
        Relatório Executivo de CX
      </h2>

      {/* Filtros */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Rede Social</label>
          <select
            value={filters.socialNetwork}
            onChange={(e) => handleFilterChange('socialNetwork', e.target.value)}
            className="velohub-input"
          >
            <option value="">Todas</option>
            {socialNetworks.map(network => (
              <option key={network} value={network}>{network}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Motivo</label>
          <select
            value={filters.contactReason}
            onChange={(e) => handleFilterChange('contactReason', e.target.value)}
            className="velohub-input"
          >
            <option value="">Todos</option>
            {reasons.map(reason => (
              <option key={reason} value={reason}>{reason}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Data Inicial</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="velohub-input"
          />
        </div>

        <div className="filter-group">
          <label>Data Final</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="velohub-input"
          />
        </div>
      </div>

      <div className="report-actions">
        <button
          onClick={handleGenerateReport}
          className="velohub-btn"
          disabled={loading}
        >
          <RocketLaunchOutlined sx={{ fontSize: '1rem', mr: 1 }} />
          {loading ? 'Gerando relatório...' : 'Gerar Relatório com IA'}
        </button>

        {report && (
          <>
            <button
              onClick={handleDownloadPDF}
              className="velohub-btn secondary"
              disabled={downloadingPDF}
            >
              <DownloadOutlined sx={{ fontSize: '1rem', mr: 1 }} />
              {downloadingPDF ? 'Gerando PDF...' : 'Baixar PDF'}
            </button>
            <button
              onClick={handleDownloadWord}
              className="velohub-btn secondary"
              disabled={downloadingWord}
            >
              <DownloadOutlined sx={{ fontSize: '1rem', mr: 1 }} />
              {downloadingWord ? 'Gerando Word...' : 'Baixar Word'}
            </button>
          </>
        )}
      </div>

      {loading && (
        <div className="loading-message">
          <p>Consultor de CX analisando dados...</p>
        </div>
      )}

      {report && !loading && (
        <div className="report-content">
          <div 
            className="markdown-content"
            dangerouslySetInnerHTML={{ 
              __html: report.split('\n').map(line => {
                // Processar markdown básico
                if (line.startsWith('# ')) {
                  return `<h1>${line.substring(2)}</h1>`
                } else if (line.startsWith('## ')) {
                  return `<h2>${line.substring(3)}</h2>`
                } else if (line.startsWith('### ')) {
                  return `<h3>${line.substring(4)}</h3>`
                } else if (line.startsWith('- ')) {
                  return `<li>${line.substring(2)}</li>`
                } else if (line.trim() === '') {
                  return '<br/>'
                } else {
                  return `<p>${line}</p>`
                }
              }).join('')
            }}
          />
        </div>
      )}
    </div>
  )
}

export default Reports
