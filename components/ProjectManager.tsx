
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Project, ProjectStatus } from '../types';
import { Briefcase, Plus, X, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, Printer, MapPin, Target, Users, Loader2, User } from 'lucide-react';

const ProjectManager: React.FC = () => {
  const { projects, addProject, deleteProject, associationName, boardMembers } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '', 
    description: '', 
    objective: '',
    targetAudience: '',
    resources: '',
    financialImpact: '0',
    executionDate: '',
    executionLocation: '',
    status: 'planned' as ProjectStatus,
    authorId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await addProject({
        ...formData,
        financialImpact: parseFloat(formData.financialImpact)
      });
      
      setFormData({ 
        title: '', 
        description: '', 
        objective: '',
        targetAudience: '',
        resources: '',
        financialImpact: '0',
        executionDate: '',
        executionLocation: '',
        status: 'planned',
        authorId: ''
      });
      setShowForm(false);
      alert("Projeto salvo com sucesso!");
    } catch (error: any) {
      console.error("Erro ao salvar projeto:", error);
      alert(`Erro ao salvar projeto: ${error.message || "Tente novamente mais tarde."}`);
    } finally {
      setSaving(false);
    }
  };

  const getAuthorName = (id?: string) => {
    if (!id) return 'Não definido';
    return boardMembers.find(m => m.id === id)?.name || 'Membro não encontrado';
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch(status) {
        case 'planned': return 'Planejado';
        case 'ongoing': return 'Em Andamento';
        case 'completed': return 'Concluído';
        case 'cancelled': return 'Cancelado';
    }
  }

  const getStatusBadge = (status: ProjectStatus) => {
    switch(status) {
      case 'planned': return <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs flex items-center gap-1"><Clock size={12}/> Planejado</span>;
      case 'ongoing': return <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs flex items-center gap-1"><AlertCircle size={12}/> Em Andamento</span>;
      case 'completed': return <span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded text-xs flex items-center gap-1"><CheckCircle size={12}/> Concluído</span>;
      case 'cancelled': return <span className="bg-rose-100 text-rose-600 px-2 py-1 rounded text-xs flex items-center gap-1"><X size={12}/> Cancelado</span>;
    }
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-projects, #printable-projects * { visibility: visible; }
          #printable-projects {
            position: absolute;
            left: 0; top: 0; width: 100%;
            background: white; padding: 40px;
          }
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Projetos & Iniciativas</h2>
          <p className="text-slate-500">Acompanhamento de metas e atividades da associação</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => window.print()}
                className="bg-white text-blue-900 border border-blue-200 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-sm"
            >
                <Printer size={20} />
                Imprimir Tudo
            </button>
            <button 
                onClick={() => { if(!saving) setShowForm(!showForm); }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md disabled:opacity-50"
                disabled={saving}
            >
                {showForm ? <X size={20} /> : <Plus size={20} />}
                {showForm ? 'Fechar' : 'Novo Projeto'}
            </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 animate-in fade-in zoom-in">
          <h3 className="text-lg font-bold text-blue-900 mb-6 border-b pb-2">Registrar Novo Projeto</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">1. Título do Projeto</label>
              <input 
                type="text" required
                placeholder="Ex: Reforma da Sede, Campanha de Natal..."
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 disabled:bg-slate-100"
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                disabled={saving}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">2. Descrição / Resumo</label>
              <textarea 
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 disabled:bg-slate-100"
                rows={3}
                placeholder="Breve resumo sobre o que se trata o projeto..."
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                disabled={saving}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">3. Objetivo</label>
              <textarea 
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 disabled:bg-slate-100"
                rows={2}
                placeholder="Qual o principal objetivo a ser alcançado?"
                value={formData.objective} onChange={e => setFormData({...formData, objective: e.target.value})}
                disabled={saving}
              />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Autor / Responsável</label>
                <select 
                    className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 disabled:bg-slate-100"
                    value={formData.authorId}
                    onChange={e => setFormData({...formData, authorId: e.target.value})}
                    disabled={saving}
                >
                    <option value="">Selecione um membro...</option>
                    {boardMembers.map(member => (
                        <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
                    ))}
                </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Público alvo</label>
              <input 
                type="text" 
                placeholder="Ex: Associados, Comunidade Local..."
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 disabled:bg-slate-100"
                value={formData.targetAudience} onChange={e => setFormData({...formData, targetAudience: e.target.value})}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Recursos necessários</label>
              <input 
                type="text" 
                placeholder="Materiais, Voluntários, Equipamentos..."
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 disabled:bg-slate-100"
                value={formData.resources} onChange={e => setFormData({...formData, resources: e.target.value})}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Orçamento (R$)</label>
              <input 
                type="number" step="0.01"
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 disabled:bg-slate-100"
                value={formData.financialImpact} onChange={e => setFormData({...formData, financialImpact: e.target.value})}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Data de execução</label>
              <input 
                type="date" required
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 disabled:bg-slate-100"
                value={formData.executionDate} onChange={e => setFormData({...formData, executionDate: e.target.value})}
                disabled={saving}
              />
            </div>
             <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Local de execução</label>
              <input 
                type="text" 
                placeholder="Onde o projeto será realizado?"
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 disabled:bg-slate-100"
                value={formData.executionLocation} onChange={e => setFormData({...formData, executionLocation: e.target.value})}
                disabled={saving}
              />
            </div>
             <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Status do Projeto</label>
              <select 
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 disabled:bg-slate-100"
                value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}
                disabled={saving}
              >
                <option value="planned">Planejado</option>
                <option value="ongoing">Em Andamento</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            <div className="col-span-2 flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="px-6 py-3 text-slate-600 font-bold disabled:opacity-50"
                disabled={saving}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="bg-blue-600 text-white py-3 px-8 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2 disabled:opacity-70"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Salvando...
                  </>
                ) : 'Registrar Projeto'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.length === 0 && !showForm && (
            <div className="col-span-2 py-20 text-center bg-white rounded-2xl border border-dashed border-blue-100">
                <Briefcase size={48} className="mx-auto text-blue-100 mb-4" />
                <p className="text-slate-400">Nenhum projeto registrado.</p>
            </div>
        )}
        {projects.map(project => {
          return (
            <div key={project.id} className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50 hover:shadow-md transition-all relative group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <Briefcase size={24} />
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(project.status)}
                  <button onClick={() => { if(window.confirm("Deseja excluir este projeto?")) deleteProject(project.id); }} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                    <X size={18} />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">{project.title}</h3>
              <p className="text-sm text-slate-600 mb-4 line-clamp-3">{project.description || 'Sem descrição.'}</p>
              
              <div className="space-y-2 mb-6">
                  <div className="flex items-start gap-2 text-xs text-slate-500">
                      <Target size={14} className="mt-0.5 text-blue-400" />
                      <span className="line-clamp-1"><strong>Objetivo:</strong> {project.objective}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-500">
                      <User size={14} className="mt-0.5 text-blue-400" />
                      <span><strong>Autor:</strong> {getAuthorName(project.authorId)}</span>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-50">
                <div className="space-y-1">
                   <p className="text-[10px] uppercase font-bold text-slate-400">Execução</p>
                   <div className="flex items-center gap-2 text-xs text-slate-700">
                      <Calendar size={14} className="text-blue-500"/>
                      <span>{new Date(project.executionDate).toLocaleDateString()}</span>
                   </div>
                   <div className="flex items-center gap-2 text-xs text-slate-700">
                      <MapPin size={14} className="text-blue-500"/>
                      <span className="truncate">{project.executionLocation || 'Local não definido'}</span>
                   </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Orçamento</p>
                  <div className="flex items-center justify-end gap-1 font-bold text-blue-700 text-base">
                      <DollarSign size={16} />
                      <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.financialImpact)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Printable Area */}
      <div id="printable-projects" className="hidden">
        <div className="text-center border-b-2 border-blue-900 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-blue-900 uppercase tracking-widest">{associationName}</h1>
            <h2 className="text-xl text-slate-600 mt-2">Relatório Estratégico de Projetos</h2>
            <p className="text-sm mt-1">Gerado em: {new Date().toLocaleString()}</p>
        </div>

        <div className="space-y-10">
            {projects.map((p, idx) => {
                return (
                    <div key={idx} className="border-b border-slate-200 pb-10 last:border-0">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-blue-900 underline underline-offset-4">{p.title}</h3>
                            <span className="font-bold uppercase text-xs border-2 border-slate-900 px-3 py-1">{getStatusLabel(p.status)}</span>
                        </div>

                        <div className="grid grid-cols-1 gap-6 text-sm">
                            <div className="bg-slate-50 p-4 rounded border">
                                <h4 className="font-bold text-blue-800 uppercase text-xs mb-2">1. Descrição/Resumo</h4>
                                <p className="text-slate-800 leading-relaxed">{p.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border rounded">
                                    <h4 className="font-bold text-blue-800 uppercase text-xs mb-2">2. Objetivo</h4>
                                    <p className="text-slate-800">{p.objective}</p>
                                </div>
                                <div className="p-4 border rounded">
                                    <h4 className="font-bold text-blue-800 uppercase text-xs mb-2">3. Responsável / Autor</h4>
                                    <p className="text-slate-800 font-bold">{getAuthorName(p.authorId)}</p>
                                </div>
                            </div>

                            <div className="p-4 border rounded">
                                <h4 className="font-bold text-blue-800 uppercase text-xs mb-2">4. Recursos Necessários</h4>
                                <p className="text-slate-800">{p.resources}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                                    <h4 className="font-bold text-blue-800 uppercase text-xs mb-2">5. Repercussão Financeira</h4>
                                    <p className="text-lg font-bold text-blue-900">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.financialImpact)}
                                    </p>
                                </div>
                                <div className="p-4 border rounded">
                                    <h4 className="font-bold text-blue-800 uppercase text-xs mb-2">6. Data de Execução</h4>
                                    <p className="text-slate-800 font-bold">{new Date(p.executionDate).toLocaleDateString()}</p>
                                </div>
                                <div className="p-4 border rounded">
                                    <h4 className="font-bold text-blue-800 uppercase text-xs mb-2">7. Local de Execução</h4>
                                    <p className="text-slate-800">{p.executionLocation}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-20 grid grid-cols-2 gap-20">
                            <div className="text-center border-t border-slate-400 pt-4">
                                <p className="font-bold">Coordenação do Projeto</p>
                            </div>
                            <div className="text-center border-t border-slate-400 pt-4">
                                <p className="font-bold">Tesouraria / Diretoria</p>
                                <p className="text-xs text-slate-500 uppercase tracking-widest">{associationName}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
        
        <div className="mt-8 text-center text-[10px] text-slate-300 italic">
            Gerado via Gestão Integrada Pro em {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default ProjectManager;
