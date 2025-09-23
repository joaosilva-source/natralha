/**
 * VeloHub V3 - Support Modal Component
 * VERSION: v1.1.0 | DATE: 2025-01-27 | AUTHOR: VeloHub Development Team
 */

import React, { useState } from 'react';
import { X, Send, FileText, Bot, GraduationCap, Map, Puzzle, PlusSquare, User, BookOpen, LifeBuoy } from 'lucide-react';

const SupportModal = ({ isOpen, onClose, type, title }) => {
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Aqui você pode implementar a lógica de envio
            console.log('Formulário enviado:', { type, title, formData });
            
            // Simular envio
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            alert('Solicitação enviada com sucesso!');
            onClose();
            setFormData({});
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            alert('Erro ao enviar solicitação. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'artigo': return <FileText size={24} />;
            case 'bot': return <Bot size={24} />;
            case 'treinamento': return <GraduationCap size={24} />;
            case 'roteiro': return <Map size={24} />;
            case 'funcionalidade': return <Puzzle size={24} />;
            case 'recurso': return <PlusSquare size={24} />;
            case 'gestao': return <User size={24} />;
            case 'rh_financeiro': return <BookOpen size={24} />;
            case 'facilities': return <LifeBuoy size={24} />;
            default: return <FileText size={24} />;
        }
    };

    const renderForm = () => {
        switch (type) {
            case 'artigo':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Assunto *
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.assunto || ''}
                                onChange={(e) => handleInputChange('assunto', e.target.value)}
                                placeholder="Digite o assunto do artigo"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Descrição *
                            </label>
                            <textarea
                                required
                                rows={4}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.descricao || ''}
                                onChange={(e) => handleInputChange('descricao', e.target.value)}
                                placeholder="Descreva o conteúdo do artigo"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Ocorrência
                            </label>
                            <textarea
                                rows={3}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.ocorrencia || ''}
                                onChange={(e) => handleInputChange('ocorrencia', e.target.value)}
                                placeholder="Se houver, situação que exemplifica a necessidade"
                            />
                        </div>
                    </div>
                );

            case 'bot':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Tipo *
                            </label>
                            <select
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.tipo || ''}
                                onChange={(e) => handleInputChange('tipo', e.target.value)}
                            >
                                <option value="">Selecione o tipo</option>
                                <option value="processo">Processo</option>
                                <option value="informacao">Informação</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Assunto *
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.assunto || ''}
                                onChange={(e) => handleInputChange('assunto', e.target.value)}
                                placeholder="Digite o assunto"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Contexto *
                            </label>
                            <textarea
                                required
                                rows={4}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.contexto || ''}
                                onChange={(e) => handleInputChange('contexto', e.target.value)}
                                placeholder="Descreva o contexto"
                            />
                        </div>
                    </div>
                );

            case 'treinamento':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Assunto *
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.assunto || ''}
                                onChange={(e) => handleInputChange('assunto', e.target.value)}
                                placeholder="Digite o assunto do treinamento"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Descrição *
                            </label>
                            <textarea
                                required
                                rows={4}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.descricao || ''}
                                onChange={(e) => handleInputChange('descricao', e.target.value)}
                                placeholder="Descreva o conteúdo do treinamento"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Ocorrência
                            </label>
                            <textarea
                                rows={3}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.ocorrencia || ''}
                                onChange={(e) => handleInputChange('ocorrencia', e.target.value)}
                                placeholder="Se houver, situação que exemplifica a necessidade"
                            />
                        </div>
                    </div>
                );

            case 'roteiro':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Produto *
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.produto || ''}
                                onChange={(e) => handleInputChange('produto', e.target.value)}
                                placeholder="Digite o produto"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Situação *
                            </label>
                            <textarea
                                required
                                rows={4}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.situacao || ''}
                                onChange={(e) => handleInputChange('situacao', e.target.value)}
                                placeholder="Descreva a situação"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Ocorrência
                            </label>
                            <textarea
                                rows={3}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.ocorrencia || ''}
                                onChange={(e) => handleInputChange('ocorrencia', e.target.value)}
                                placeholder="Se houver, situação que exemplifica a necessidade"
                            />
                        </div>
                    </div>
                );

            case 'funcionalidade':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Ambiente *
                            </label>
                            <select
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.ambiente || ''}
                                onChange={(e) => handleInputChange('ambiente', e.target.value)}
                            >
                                <option value="">Selecione o ambiente</option>
                                <option value="octadesk">Octadesk</option>
                                <option value="velohub">Velohub</option>
                                <option value="veloacademy">Veloacademy</option>
                                <option value="recurso-fisico">Recurso Físico</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Aplicação *
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.aplicacao || ''}
                                onChange={(e) => handleInputChange('aplicacao', e.target.value)}
                                placeholder="Digite a aplicação"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Observações
                            </label>
                            <textarea
                                rows={4}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.observacoes || ''}
                                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                                placeholder="Digite observações adicionais"
                            />
                        </div>
                    </div>
                );

            case 'recurso':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Descrição *
                            </label>
                            <textarea
                                required
                                rows={6}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.descricao || ''}
                                onChange={(e) => handleInputChange('descricao', e.target.value)}
                                placeholder="Descreva o recurso adicional necessário"
                            />
                        </div>
                    </div>
                );

            case 'gestao':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Tipo *
                            </label>
                            <select
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.tipo || ''}
                                onChange={(e) => handleInputChange('tipo', e.target.value)}
                            >
                                <option value="">Selecione o tipo</option>
                                <option value="solicitacao">Solicitação</option>
                                <option value="agendamento">Agendamento</option>
                                <option value="notificacao">Notificação</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Direcionado a *
                            </label>
                            <select
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.direcionado || ''}
                                onChange={(e) => handleInputChange('direcionado', e.target.value)}
                            >
                                <option value="">Selecione o destinatário</option>
                                <option value="supervisor">Supervisor</option>
                                <option value="gestor">Gestor</option>
                                <option value="backoffice">Backoffice</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Mensagem *
                            </label>
                            <textarea
                                required
                                rows={6}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.mensagem || ''}
                                onChange={(e) => handleInputChange('mensagem', e.target.value)}
                                placeholder="Digite sua mensagem"
                            />
                        </div>
                    </div>
                );

            case 'rh_financeiro':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Tipo *
                            </label>
                            <select
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.tipo || ''}
                                onChange={(e) => handleInputChange('tipo', e.target.value)}
                            >
                                <option value="">Selecione o tipo</option>
                                <option value="solicitacao">Solicitação</option>
                                <option value="agendamento">Agendamento</option>
                                <option value="notificacao">Notificação</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Setor *
                            </label>
                            <select
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.setor || ''}
                                onChange={(e) => handleInputChange('setor', e.target.value)}
                            >
                                <option value="">Selecione o setor</option>
                                <option value="rh">RH</option>
                                <option value="financeiro">Financeiro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Mensagem *
                            </label>
                            <textarea
                                required
                                rows={6}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.mensagem || ''}
                                onChange={(e) => handleInputChange('mensagem', e.target.value)}
                                placeholder="Digite sua mensagem"
                            />
                        </div>
                    </div>
                );

            case 'facilities':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Tipo *
                            </label>
                            <select
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.tipo || ''}
                                onChange={(e) => handleInputChange('tipo', e.target.value)}
                            >
                                <option value="">Selecione o tipo</option>
                                <option value="reposicao">Reposição</option>
                                <option value="substituicao">Substituição</option>
                                <option value="aquisicao">Aquisição</option>
                                <option value="acesso">Acesso</option>
                                <option value="manutencao">Manutenção</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Categoria *
                            </label>
                            <select
                                required
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.categoria || ''}
                                onChange={(e) => handleInputChange('categoria', e.target.value)}
                            >
                                <option value="">Selecione a categoria</option>
                                <option value="computador">Computador</option>
                                <option value="acessorio">Acessório</option>
                                <option value="mobilia">Mobília</option>
                                <option value="item_escritorio">Item de Escritório</option>
                                <option value="servico">Serviço</option>
                                <option value="estrutural">Estrutural</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{color: 'var(--cor-texto-principal)'}}>
                                Mensagem *
                            </label>
                            <textarea
                                required
                                rows={6}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                style={{
                                    backgroundColor: 'var(--cor-container)',
                                    color: 'var(--cor-texto-principal)',
                                    borderColor: 'var(--cor-borda)'
                                }}
                                value={formData.mensagem || ''}
                                onChange={(e) => handleInputChange('mensagem', e.target.value)}
                                placeholder="Digite sua mensagem"
                            />
                        </div>
                    </div>
                );

            default:
                return <div>Formulário não encontrado</div>;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                style={{ backgroundColor: 'var(--cor-container)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--cor-borda)' }}>
                    <div className="flex items-center space-x-3">
                        <div className="text-blue-500 dark:text-blue-400">
                            {getIcon()}
                        </div>
                        <h2 className="text-xl font-semibold" style={{color: 'var(--cor-texto-principal)'}}>
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {renderForm()}
                    
                    {/* Actions */}
                    <div className="flex justify-end space-x-3 mt-6 pt-6 border-t" style={{ borderColor: 'var(--cor-borda)' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            style={{
                                borderColor: 'var(--cor-borda)',
                                color: 'var(--cor-texto-principal)'
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Enviando...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    <span>Enviar</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupportModal;
