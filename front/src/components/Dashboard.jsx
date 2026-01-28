// VERSION: v1.2.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
import { useState, useEffect, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { getDashboardMetrics, getChartData, getRatingAverage, getTabulations } from '../services/api'
import WordCloudInsights from './WordCloudInsights'

// Importar createPlotlyComponent usando import default
// O módulo react-plotly.js/factory exporta apenas default
import createPlotlyComponentDefault from 'react-plotly.js/factory'

// Extrair a função corretamente - pode ser default ou o próprio módulo
const createPlotlyComponent = createPlotlyComponentDefault?.default || createPlotlyComponentDefault

// Verificar se é uma função antes de usar
if (typeof createPlotlyComponent !== 'function') {
  console.error('createPlotlyComponent não é uma função:', createPlotlyComponent)
}

// Criar componente Plot usando a factory do react-plotly.js
const Plot = createPlotlyComponent && typeof createPlotlyComponent === 'function' 
  ? createPlotlyComponent(Plotly) 
  : null

const Dashboard = ({ onWordClick, setWordCloudWords }) => {
  const [metrics, setMetrics] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [ratingAverage, setRatingAverage] = useState(null)
  const [messages, setMessages] = useState([])
  const [filters, setFilters] = useState({
    socialNetwork: '',
    contactReason: '',
    dateFrom: '',
    dateTo: ''
  })
  const [loading, setLoading] = useState(true)

  const socialNetworks = ['Instagram', 'Facebook', 'TikTok', 'Messenger', 'YouTube', 'PlayStore']
  const reasons = ['Produto', 'Suporte', 'Bug', 'Elogio', 'Reclamação', 'Oculto', 'Outro']

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    setLoading(true)
    try {
      const [metricsResult, chartResult, ratingResult, messagesResult] = await Promise.allSettled([
        getDashboardMetrics(filters),
        getChartData(filters),
        getRatingAverage(filters),
        getTabulations(filters)
      ])

      // Tratar métricas - tentar usar dados mesmo se success for false
      if (metricsResult.status === 'fulfilled') {
        if (metricsResult.value?.success && metricsResult.value?.data) {
          setMetrics(metricsResult.value.data)
        } else if (metricsResult.value?.data) {
          // Tentar usar dados mesmo se success for false
          setMetrics(metricsResult.value.data)
        } else {
          console.error('Erro ao carregar métricas:', metricsResult.value?.error)
        }
      } else {
        console.error('Erro ao carregar métricas:', metricsResult.reason)
      }

      // Tratar gráficos - tentar usar dados mesmo se success for false
      if (chartResult.status === 'fulfilled') {
        if (chartResult.value?.success && chartResult.value?.data) {
          setChartData(chartResult.value.data)
        } else if (chartResult.value?.data) {
          // Tentar usar dados mesmo se success for false
          setChartData(chartResult.value.data)
        } else {
          console.error('Erro ao carregar gráficos:', chartResult.value?.error)
        }
      } else {
        console.error('Erro ao carregar gráficos:', chartResult.reason)
      }

      // Tratar rating (já está bem tratado)
      if (ratingResult.status === 'fulfilled' && ratingResult.value?.success && ratingResult.value?.data) {
        setRatingAverage(ratingResult.value.data)
      } else if (ratingResult.status === 'rejected') {
        console.warn('Endpoint de rating não disponível:', ratingResult.reason?.message)
      }

      // Tratar mensagens para WordCloud
      if (messagesResult.status === 'fulfilled') {
        if (messagesResult.value?.data && Array.isArray(messagesResult.value.data)) {
          setMessages(messagesResult.value.data)
        } else if (messagesResult.value?.success === false) {
          console.warn('Erro ao carregar mensagens para WordCloud:', messagesResult.value?.error)
          setMessages([])
        } else {
          setMessages([])
        }
      } else if (messagesResult.status === 'rejected') {
        console.warn('Erro ao carregar mensagens para WordCloud:', messagesResult.reason?.message)
        setMessages([])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleWordsProcessed = useCallback((words) => {
    if (setWordCloudWords) {
      setWordCloudWords(words)
    }
  }, [setWordCloudWords])

  if (loading) {
    return (
      <>
        <div className="filters-section">
          <p>Carregando dados...</p>
        </div>
        <div className="velohub-container">
          <p>Carregando dados...</p>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Linha de Filtros - FORA do container */}
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

        <div className="filter-group filter-group-date">
          <label>Data Inicial</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="velohub-input"
          />
        </div>

        <div className="filter-group filter-group-date">
          <label>Data Final</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="velohub-input"
          />
        </div>
      </div>

      {/* Container Principal */}
      <div className="velohub-container">
        {/* Cards de Métricas */}
      {metrics && (
        <div className="metrics-cards">
          <div className="metric-card">
            <h3>Total de Contatos</h3>
            <p className="metric-value">{metrics.totalContacts}</p>
          </div>
          <div className="metric-card">
            <h3>% Sentimento Positivo</h3>
            <p className="metric-value">{metrics.positivePercent}%</p>
          </div>
          {ratingAverage ? (
            <div className="metric-card">
              <h3>Média</h3>
              <p className="metric-value">
                {ratingAverage.average ? ratingAverage.average.toFixed(2) : 'N/A'}
                {ratingAverage.average && <span className="metric-unit">⭐</span>}
              </p>
            </div>
          ) : (
            <div className="metric-card">
              <h3>Média</h3>
              <p className="metric-value">N/A</p>
            </div>
          )}
          <div className="metric-card">
            <h3>Rede mais Ativa</h3>
            <p className="metric-value">{metrics.mostActiveNetwork || 'N/A'}</p>
          </div>
        </div>
      )}

      {/* Gráficos */}
      {chartData && Plot && (
        <div className="charts-section">
          <div className="chart-container">
            <h3>Volume por Rede Social</h3>
            <Plot
              data={[{
                x: chartData.networkVolume.map(item => item.socialNetwork),
                y: chartData.networkVolume.map(item => item.count),
                type: 'bar',
                marker: { color: '#1634FF' }
              }]}
              layout={{
                title: '',
                xaxis: { title: 'Rede Social' },
                yaxis: { title: 'Quantidade' },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)'
              }}
              style={{ width: '100%', height: '400px' }}
            />
          </div>

          <div className="chart-container">
            <h3>Motivos Frequentes</h3>
            <Plot
              data={[{
                values: chartData.reasonFrequency.map(item => item.count),
                labels: chartData.reasonFrequency.map(item => item.reason),
                type: 'pie',
                hole: 0.4
              }]}
              layout={{
                title: '',
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)'
              }}
              style={{ width: '100%', height: '400px' }}
            />
          </div>
        </div>
      )}
      {chartData && !Plot && (
        <div className="charts-section">
          <p>Carregando gráficos...</p>
        </div>
      )}

      {/* Nuvem de Palavras */}
      <WordCloudInsights 
        messages={messages} 
        filters={filters} 
        onWordClick={onWordClick}
        onWordsProcessed={handleWordsProcessed}
      />
      </div>
    </>
  )
}

export default Dashboard
