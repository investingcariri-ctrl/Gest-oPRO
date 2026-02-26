
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { FinancialCommitment, CommitmentStatus } from '../types';
import { Plus, Search, Filter, Calendar, User, DollarSign, Tag, CheckCircle, Clock, XCircle, Trash2, Edit2 } from 'lucide-react';

const FinancialCommitments: React.FC = () => {
  const { commitments, boardMembers, accounts, addCommitment, updateCommitment, deleteCommitment } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('Mensalidade');
  const [status, setStatus] = useState<CommitmentStatus>('pending');
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const resetForm = () => {
    setSelectedMembers([]);
    setReference('');
    setAmount('');
    setDueDate(new Date().toISOString().split('T')[0]);
    setType('Mensalidade');
    setStatus('pending');
    setAccountId('');
    setNotes('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (selectedMembers.length === 0 && !editingId) {
      alert('Selecione pelo menos um membro.');
      return;
    }
    if (!amount || !dueDate || !accountId) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    if (editingId) {
      await updateCommitment({
        id: editingId,
        memberId: selectedMembers[0],
        reference,
        amount: Number(amount),
        dueDate,
        type,
        status,
        accountId,
        notes
      });
    } else {
      // Create individual commitments for each selected member
      for (const memberId of selectedMembers) {
        await addCommitment({
          memberId,
          reference,
          amount: Number(amount),
          dueDate,
          type,
          status,
          accountId,
          notes
        });
      }
    }
    resetForm();
  };

  const handleEdit = (c: FinancialCommitment) => {
    setEditingId(c.id);
    setSelectedMembers([c.memberId]);
    setReference(c.reference);
    setAmount(c.amount.toString());
    setDueDate(c.dueDate);
    setType(c.type);
    setStatus(c.status);
    setAccountId(c.accountId);
    setNotes(c.notes || '');
    setIsAdding(true);
  };

  const filteredCommitments = commitments.filter(c => {
    const member = boardMembers.find(m => m.id === c.memberId);
    const matchesSearch = member?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: CommitmentStatus) => {
    switch (status) {
      case 'paid':
        return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Pago</span>;
      case 'pending':
        return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12}/> Pendente</span>;
      case 'cancelled':
        return <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12}/> Cancelado</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Compromissos Financeiros</h2>
          <p className="text-slate-500 text-sm">Controle de mensalidades e obrigações de membros</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md font-medium"
          >
            <Plus size={20} /> Adicionar Compromisso
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-50 animate-in slide-in-from-top duration-300">
          <h3 className="text-lg font-bold text-blue-900 mb-6">{editingId ? 'Editar Compromisso' : 'Adicionar Compromisso'}</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Selecione o(s) Membro(s)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-40 overflow-y-auto p-3 border border-slate-100 rounded-lg bg-slate-50">
                {boardMembers.map(member => (
                  <label key={member.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={selectedMembers.includes(member.id)}
                      onChange={(e) => {
                        if (editingId) {
                          setSelectedMembers([member.id]);
                        } else {
                          if (e.target.checked) setSelectedMembers([...selectedMembers, member.id]);
                          else setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-slate-800">{member.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase">{member.role}</p>
                    </div>
                  </label>
                ))}
              </div>
              {!editingId && <p className="text-[10px] text-slate-400 mt-1 italic">* Se selecionar múltiplos membros, será criado um compromisso individual para cada um.</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Referência</label>
                <input 
                  type="text" 
                  placeholder="Ex: REF-2024-01"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Vencimento</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">Tipo</label>
                  <button className="text-[10px] text-blue-600 font-bold hover:underline">+ Novo</button>
                </div>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Mensalidade">Mensalidade</option>
                  <option value="Doação">Doação</option>
                  <option value="Taxa Evento">Taxa Evento</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CommitmentStatus)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Conta para Crédito</label>
                <select 
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Selecione a Conta...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notas & Observações</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações adicionais sobre este compromisso..."
                className="w-full border border-slate-200 rounded-lg p-2 h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={resetForm}
                className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md font-bold"
              >
                Salvar Compromisso
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-blue-50 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por membro ou referência..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={18} className="text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendentes</option>
              <option value="paid">Pagos</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Membro</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Referência / Tipo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vencimento</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCommitments.map(c => {
                const member = boardMembers.find(m => m.id === c.memberId);
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                          {member?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{member?.name || 'Membro Removido'}</p>
                          <p className="text-[10px] text-slate-400 uppercase">{member?.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700">{c.reference}</p>
                      <p className="text-xs text-slate-400">{c.type}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <Calendar size={14} />
                        {new Date(c.dueDate).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-blue-900 text-sm">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.amount)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(c.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(c)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            if(confirm('Deseja realmente excluir este compromisso?')) deleteCommitment(c.id);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredCommitments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                    Nenhum compromisso encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialCommitments;
