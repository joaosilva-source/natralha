// VERSION: v1.0.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
// Usar Plotly do window (disponibilizado pelo react-plotly.js)
// Isso evita problemas com dependências do Node.js como buffer
const getPlotly = async () => {
  // Usar window.Plotly que já está disponível através do react-plotly.js
  // Isso evita problemas com buffer e outras dependências do Node.js
  if (typeof window !== 'undefined' && window.Plotly) {
    console.log('✅ [ChartExporter] Usando window.Plotly')
    return window.Plotly
  }
  
  // Se window.Plotly não estiver disponível, tentar plotly.js-dist-min
  try {
    console.log('🔄 [ChartExporter] Tentando importar plotly.js-dist-min...')
    const plotlyModule = await import('plotly.js-dist-min')
    
    // plotly.js-dist-min exporta de forma diferente
    if (plotlyModule.default && plotlyModule.default.newPlot) {
      return plotlyModule.default
    }
    
    if (plotlyModule.newPlot && plotlyModule.toImage) {
      return plotlyModule
    }
    
    // Se o módulo inteiro tem os métodos necessários
    return plotlyModule
  } catch (error) {
    console.error('❌ [ChartExporter] Erro ao importar Plotly:', error)
    throw new Error('Plotly não está disponível. Certifique-se de que react-plotly.js está instalado e os gráficos estão sendo renderizados no Dashboard.')
  }
}

/**
 * Gera imagem base64 de um gráfico Plotly no estilo do dashboard
 * @param {Object} chartData - Dados do gráfico
 * @param {string} chartType - Tipo de gráfico ('bar' ou 'pie')
 * @returns {Promise<Object>} Objeto com base64, dataUrl, width e height
 */
export const exportChartToImage = async (chartData, chartType = 'bar') => {
  return new Promise(async (resolve, reject) => {
    try {
      // Obter Plotly
      const Plotly = await getPlotly()
      
      let data, layout, config

      if (chartType === 'bar') {
        // Gráfico de barras - Volume por Rede Social
        data = [{
          x: chartData.networkVolume.map(item => item.socialNetwork),
          y: chartData.networkVolume.map(item => item.count),
          type: 'bar',
          marker: { 
            color: '#1634FF',
            line: { color: '#0d28a3', width: 1 }
          }
        }]
        
        layout = {
          title: {
            text: 'Volume por Rede Social',
            font: { size: 18, color: '#ffffff' }
          },
          xaxis: { 
            title: { text: 'Rede Social', font: { color: '#ffffff' } },
            tickfont: { color: '#ffffff' }
          },
          yaxis: { 
            title: { text: 'Quantidade', font: { color: '#ffffff' } },
            tickfont: { color: '#ffffff' }
          },
          paper_bgcolor: '#1e2130',  // Cor de fundo do card
          plot_bgcolor: '#1e2130',
          font: { color: '#ffffff' },
          margin: { l: 60, r: 20, t: 60, b: 60 }
        }
      } else if (chartType === 'pie') {
        // Gráfico de pizza - Motivos Frequentes
        data = [{
          values: chartData.reasonFrequency.map(item => item.count),
          labels: chartData.reasonFrequency.map(item => item.reason),
          type: 'pie',
          hole: 0.4,
          marker: {
            colors: ['#1634FF', '#00d1b2', '#ff6b6b', '#ffd93d', '#6bcf7f', '#a29bfe'],
            line: { color: '#1e2130', width: 2 }
          },
          textfont: { color: '#ffffff', size: 14 }
        }]
        
        layout = {
          title: {
            text: 'Motivos Frequentes',
            font: { size: 18, color: '#ffffff' }
          },
          paper_bgcolor: '#1e2130',
          plot_bgcolor: '#1e2130',
          font: { color: '#ffffff' },
          margin: { l: 20, r: 20, t: 60, b: 20 },
          showlegend: true,
          legend: {
            font: { color: '#ffffff' },
            x: 1.1,
            y: 0.5
          }
        }
      }

      config = {
        displayModeBar: false,
        responsive: true
      }

      // Criar div temporário para renderizar o gráfico
      const tempDiv = document.createElement('div')
      tempDiv.style.width = '800px'
      tempDiv.style.height = '500px'
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      document.body.appendChild(tempDiv)

      // Renderizar gráfico
      console.log(`🔄 [ChartExporter] Renderizando gráfico tipo: ${chartType}`)
      Plotly.newPlot(tempDiv, data, layout, config)
        .then(() => {
          console.log(`✅ [ChartExporter] Gráfico renderizado, exportando como imagem...`)
          // Exportar como imagem PNG
          return Plotly.toImage(tempDiv, {
            format: 'png',
            width: 800,
            height: 500,
            scale: 2  // Alta resolução
          })
        })
        .then((imageDataUrl) => {
          console.log(`✅ [ChartExporter] Imagem exportada:`, {
            hasDataUrl: !!imageDataUrl,
            dataUrlLength: imageDataUrl?.length,
            dataUrlStart: imageDataUrl?.substring(0, 50),
            isValidFormat: imageDataUrl?.startsWith('data:image/png')
          })
          
          // Remover div temporário
          if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv)
          }
          
          // Verificar se o dataUrl está no formato correto
          if (!imageDataUrl || !imageDataUrl.startsWith('data:image')) {
            throw new Error(`Formato de imagem inválido: ${imageDataUrl?.substring(0, 50)}`)
          }
          
          // Retornar base64 (sem o prefixo data:image/png;base64,)
          const base64 = imageDataUrl.split(',')[1]
          resolve({
            base64,
            dataUrl: imageDataUrl,
            width: 800,
            height: 500
          })
        })
        .catch((error) => {
          console.error(`❌ [ChartExporter] Erro ao exportar gráfico tipo ${chartType}:`, error)
          if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv)
          }
          reject(error)
        })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Gera ambas as imagens dos gráficos do dashboard
 * @param {Object} chartData - Dados dos gráficos do dashboard
 * @returns {Promise<Object>} Objeto com success e charts (networkVolume, reasonFrequency)
 */
