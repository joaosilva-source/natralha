// VERSION: v1.1.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
import { useState } from 'react'
import { AddCircleOutlined } from '@mui/icons-material'
import { createTabulation, analyzeText } from '../services/api'

const TabulationForm = () => {
  const [formData, setFormData] = useState({
    clientName: '',
    socialNetwork: 'Instagram',
    messageText: '',
    rating: '',
    contactReason: '',
    sentiment: '',
    directedCenter: false,
    link: '',
    createdAt: '' // Campo de data opcional
  })
  
  const [useAI, setUseAI] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const socialNetworks = ['Instagram', 'Facebook', 'TikTok', 'Messenger', 'YouTube', 'PlayStore']
  const reasons = ['Produto', 'Suporte', 'Bug', 'Elogio', 'Reclamação', 'Oculto', 'Outro']
  const sentiments = ['Positivo', 'Neutro', 'Negativo']

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleAIAnalysis = async () => {
    if (!formData.messageText.trim()) {
      setMessage('Por favor, insira o texto da mensagem para análise')
      return
    }

    setLoading(true)
    try {
      const result = await analyzeText(formData.messageText)
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          sentiment: result.data.sentiment,
          contactReason: result.data.reason
        }))
        setMessage('Análise realizada com sucesso!')
      } else if (result.fallback) {
        setFormData(prev => ({
          ...prev,
          sentiment: result.fallback.sentiment,
          contactReason: result.fallback.reason
        }))
        setMessage('Análise realizada com valores padrão')
      }
    } catch (error) {
      setMessage(`Erro na análise: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.clientName || !formData.messageText) {
      setMessage('Preencha os campos obrigatórios')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // Limpar dados: converter strings vazias para null e processar rating
      let ratingValue = null;
      if (formData.rating && formData.rating !== '') {
        const ratingStr = formData.rating.replace('⭐', '').trim();
        if (ratingStr) {
          const parsed = parseInt(ratingStr, 10);
          if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) {
            ratingValue = parsed;
          }
        }
      }

      // Preparar dados garantindo que não há undefined ou strings vazias indevidas
      const data = {
        clientName: (formData.clientName || '').trim(),
        socialNetwork: formData.socialNetwork || '',
        messageText: (formData.messageText || '').trim(),
        rating: ratingValue,
        contactReason: (formData.contactReason && formData.contactReason.trim() !== '') ? formData.contactReason.trim() : null,
        sentiment: (formData.sentiment && formData.sentiment.trim() !== '') ? formData.sentiment.trim() : null,
        directedCenter: Boolean(formData.directedCenter),
        link: (formData.link && formData.link.trim() !== '') ? formData.link.trim() : null,
        createdAt: formData.createdAt && formData.createdAt.trim() !== '' ? formData.createdAt : null
      }

      // Validar campos obrigatórios antes de enviar
      if (!data.clientName || !data.socialNetwork || !data.messageText) {
        setMessage('Erro: Preencha todos os campos obrigatórios (Nome do Cliente, Rede Social e Mensagem)')
        setLoading(false)
        return
      }

      // Log dos dados antes de enviar (para debug)
      console.log('📤 Enviando dados para API:', data)

      const result = await createTabulation(data)
      
      // Log do resultado
      console.log('📥 Resposta da API:', result)
      
      if (result.success) {
        setMessage('Tabulação criada com sucesso!')
        // Reset form
        setFormData({
          clientName: '',
          socialNetwork: 'Instagram',
          messageText: '',
          rating: '',
          contactReason: '',
          sentiment: '',
          directedCenter: false,
          link: '',
          createdAt: ''
        })
      } else {
        setMessage(`Erro: ${result.error || 'Erro desconhecido ao criar tabulação'}`)
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro desconhecido ao criar tabulação'
      console.error('Erro detalhado:', error.response?.data || error)
      setMessage(`Erro: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="velohub-container">
      <h2 className="section-title">
        <AddCircleOutlined className="section-icon" />
        Nova Tabulação
      </h2>
      
      {message && (
        <div className={`message ${message.includes('sucesso') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="tabulation-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="clientName">Nome do Cliente *</label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className="velohub-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="socialNetwork">Rede Social *</label>
            <select
              id="socialNetwork"
              name="socialNetwork"
              value={formData.socialNetwork}
              onChange={handleChange}
              className="velohub-input"
              required
            >
              {socialNetworks.map(network => (
                <option key={network} value={network}>{network}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="createdAt">Data da Tabulação (Opcional)</label>
          <input
            type="date"
            id="createdAt"
            name="createdAt"
            value={formData.createdAt}
            onChange={handleChange}
            className="velohub-input"
            title="Deixe em branco para usar a data atual"
          />
          <small style={{ color: '#888', fontSize: '12px', display: 'block', marginTop: '4px' }}>
            Deixe em branco para usar a data/hora atual
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="messageText">Texto da Mensagem Principal *</label>
          <textarea
            id="messageText"
            name="messageText"
            value={formData.messageText}
            onChange={handleChange}
            className="velohub-input"
            rows="4"
            required
          />
        </div>

        {(formData.socialNetwork === 'YouTube' || formData.socialNetwork === 'TikTok') && (
          <div className="form-group">
            <label htmlFor="link">Link do Vídeo</label>
            <input
              type="url"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleChange}
              className="velohub-input"
              placeholder="Ex: https://www.youtube.com/watch?v=... ou https://www.tiktok.com/@... ou https://drive.google.com/..."
            />
          </div>
        )}

        {formData.socialNetwork === 'PlayStore' && (
          <div className="form-group">
            <label htmlFor="rating">Avaliação *</label>
            <select
              id="rating"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className="velohub-input"
              required
            >
              <option value="">Selecione</option>
              <option value="1⭐">1⭐</option>
              <option value="2⭐">2⭐</option>
              <option value="3⭐">3⭐</option>
              <option value="4⭐">4⭐</option>
              <option value="5⭐">5⭐</option>
            </select>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="contactReason">Motivo do Contato</label>
            <select
              id="contactReason"
              name="contactReason"
              value={formData.contactReason}
              onChange={handleChange}
              className="velohub-input"
            >
              <option value="">Selecione</option>
              {reasons.map(reason => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sentiment">Sentimento</label>
            <select
              id="sentiment"
              name="sentiment"
              value={formData.sentiment}
              onChange={handleChange}
              className="velohub-input"
            >
              <option value="">Selecione</option>
              {sentiments.map(sentiment => (
                <option key={sentiment} value={sentiment}>{sentiment}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="directedCenter" className="checkbox-label">
            <input
              type="checkbox"
              id="directedCenter"
              name="directedCenter"
              checked={formData.directedCenter}
              onChange={handleChange}
            />
            Direcionado para Central
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="useAI" className="checkbox-label">
            <input
              type="checkbox"
              id="useAI"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
            />
            Usar Análise Expressa (IA)
          </label>
          {useAI && (
            <button
              type="button"
              onClick={handleAIAnalysis}
              className="velohub-btn secondary"
              disabled={loading || !formData.messageText.trim()}
            >
              {loading ? 'Analisando...' : 'Analisar com IA'}
            </button>
          )}
        </div>

        <button
          type="submit"
          className="velohub-btn"
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar Tabulação'}
        </button>
      </form>
    </div>
  )
}

export default TabulationForm
