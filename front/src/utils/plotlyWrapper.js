// VERSION: v1.0.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
// Wrapper para carregar Plotly corretamente com Vite
// Isso resolve o problema do require dinâmico do react-plotly.js

let plotlyInstance = null

export const loadPlotly = async () => {
  if (plotlyInstance) {
    return plotlyInstance
  }

  try {
    // Tentar usar window.Plotly primeiro (disponível através do react-plotly.js)
    if (typeof window !== 'undefined' && window.Plotly) {
      plotlyInstance = window.Plotly
      return plotlyInstance
    }

    // Se não estiver disponível, importar plotly.js-dist-min
    const plotlyModule = await import('plotly.js-dist-min')
    
    if (plotlyModule.default) {
      plotlyInstance = plotlyModule.default
    } else if (plotlyModule.Plotly) {
      plotlyInstance = plotlyModule.Plotly
    } else {
      plotlyInstance = plotlyModule
    }

    // Disponibilizar globalmente para react-plotly.js
    if (typeof window !== 'undefined') {
      window.Plotly = plotlyInstance
    }

    return plotlyInstance
  } catch (error) {
    console.error('Erro ao carregar Plotly:', error)
    throw error
  }
}

// Pré-carregar Plotly quando o módulo for importado
if (typeof window !== 'undefined') {
  loadPlotly().catch(err => {
    console.warn('Não foi possível pré-carregar Plotly:', err)
  })
}

export default loadPlotly
