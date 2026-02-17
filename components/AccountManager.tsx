import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Account } from '../types';
import { Plus, Wallet, Landmark, PiggyBank, Trash2, Pencil, X } from 'lucide-react';

const AccountManager: React.FC = () => {
  const { accounts, addAccount, updateAccount, deleteAccount, transactions } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank' as const,
    initialBalance: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      updateAccount({
        id: editingId,
        name: formData.name,
        type: formData.type,
        initialBalance: parseFloat(formData.initialBalance) || 0,
        description: formData.description
      });
    } else {
      addAccount({
        name: formData.name,
        type: formData.type,
        initialBalance: parseFloat(formData.initialBalance) || 0,
        description: formData.description
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'bank', initialBalance: '', description: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (account: Account) => {
    setEditingId(account.id);
    setFormData({
      name: account.name,
      type: account.type,
      initialBalance: account.initialBalance.toString(),
      description: account.description || ''
    });
    setShowForm(true);
  };

  const calculateCurrentBalance = (accountId: string, initialBalance: number) => {
    const accountTransactions = transactions.filter(t => t.accountId === accountId && t.status === 'completed');
    const total = accountTransactions.reduce((acc, t) => {
        return acc + (t.type === 'income' ? t.amount : -t.amount);
    }, 0);
    return initialBalance + total;
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const getIcon = (type: Account['type']) => {
    switch(type) {
        case 'bank': return <Landmark size={24} className="text-blue-600" />;
        case 'cash': return <Wallet size={24} className="text-emerald-600" />;
        case 'savings': return <PiggyBank size={24} className="text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Cadastro de Caixas & Contas</h2>
           <p className="text-slate-500">Gerencie contas bancárias e caixas físicos</p>
        </div>
        <button 
          onClick={() => { if(showForm && !editingId) setShowForm(false); else { resetForm(); setShowForm(true); } }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          {showForm && !editingId ? <X size={20} /> : <Plus size={20} />}
          {showForm && !editingId ? 'Fechar' : 'Nova Conta'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {editingId ? 'Editar Conta/Caixa' : 'Cadastrar Nova Conta/Caixa'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Conta</label>
              <input 
                type="text" 
                required
                placeholder="Ex: Banco do Brasil, Caixinha do Café..."
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select 
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as any})}
              >
                <option value="bank">Conta Bancária</option>
                <option value="cash">Caixa Físico (Dinheiro)</option>
                <option value="savings">Aplicação/Poupança</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Saldo Inicial</label>
              <input 
                type="number" 
                step="0.01"
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.initialBalance}
                onChange={e => setFormData({...formData, initialBalance: e.target.value})}
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
               <button 
                type="button" 
                onClick={resetForm}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              >
                {editingId ? 'Atualizar Conta' : 'Salvar Conta'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(account => {
            const currentBalance = calculateCurrentBalance(account.id, account.initialBalance);
            return (
                <div key={account.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                {getIcon(account.type)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">{account.name}</h3>
                                <p className="text-xs text-slate-500">{account.description || 'Sem descrição'}</p>
                            </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleEdit(account)}
                                className="text-slate-400 hover:text-emerald-600 p-1"
                                title="Editar Conta"
                            >
                                <Pencil size={18} />
                            </button>
                            <button 
                                onClick={() => { if(window.confirm('Excluir esta conta?')) deleteAccount(account.id); }}
                                className="text-slate-400 hover:text-rose-500 p-1"
                                title="Excluir Conta"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Saldo Inicial:</span>
                            <span className="font-medium text-slate-700">{formatCurrency(account.initialBalance)}</span>
                        </div>
                        <div className="pt-3 border-t border-slate-100">
                             <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Saldo Atual</p>
                             <p className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                                {formatCurrency(currentBalance)}
                             </p>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default AccountManager;
