
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { BoardMember } from '../types';
import { Users, Plus, Trash2, Mail, Phone, Calendar, Shield, X, User, Printer } from 'lucide-react';

const BOARD_ROLES = [
  'Presidente', 'Vice-Presidente', 'Secretário (a)', 'Ouvidor (a)', 'Tesoureiro (a)',
  'Diretor (a) de Esportes', 'Diretor (a) de Cultura e Ensino/Aprendizagem',
  'Diretor (a) de Imprensa e Orador', 'Diretor (a) de Saúde e Meio Ambiente',
  'Diretor (a) Social', '1o Suplente', '2o Suplente', '3° Suplente', '4° Suplente', '5° Suplente'
];

const BoardManager: React.FC = () => {
  const { boardMembers, addBoardMember, deleteBoardMember, associationName } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', role: BOARD_ROLES[0], termStart: '', termEnd: '', phone: '', email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBoardMember(formData);
    setFormData({ name: '', role: BOARD_ROLES[0], termStart: '', termEnd: '', phone: '', email: '' });
    setShowForm(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-board, #printable-board * { visibility: visible; }
          #printable-board {
            position: absolute;
            left: 0; top: 0; width: 100%;
            background: white; padding: 40px;
          }
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Diretoria Executiva</h2>
          <p className="text-slate-500 dark:text-slate-400">Membros e cargos conforme Art. 18 do Estatuto</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handlePrint}
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-200 transition-colors"
            >
                <Printer size={20} />
                Imprimir
            </button>
            <button 
                onClick={() => setShowForm(!showForm)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
                {showForm ? <X size={20} /> : <Plus size={20} />}
                {showForm ? 'Fechar' : 'Adicionar Membro'}
            </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border dark:border-slate-700 animate-in fade-in zoom-in">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
              <input 
                type="text" required
                className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cargo Estatutário</label>
              <select 
                className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
              >
                {BOARD_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Início do Mandato</label>
              <input 
                type="date" required
                className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                value={formData.termStart} onChange={e => setFormData({...formData, termStart: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fim do Mandato</label>
              <input 
                type="date" required
                className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                value={formData.termEnd} onChange={e => setFormData({...formData, termEnd: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone/WhatsApp</label>
              <input 
                type="text"
                className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="(00) 00000-0000"
              />
            </div>
            <button type="submit" className="md:col-span-2 lg:col-span-3 bg-slate-800 text-white py-3 rounded-lg font-bold mt-2 hover:bg-slate-700 transition-colors">
              Registrar Membro da Diretoria
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BOARD_ROLES.map(role => {
          const member = boardMembers.find(m => m.role === role);
          return (
            <div key={role} className={`p-6 rounded-2xl shadow-sm border transition-all ${member ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700' : 'bg-slate-50 dark:bg-slate-900 border-dashed border-slate-200 dark:border-slate-800'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <Shield size={24} />
                </div>
                {member && (
                  <button onClick={() => deleteBoardMember(member.id)} className="text-slate-400 hover:text-rose-500">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{role}</h3>
              {member ? (
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
              ) : (
                <p className="mt-2 text-sm text-slate-400 italic">Cargo vago</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Printable Area */}
      <div id="printable-board" className="hidden">
        <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
            <h1 className="text-3xl font-bold uppercase">{associationName}</h1>
            <h2 className="text-xl text-slate-600 mt-2">Quadro Geral da Diretoria Executiva</h2>
            <p className="text-sm mt-1">Gerado em: {new Date().toLocaleString()}</p>
        </div>
        
        <div className="space-y-4">
            {BOARD_ROLES.map((role, idx) => {
                const member = boardMembers.find(m => m.role === role);
                return (
                    <div key={idx} className="flex border-b border-slate-200 py-3">
                        <div className="w-1/3 font-bold text-slate-700">{role}</div>
                        <div className="w-2/3">{member ? member.name : 'VAGO'}</div>
                    </div>
                );
            })}
        </div>

        <div className="mt-24 grid grid-cols-2 gap-20">
            <div className="text-center border-t border-slate-400 pt-4">
                <p className="font-bold">Presidente</p>
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
