import React from 'react';
import { X, BookOpen, Calendar, User } from 'lucide-react';

// Componente Modal de Artigo
// VERSION: v1.1.0 | DATE: 2024-12-19 | AUTHOR: VeloHub Development Team
const ArticleModal = ({ isOpen, onClose, article }) => {
    if (!isOpen || !article) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={handleOverlayClick}
        >
            <div className="rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden" style={{borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)', backgroundColor: 'var(--cor-container)', border: '1px solid var(--cor-borda)'}}>
                {/* Header do Modal */}
                <div className="flex items-center justify-between p-6" style={{borderBottom: '1px solid var(--cor-borda)'}}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{backgroundColor: 'var(--cor-borda)'}}>
                            <BookOpen size={24} style={{color: 'var(--blue-medium)'}} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold" style={{color: 'var(--blue-dark)'}}>
                                {article.title}
                            </h2>
                            <div className="flex items-center gap-4 text-sm mt-1" style={{color: 'var(--cor-texto-secundario)'}}>
                                {article.author && (
                                    <div className="flex items-center gap-1">
                                        <User size={14} />
                                        <span>{article.author}</span>
                                    </div>
                                )}
                                {article.createdAt && (
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        <span>{new Date(article.createdAt).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg transition-colors"
                        style={{color: 'var(--cor-texto-secundario)', backgroundColor: 'transparent'}}
                        onMouseEnter={(e) => {
                            e.target.style.color = 'var(--cor-texto-principal)';
                            e.target.style.backgroundColor = 'var(--cor-borda)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.color = 'var(--cor-texto-secundario)';
                            e.target.style.backgroundColor = 'transparent';
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Conteúdo do Modal */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {/* Keywords se disponível */}
                    {article.tag && (
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold mb-2" style={{color: 'var(--blue-dark)'}}>Tag:</h3>
                            <div className="flex flex-wrap gap-2">
                                <span 
                                    className="px-3 py-1 text-sm rounded-full"
                                    style={{backgroundColor: 'var(--cor-borda)', color: 'var(--blue-medium)'}}
                                >
                                    {article.tag}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Conteúdo do Artigo */}
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                        <div className="leading-relaxed whitespace-pre-wrap" style={{color: 'var(--cor-texto-principal)'}}>
                            {article.content}
                        </div>
                    </div>

                    {/* Informações adicionais */}
                    {article.relevanceScore && (
                        <div className="mt-6 p-4 rounded-lg" style={{backgroundColor: 'var(--cor-borda)'}}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm" style={{color: 'var(--cor-texto-secundario)'}}>
                                    Relevância para sua pergunta:
                                </span>
                                <span className="text-sm font-semibold" style={{color: 'var(--blue-medium)'}}>
                                    {Math.round(article.relevanceScore * 100)}%
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer do Modal */}
                <div className="flex items-center justify-between p-6" style={{borderTop: '1px solid var(--cor-borda)', backgroundColor: 'var(--cor-borda)'}}>
                    <div className="text-sm" style={{color: 'var(--cor-texto-secundario)'}}>
                        Artigo ID: {article.id}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-md transition-colors"
                            style={{color: 'var(--cor-texto-secundario)', border: '1px solid var(--cor-borda)', backgroundColor: 'transparent'}}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--cor-container)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            Fechar
                        </button>
                        <button
                            onClick={() => {
                                // Aqui você pode implementar funcionalidades adicionais como:
                                // - Compartilhar artigo
                                // - Marcar como favorito
                                // - Imprimir
                                console.log('Ação adicional no artigo:', article.title);
                            }}
                            className="px-4 py-2 rounded-md transition-colors"
                            style={{backgroundColor: 'var(--blue-medium)', color: 'var(--white)'}}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--blue-dark)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--blue-medium)'}
                        >
                            Ações
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleModal;
