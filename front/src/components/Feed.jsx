// VERSION: v1.1.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
import { useState, useEffect } from 'react'
import { ChatOutlined } from '@mui/icons-material'
import { getFeed } from '../services/api'
import KeywordFilter from './KeywordFilter'
import { exportFeedToExcel } from '../utils/excelExporter'
import DownloadIcon from './icons/DownloadIcon'

const Feed = ({ selectedWord, wordCloudWords = [] }) => {
  const [feedData, setFeedData] = useState([])
  const [filters, setFilters] = useState({
    socialNetwork: '',
    contactReason: '',
    sentiment: '',
    dateFrom: '',
    dateTo: '',
    keyword: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const socialNetworks = ['Instagram', 'Facebook', 'TikTok', 'Messenger', 'YouTube', 'PlayStore']
  const reasons = ['Produto', 'Suporte', 'Bug', 'Elogio', 'Reclamação', 'Oculto', 'Outro']
  const sentiments = ['Positivo', 'Neutro', 'Negativo']

  useEffect(() => {
    loadFeed()
  }, [filters])

  // Sincronizar selectedWord com filters.keyword
  useEffect(() => {
    if (selectedWord) {
      setFilters(prev => ({ ...prev, keyword: selectedWord }))
    }
  }, [selectedWord])

  const loadFeed = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getFeed(filters)
      if (result?.success && result.data) {
        setFeedData(result.data)
        setError(null)
        console.log('📊 [Feed] Dados carregados:', { total: result.data.length })
      } else {
        setFeedData([])
      }
    } catch (err) {
      console.error('Erro ao carregar feed:', err)
      setFeedData([])
      setError(err?.message || 'Erro ao carregar feed. Verifique a conexão.')
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

  const getNetworkClass = (network) => {
    return `card-${network.toLowerCase()}`
  }

  const getSentimentClass = (sentiment) => {
    return `sentiment-${sentiment?.toLowerCase() || 'neutro'}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      // PROBLEMA: Se no MongoDB está 04/02/2026 09:00 mas aparece 03/02/2026 21:00,
      // há uma diferença de 12 horas. Isso sugere que a data foi salva incorretamente.
      // 
      // SOLUÇÃO TEMPORÁRIA: Ajustar a data adicionando 12 horas para corrigir a exibição
      // Isso é uma correção temporária até que o problema de salvamento seja resolvido
      
      let date
      
      // Interpretar a string como UTC
      if (typeof dateString === 'string') {
        if (dateString.endsWith('Z')) {
          date = new Date(dateString)
        } else if (dateString.includes('T')) {
          date = new Date(dateString + 'Z')
        } else {
          date = new Date(dateString)
        }
      } else {
        date = new Date(dateString)
      }
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        console.warn('⚠️ [Feed] Data inválida:', dateString)
        return ''
      }
      
      // CORREÇÃO: Adicionar 12 horas para corrigir a diferença
      // Se aparece 03/02/2026 21:00 quando deveria ser 04/02/2026 09:00,
      // adicionar 12 horas corrige: 03/02/2026 21:00 + 12h = 04/02/2026 09:00
      const adjustedDate = new Date(date.getTime() + (12 * 60 * 60 * 1000))
      
      // Formatar usando Intl.DateTimeFormat com timezone explícito do Brasil
      const formatter = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      
      const formatted = formatter.format(adjustedDate)
      
      return formatted
    } catch (error) {
      console.error('❌ [Feed] Erro ao formatar data:', error, dateString)
      return ''
    }
  }

  // Aplicar filtro de palavra-chave no frontend
  const filteredFeedData = feedData.filter(item => {
    if (!filters.keyword) return true
    const messageText = (item.messageText || '').toLowerCase()
    const keyword = filters.keyword.toLowerCase()
    return messageText.includes(keyword)
  })

  // Contagem de resultados filtrados
  const resultCount = filteredFeedData.length
  const totalCount = feedData.length

  // Função para exportar para Excel
  const handleExportExcel = () => {
    if (filteredFeedData.length === 0) {
      alert('Não há dados para exportar. Aplique filtros ou aguarde o carregamento dos dados.')
      return
    }

    const result = exportFeedToExcel(filteredFeedData, filters)
    if (result.success) {
      console.log(`✅ Arquivo ${result.filename} exportado com sucesso!`)
    } else {
      alert(`Erro ao exportar: ${result.error}`)
    }
  }

  if (loading) {
    return (
      <div className="velohub-container">
        <p>Carregando feed...</p>
      </div>
    )
  }

  // Exibir erro de conexão/API
  if (error) {
    return (
      <div className="velohub-container">
        <div className="section-title" style={{ marginBottom: '16px' }}>Feed de Atendimento</div>
        <div style={{
          padding: '20px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          color: '#856404'
        }}>
          <strong>Erro ao carregar feed:</strong> {error}
          <br />
          <small>Verifique se o servidor está online e tente novamente.</small>
        </div>
      </div>
    )
  }

  return (
    <div className="velohub-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          <ChatOutlined className="section-icon" />
          Feed de Atendimento
        </h2>
        
        {/* Botão de Exportar */}
        <button
          onClick={handleExportExcel}
          disabled={feedData.length === 0}
          className="velohub-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: feedData.length > 0 ? '#1634FF' : '#666',
            color: 'white',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '6px',
            cursor: feedData.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            opacity: feedData.length > 0 ? 1 : 0.6
          }}
          onMouseEnter={(e) => {
            if (feedData.length > 0) {
              e.target.style.backgroundColor = '#0d28cc'
              e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'
            }
          }}
          onMouseLeave={(e) => {
            if (feedData.length > 0) {
              e.target.style.backgroundColor = '#1634FF'
              e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
            }
          }}
          title={feedData.length > 0 ? "Exportar histórico para Excel" : "Aguarde o carregamento dos dados"}
        >
          <DownloadIcon 
            size={18} 
            color="#ffffff" 
            strokeColor="#000000" 
            backgroundColor="#1634FF"
            showBackground={false}
          />
          Exportar Excel
        </button>
      </div>

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
          <label>Sentimento</label>
          <select
            value={filters.sentiment}
            onChange={(e) => handleFilterChange('sentiment', e.target.value)}
            className="velohub-input"
          >
            <option value="">Todos</option>
            {sentiments.map(sentiment => (
              <option key={sentiment} value={sentiment}>{sentiment}</option>
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

        <div className="filter-group">
          <label>Palavra-Chave (Nuvem)</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <KeywordFilter
              value={filters.keyword}
              onChange={(value) => handleFilterChange('keyword', value)}
              options={wordCloudWords}
              placeholder="Digite ou selecione uma palavra da nuvem"
            />
            {filters.keyword && (
              <button 
                onClick={() => handleFilterChange('keyword', '')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contador de resultados quando filtro está ativo */}
      {filters.keyword && (
        <div style={{
          marginBottom: '15px',
          padding: '10px 15px',
          backgroundColor: '#1e2130',
          borderRadius: '4px',
          border: '1px solid #2d3142'
        }}>
          <p style={{ margin: 0, color: '#e0e0e0', fontSize: '14px' }}>
            {resultCount === 0 
              ? `Nenhuma mensagem encontrada com a palavra-chave "${filters.keyword}".`
              : `Mostrando ${resultCount} de ${totalCount} mensagem${totalCount !== 1 ? 's' : ''} com a palavra-chave "${filters.keyword}".`}
          </p>
        </div>
      )}

      {/* Feed de Atendimentos */}
      {filteredFeedData.length === 0 ? (
        <div className="empty-feed">
          <p>
            {feedData.length === 0 
              ? 'O feed está vazio.' 
              : `Nenhuma mensagem encontrada com a palavra-chave "${filters.keyword}".`}
          </p>
        </div>
      ) : (
        <div className="feed-list">
          {filteredFeedData.map((item) => (
            <div key={item._id} className={`velohub-card feed-card ${getNetworkClass(item.socialNetwork)}`}>
              <div className="feed-header">
                <strong>{item.socialNetwork} | {item.clientName}</strong>
                <span className={getSentimentClass(item.sentiment)}>
                  {item.sentiment || 'N/A'}
                </span>
              </div>
              <div className="feed-meta">
                <span className="badge">{item.contactReason || 'N/A'}</span>
                {item.rating && <span className="rating">⭐ {item.rating}</span>}
              </div>
              <p className="feed-message">"{item.messageText}"</p>
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="feed-link">
                  Ver link
                </a>
              )}
              <small className="feed-timestamp">{formatDate(item.createdAt)}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Feed
