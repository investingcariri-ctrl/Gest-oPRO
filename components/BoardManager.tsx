
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { BoardMember } from '../types';
import { Users, Plus, Trash2, Mail, Phone, Calendar, Shield, X, User, Printer, Loader2 } from 'lucide-react';

const BoardManager: React.FC = () => {
  const { boardMembers, addBoardMember, deleteBoardMember, associationName } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '', role: '', termStart: '', termEnd: '', phone: '', email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await addBoardMember(formData);
      setFormData({ name: '', role: '', termStart: '', termEnd: '', phone: '', email: '' });
      setShowForm(false);
      alert("Membro registrado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao registrar membro:", error);
      alert(`Erro ao registrar membro: ${error.message || "Tente novamente."}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja realmente excluir este membro da diretoria?")) {
      try {
        await deleteBoardMember(id);
      } catch (error: any) {
        alert(`Erro ao excluir: ${error.message}`);
      }
    }
  }

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          #printable-board { display: block !important; visibility: visible !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Diretoria Executiva</h2>
          <p className="text-slate-500 dark:text-slate-400">Cadastro de membros e funções administrativas</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handlePrint}
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-200 transition-colors"
                disabled={saving}
            >
                <Printer size={20} />
                Imprimir
            </button>
            <button 
                onClick={() => { if(!saving) setShowForm(!showForm); }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                disabled={saving}
            >
                {showForm ? <X size={20} /> : <Plus size={20} />}
                {showForm ? 'Fechar' : 'Adicionar Membro'}
            </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border dark:border-slate-700 animate-in fade-in zoom-in no-print">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
              <input 
                type="text" required
                disabled={saving}
                className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cargo ou Função</label>
              <input 
                type="text" required
                disabled={saving}
                placeholder="Ex: Presidente, Coordenador, etc."
                className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Início do Mandato</label>
              <input 
                type="date" required
                disabled={saving}
                className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white disabled:bg-slate-100"
                value={formData.termStart} onChange={e => setFormData({...formData, termStart: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fim do Mandato</label>
              <input 
                type="date" required
                disabled={saving}
                className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white disabled:bg-slate-100"
                value={formData.termEnd} onChange={e => setFormData({...formData, termEnd: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone/WhatsApp</label>
              <input 
                type="text"
                disabled={saving}
                className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white disabled:bg-slate-100"
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail de Contato</label>
              <input 
                type="email"
                disabled={saving}
                className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white disabled:bg-slate-100"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="exemplo@email.com"
              />
            </div>
            <button 
              type="submit" 
              disabled={saving}
              className="md:col-span-2 lg:col-span-3 bg-slate-800 text-white py-3 rounded-lg font-bold mt-2 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Registrando...
                </>
              ) : 'Registrar Membro'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
        {boardMembers.length === 0 && !showForm && (
            <div className="col-span-full py-20 text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">Nenhum membro cadastrado.</p>
            </div>
        )}
        {boardMembers.map(member => (
            <div key={member.id} className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <Shield size={24} />
                </div>
                <button 
                  onClick={() => handleDelete(member.id)} 
                  className="text-slate-400 hover:text-rose-500 p-2"
                  disabled={saving}
                >
                    <Trash2 size={18} />
                </button>
              </div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{member.role}</h3>
              <div className="mt-2 space-y-3">
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{member.name}</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Mail size={14} /> {member.email || 'Não informado'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Phone size={14} /> {member.phone || 'Não informado'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Calendar size={14} /> 
                      <span className="truncate">
                        {new Date(member.termStart).toLocaleDateString()} - {new Date(member.termEnd).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
              </div>
            </div>
        ))}
      </div>

      {/* Printable Area */}
      <div id="printable-board" className="hidden print:block">
        <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
            <h1 className="text-3xl font-bold uppercase">{associationName}</h1>
            <h2 className="text-xl text-slate-600 mt-2">Relatório de Diretoria e Membros</h2>
            <p className="text-sm mt-1">Gerado em: {new Date().toLocaleString()}</p>
        </div>
        
        <div className="space-y-4">
            {boardMembers.map((member, idx) => (
                <div key={idx} className="flex border-b border-slate-200 py-4">
                    <div className="w-1/3 font-bold text-slate-700">{member.role}</div>
                    <div className="w-2/3">
                        <p className="font-bold">{member.name}</p>
                        <p className="text-sm text-slate-500">
                            Período: {new Date(member.termStart).toLocaleDateString()} a {new Date(member.termEnd).toLocaleDateString()}
                        </p>
                        {member.email && <p className="text-sm text-slate-500">E-mail: {member.email}</p>}
                        {member.phone && <p className="text-sm text-slate-500">Tel: {member.phone}</p>}
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-24 grid grid-cols-2 gap-20">
            <div className="text-center border-t border-slate-400 pt-4">
                <p className="font-bold">Presidente / Responsável</p>
            </div>
            <div className="text-center border-t border-slate-400 pt-4">
                <p className="font-bold">Secretário(a)</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BoardManager;
