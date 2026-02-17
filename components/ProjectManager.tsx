
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Project, ProjectStatus } from '../types';
import { Briefcase, Plus, X, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, Printer } from 'lucide-react';

const ProjectManager: React.FC = () => {
  const { projects, addProject, updateProject, deleteProject, associationName } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', status: 'planned' as ProjectStatus, startDate: '', budget: '0'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProject({
      ...formData,
      budget: parseFloat(formData.budget)
    });
    setFormData({ title: '', description: '', status: 'planned', startDate: '', budget: '0' });
    setShowForm(false);
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
      case 'planned': return <span className="bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 px-2 py-1 rounded text-xs flex items-center gap-1"><Clock size={12}/> Planejado</span>;
      case 'ongoing': return <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded text-xs flex items-center gap-1"><AlertCircle size={12}/> Em Andamento</span>;
      case 'completed': return <span className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded text-xs flex items-center gap-1"><CheckCircle size={12}/> Concluído</span>;
      case 'cancelled': return <span className="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 px-2 py-1 rounded text-xs flex items-center gap-1"><X size={12}/> Cancelado</span>;
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Projetos & Iniciativas</h2>
          <p className="text-slate-500 dark:text-slate-400">Acompanhamento de metas e atividades da associação</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => window.print()}
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-200 transition-colors"
            >
                <Printer size={20} />
                Imprimir Tudo
            </button>
            <button 
                onClick={() => setShowForm(!showForm)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
                {showForm ? <X size={20} /> : <Plus size={20} />}
                Novo Projeto
            </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border dark:border-slate-700 animate-in fade-in zoom-in">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título do Projeto</label>
              <input 
                type="text" required
                className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição / Objetivo</label>
              <textarea 
                className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                rows={3}
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data de Início</label>
              <input 
                type="date" required
                className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select 
                className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="planned">Planejado</option>
                <option value="ongoing">Em Andamento</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Orçamento Previsto (R$)</label>
              <input 
                type="number" step="0.01"
                className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})}
              />
            </div>
            <button type="submit" className="md:col-span-2 bg-slate-800 text-white py-3 rounded-lg font-bold mt-2 hover:bg-slate-700 transition-colors">
              Registrar Projeto
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                <Briefcase size={24} />
              </div>
              <div className="flex gap-2">
                {getStatusBadge(project.status)}
                <button onClick={() => deleteProject(project.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{project.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">{project.description || 'Sem descrição.'}</p>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-slate-700">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Calendar size={14} />
                <span>Início: {new Date(project.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                <DollarSign size={14} />
                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.budget)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Printable Area */}
      <div id="printable-projects" className="hidden">
        <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
            <h1 className="text-3xl font-bold uppercase">{associationName}</h1>
            <h2 className="text-xl text-slate-600 mt-2">Relatório Geral de Projetos e Iniciativas</h2>
            <p className="text-sm mt-1">Gerado em: {new Date().toLocaleString()}</p>
        </div>

        <div className="space-y-8">
            {projects.map((p, idx) => (
                <div key={idx} className="border border-slate-300 p-6 rounded">
                    <div className="flex justify-between mb-2">
                        <h3 className="text-xl font-bold">{p.title}</h3>
                        <span className="font-semibold uppercase text-sm border px-2 py-1">{getStatusLabel(p.status)}</span>
                    </div>
                    <p className="text-slate-700 mb-4">{p.description}</p>
                    <div className="grid grid-cols-2 text-sm">
                        <p><strong>Início:</strong> {new Date(p.startDate).toLocaleDateString()}</p>
                        <p><strong>Orçamento:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.budget)}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectManager;
