// Fix para react-plotly.js com Vite
// Este arquivo será carregado antes do app para disponibilizar Plotly globalmente
import('plotly.js-dist-min').then(plotlyModule => {
  const Plotly = plotlyModule.default || plotlyModule.Plotly || plotlyModule
  if (typeof window !== 'undefined') {
    window.Plotly = Plotly
    // Também disponibilizar no caminho que react-plotly.js espera
    if (!window.Plotly || !window.Plotly.newPlot) {
      console.warn('Plotly não carregado corretamente')
    }
  }
}).catch(err => {
  console.error('Erro ao carregar Plotly:', err)
})
