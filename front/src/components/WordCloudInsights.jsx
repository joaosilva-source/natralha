// VERSION: v1.0.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
import { useMemo, useEffect, useRef } from 'react'
import WordCloud from 'react-wordcloud'
import { processMessagesForWordCloud } from '../utils/wordCloudProcessor'

const WordCloudInsights = ({ messages = [], filters = {}, onWordClick, onWordsProcessed }) => {
  const prevWordsStringRef = useRef('')
  
  // Processar mensagens para gerar dados da WordCloud
  const wordCloudData = useMemo(() => {
    if (!Array.isArray(messages) || messages.length === 0) {
      return []
    }
    
    return processMessagesForWordCloud(messages, 50)
  }, [messages])

  // Compartilhar palavras processadas via callback
  useEffect(() => {
    if (onWordsProcessed && wordCloudData.length > 0) {
      const words = wordCloudData.map(w => w.text)
      // Comparar se as palavras realmente mudaram para evitar loops
      const wordsString = words.join(',')
      
      if (wordsString !== prevWordsStringRef.current) {
        prevWordsStringRef.current = wordsString
        onWordsProcessed(words)
      }
    }
  }, [wordCloudData, onWordsProcessed])

  // Configurações de cores (viridis-like ou tons de azul/amarelo)
  const colors = ['#1634FF', '#00d1b2', '#ffd93d', '#ff6b6b', '#6bcf7f', '#a29bfe', '#ff9f43']

  // Função para determinar rotação aleatória das palavras
  // Retorna diferentes ângulos para variar a orientação
  const rotation = () => {
    // Retorna 0 (horizontal) na maioria dos casos, mas também permite rotações
    // 0 = horizontal, 90 = vertical, -90 = vertical invertida, 45/-45 = diagonal
    const angles = [0, 0, 0, 0, 0, 45, -45, 90, -90] // Mais palavras horizontais
    return angles[Math.floor(Math.random() * angles.length)]
  }

  // Opções de configuração do WordCloud (API do react-wordcloud)
  const options = {
    rotations: 3, // Número de rotações possíveis
    rotationSteps: 2, // Passos de rotação
    rotation: rotation, // Função customizada para rotação
    fontSizes: [20, 60],
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    scale: 'sqrt',
    spiral: 'archimedean',
    transitionDuration: 1000,
    callbacks: {
      onWordClick: (word) => {
        if (onWordClick) {
          onWordClick(word.text)
        }
      }
    }
  }

  // Função para determinar cor baseada no índice
  const getColor = (word, index) => {
    return colors[index % colors.length]
  }

  // Se não houver dados, mostrar mensagem
  if (wordCloudData.length === 0) {
    return (
      <div className="chart-container">
        <h3>☁️ Nuvem de Palavras (Insights)</h3>
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: '#888',
          backgroundColor: '#1e2130',
          borderRadius: '8px',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <p>Nenhum dado disponível para gerar a nuvem de palavras.</p>
        </div>
      </div>
    )
  }

  // Adicionar cores aos dados
  const wordsWithColors = wordCloudData.map((word, index) => ({
    ...word,
    color: getColor(word, index)
  }))

  return (
    <div className="chart-container">
      <h3>☁️ Nuvem de Palavras (Insights)</h3>
      <div style={{
        width: '100%',
        height: '400px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: onWordClick ? 'pointer' : 'default'
      }}>
        <WordCloud
          words={wordsWithColors}
          options={options}
          size={[800, 400]}
        />
      </div>
      <p style={{ 
        marginTop: '10px', 
        fontSize: '12px', 
        color: '#888',
        textAlign: 'center' 
      }}>
        {onWordClick 
          ? 'Clique em uma palavra para filtrar o Feed de Atendimento' 
          : 'Palavras mais frequentes nos textos de atendimento (stopwords removidas)'}
      </p>
    </div>
  )
}

export default WordCloudInsights