export const generateDashboardChartsImages = async (chartData) => {
  try {
    console.log('🔄 [ChartExporter] Iniciando geração de imagens dos gráficos...')
    console.log('📊 [ChartExporter] Dados recebidos:', {
      hasChartData: !!chartData,
      hasNetworkVolume: !!chartData?.networkVolume,
      hasReasonFrequency: !!chartData?.reasonFrequency,
      networkVolumeLength: chartData?.networkVolume?.length,
      reasonFrequencyLength: chartData?.reasonFrequency?.length
    })
    
    if (!chartData || !chartData.networkVolume || !chartData.reasonFrequency) {
      console.error('❌ [ChartExporter] Dados de gráficos inválidos:', chartData)
      return {
        success: false,
        error: 'Dados de gráficos inválidos'
      }
    }

    console.log('🔄 [ChartExporter] Gerando gráfico de barras...')
    const barChart = await exportChartToImage(chartData, 'bar')
    console.log('✅ [ChartExporter] Gráfico de barras gerado:', {
      hasDataUrl: !!barChart?.dataUrl,
      dataUrlLength: barChart?.dataUrl?.length,
      dataUrlStart: barChart?.dataUrl?.substring(0, 50)
    })

    console.log('🔄 [ChartExporter] Gerando gráfico de pizza...')
    const pieChart = await exportChartToImage(chartData, 'pie')
    console.log('✅ [ChartExporter] Gráfico de pizza gerado:', {
      hasDataUrl: !!pieChart?.dataUrl,
      dataUrlLength: pieChart?.dataUrl?.length,
      dataUrlStart: pieChart?.dataUrl?.substring(0, 50)
    })

    const result = {
      success: true,
      charts: {
        networkVolume: barChart,
        reasonFrequency: pieChart
      }
    }
    
    console.log('✅ [ChartExporter] Todas as imagens geradas com sucesso:', {
      hasNetworkVolume: !!result.charts.networkVolume,
      hasReasonFrequency: !!result.charts.reasonFrequency
    })
    
    return result
  } catch (error) {
    console.error('❌ [ChartExporter] Erro ao gerar imagens dos gráficos:', error)
    console.error('❌ [ChartExporter] Stack:', error.stack)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Gera gráfico de pizza (donut) de sentimento por rede social
 * @param {Array} sentimentData - Array de objetos { network, sentiment, count, percentage }
 * @returns {Promise<Object>} Objeto com base64, dataUrl, width e height
 */
export const generateSentimentPieChart = async (sentimentData) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!Array.isArray(sentimentData) || sentimentData.length === 0) {
        reject(new Error('Dados de sentimento inválidos ou vazios'))
        return
      }

      // Obter Plotly
      const Plotly = await getPlotly()

      // Mapear cores por sentimento (paleta da marca)
      const sentimentColors = {
        'Positivo': '#15A237', // Verde
        'Neutro': '#FCC200',   // Amarelo Ouro
        'Negativo': '#006AB9'  // Azul Oceano
      }

      // Preparar dados para Plotly
      const labels = sentimentData.map(item => `${item.network} - ${item.sentiment}`)
      const values = sentimentData.map(item => item.percentage)
      const colors = sentimentData.map(item => sentimentColors[item.sentiment] || '#272A30')

      const data = [{
        type: 'pie',
        labels: labels,
        values: values,
        hole: 0.4, // Donut chart
        marker: {
          colors: colors,
          line: {
            color: '#F3F7FC',
            width: 2
          }
        },
        textinfo: 'percent+label',
        textposition: 'outside',
        textfont: {
          family: 'Poppins, sans-serif',
          size: 11,
          color: '#272A30'
        },
        hovertemplate: '<b>%{label}</b><br>Percentual: %{percent}<br>Valor: %{value:.2f}%<extra></extra>'
      }]

      const layout = {
        title: {
          text: 'Gráfico: Análise de Sentimento por Rede Social',
          font: {
            family: 'Poppins, sans-serif',
            size: 18,
            color: '#1634FF',
            weight: 'bold'
          },
          x: 0.5,
          xanchor: 'center'
        },
        paper_bgcolor: '#F3F7FC',
        plot_bgcolor: '#F3F7FC',
        font: {
          family: 'Poppins, sans-serif',
          size: 12,
          color: '#272A30'
        },
        legend: {
          orientation: 'v',
          x: 1.05,
          y: 0.5,
          font: {
            family: 'Poppins, sans-serif',
            size: 11
          },
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          bordercolor: '#272A30',
          borderwidth: 1
        },
        margin: {
          l: 50,
          r: 150,
          t: 80,
          b: 50
        },
        showlegend: true,
        autosize: true
      }

      const config = {
        displayModeBar: false,
        responsive: true
      }

      // Criar div temporário para renderizar o gráfico
      const tempDiv = document.createElement('div')
      tempDiv.style.width = '800px'
      tempDiv.style.height = '500px'
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      document.body.appendChild(tempDiv)

      console.log('🔄 [ChartExporter] Renderizando gráfico de sentimento...')

      // Renderizar gráfico
      await Plotly.newPlot(tempDiv, data, layout, config)

      // Aguardar renderização
      await new Promise(resolve => setTimeout(resolve, 500))

      console.log('✅ [ChartExporter] Gráfico renderizado, exportando como imagem...')

      // Exportar como imagem
      const imageData = await Plotly.toImage(tempDiv, {
        format: 'png',
        width: 800,
        height: 500,
        scale: 2
      })

      // Limpar div temporário
      document.body.removeChild(tempDiv)

      const result = {
        dataUrl: imageData,
        width: 800,
        height: 500
      }

      console.log('✅ [ChartExporter] Gráfico de sentimento exportado com sucesso')
      resolve(result)
    } catch (error) {
      console.error('❌ [ChartExporter] Erro ao gerar gráfico de sentimento:', error)
      console.error('❌ [ChartExporter] Stack:', error.stack)
      reject(error)
    }
  })
}
