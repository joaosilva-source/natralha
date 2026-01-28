// VERSION: v1.1.0 | DATE: 2025-01-30 | AUTHOR: VeloHub Development Team
import { useState } from 'react'
import TabulationForm from './components/TabulationForm'
import Dashboard from './components/Dashboard'
import Feed from './components/Feed'
import Reports from './components/Reports'
import './styles/theme.css'

function App() {
  const [activeTab, setActiveTab] = useState('tabulation')
  const [selectedWord, setSelectedWord] = useState(null)
  const [wordCloudWords, setWordCloudWords] = useState([])

  const tabs = [
    { id: 'tabulation', label: 'Entrada de Dados' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'feed', label: 'Feed de Atendimento' },
    { id: 'reports', label: 'Relatórios' }
  ]

  const handleWordSelect = (word) => {
    setSelectedWord(word)
    setActiveTab('feed')
  }

  return (
    <div className="app">
      {/* Seletor de Abas - Padrão Console */}
      <div className="tabs-container">
        <div className="tabs-wrapper">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-selected={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="main-content">
        {activeTab === 'tabulation' && <TabulationForm />}
        {activeTab === 'dashboard' && <Dashboard onWordClick={handleWordSelect} setWordCloudWords={setWordCloudWords} />}
        {activeTab === 'feed' && <Feed selectedWord={selectedWord} wordCloudWords={wordCloudWords} />}
        {activeTab === 'reports' && <Reports />}
      </main>
    </div>
  )
}

export default App
