
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Transaction, TransactionType, PaymentMethod } from '../types';
import { Plus, Search, CheckCircle, Clock, FileSpreadsheet, ChevronDown, ChevronUp, CreditCard, StickyNote, Trash2, Pencil, Upload, Paperclip, X, Tag, Landmark } from 'lucide-react';

const TransactionManager: React.FC = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, categories, accounts, addCategory } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterAccountId, setFilterAccountId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as TransactionType,
    category: '',
    accountId: '',
    status: 'completed' as const,
    paymentMethod: 'bank_transfer' as PaymentMethod,
    notes: '',
    attachment: null as File | null,
    attachmentName: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        attachment: e.target.files[0],
        attachmentName: e.target.files[0].name
      });
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      category: '',
      accountId: '',
      status: 'completed',
      paymentMethod: 'bank_transfer',
      notes: '',
      attachment: null,
      attachmentName: ''
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (e: React.MouseEvent, t: Transaction) => {
    e.stopPropagation();
    setEditingId(t.id);
    setFormData({
      description: t.description,
      amount: t.amount.toString(),
      date: t.date,
      type: t.type,
      category: t.category,
      accountId: t.accountId,
      status: t.status as any,
      paymentMethod: t.paymentMethod,
      notes: t.notes || '',
      attachment: null,
      attachmentName: t.attachment || ''
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.category || !formData.accountId) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    if (editingId) {
      updateTransaction({
        id: editingId,
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
        type: formData.type,
        category: formData.category,
        accountId: formData.accountId,
        status: formData.status,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        attachment: formData.attachmentName,
        reconciled: transactions.find(t => t.id === editingId)?.reconciled || false
      });
    } else {
      addTransaction({
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
        type: formData.type,
        category: formData.category,
        accountId: formData.accountId,
        status: formData.status,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        attachment: formData.attachmentName,
        reconciled: false
      });
    }

    resetForm();
  };

  const handleAddCategory = () => {
    if (!newCategoryName) return;
    addCategory({
        name: newCategoryName,
        type: formData.type
    });
    setFormData({...formData, category: newCategoryName});
    setNewCategoryName('');
    setShowCategoryForm(false);
  };

  const handleReconcile = (e: React.MouseEvent, t: Transaction) => {
    e.stopPropagation();
    updateTransaction({ ...t, reconciled: !t.reconciled });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if(window.confirm('Tem certeza que deseja excluir esta transação?')) {
          deleteTransaction(id);
      }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesAccount = filterAccountId === 'all' || t.accountId === filterAccountId;
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch && matchesAccount;
  });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const getPaymentMethodLabel = (method: PaymentMethod) => {
      const labels: Record<PaymentMethod, string> = {
          bank_transfer: 'Transferência Bancária',
          credit_card: 'Cartão de Crédito',
          cash: 'Dinheiro',
          check: 'Cheque',
          pix: 'PIX'
      };
      return labels[method] || method;
  };

  const getAccountName = (id: string) => {
      return accounts.find(a => a.id === id)?.name || 'Conta Excluída';
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Fluxo de Caixa</h2>
           <p className="text-slate-500 dark:text-slate-400">Gestão de Entradas e Saídas</p>
        </div>
        <button 
          onClick={() => { if(showForm && !editingId) setShowForm(false); else { resetForm(); setShowForm(true); } }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          {showForm && !editingId ? <X size={20} /> : <Plus size={20} />}
          {showForm && !editingId ? 'Fechar' : 'Nova Transação'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{editingId ? 'Editar Transação' : 'Adicionar Transação'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
              <input 
                type="text" 
                required
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor (R$)</label>
              <input 
                type="number" 
                step="0.01"
                required
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data</label>
              <input 
                type="date" 
                required
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
              <select 
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as TransactionType, category: ''})}
              >
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex justify-between">
                Categoria
                <button 
                    type="button" 
                    onClick={() => setShowCategoryForm(!showCategoryForm)}
                    className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-xs"
                >
                    <Plus size={12} /> Nova
                </button>
              </label>
              {showCategoryForm ? (
                <div className="flex gap-1">
                    <input 
                        type="text" 
                        className="flex-1 border border-emerald-300 rounded-lg p-1.5 text-sm dark:bg-slate-900 dark:text-white outline-none"
                        placeholder="Nome da categoria"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                    />
                    <button type="button" onClick={handleAddCategory} className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-700"><Plus size={16} /></button>
                    <button type="button" onClick={() => setShowCategoryForm(false)} className="bg-slate-200 text-slate-600 p-1 rounded hover:bg-slate-300"><X size={16} /></button>
                </div>
              ) : (
                <select 
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    required
                >
                    <option value="">Selecione...</option>
                    {categories.filter(c => c.type === formData.type).map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                </select>
              )}
            </div>
            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Conta / Caixa</label>
                <select 
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.accountId}
                    onChange={e => setFormData({...formData, accountId: e.target.value})}
                    required
                >
                    <option value="">Selecione o Caixa...</option>
                    {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select 
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="completed">Concluído</option>
                <option value="pending">Pendente</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Meio de Pagamento</label>
              <select 
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.paymentMethod}
                onChange={e => setFormData({...formData, paymentMethod: e.target.value as any})}
              >
                <option value="bank_transfer">Transf. Bancária</option>
                <option value="pix">PIX</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="check">Cheque</option>
                <option value="cash">Dinheiro</option>
              </select>
            </div>
             <div className="col-span-2 lg:col-span-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Anexar Documento</label>
                <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-slate-300 dark:border-slate-700 w-full">
                        <Upload size={18} />
                        <span className="truncate">{formData.attachmentName || "Escolher arquivo (PDF, Imagem)..."}</span>
                        <input type="file" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>
            </div>
             <div className="col-span-2 lg:col-span-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas (Opcional)</label>
              <input 
                type="text" 
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Detalhes adicionais..."
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-3 mt-4">
              <button 
                type="button" 
                onClick={resetForm}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              >
                {editingId ? 'Atualizar Lançamento' : 'Salvar Lançamento'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="relative col-span-1 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar descrição..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 col-span-1">
            <select 
                className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                value={filterAccountId}
                onChange={(e) => setFilterAccountId(e.target.value)}
            >
                <option value="all">Todas as Contas</option>
                {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
            </select>
        </div>
        <div className="flex gap-2 col-span-1 lg:col-span-2 justify-end">
            <button 
                onClick={() => setFilterType('all')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'all' ? 'bg-slate-800 dark:bg-slate-100 dark:text-slate-900 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
            >
                Tudo
            </button>
            <button 
                onClick={() => setFilterType('income')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'income' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'}`}
            >
                Entradas
            </button>
            <button 
                onClick={() => setFilterType('expense')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'expense' ? 'bg-rose-600 text-white' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100'}`}
            >
                Saídas
            </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 w-12"></th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Data</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Descrição</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Caixa/Conta</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Categoria</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Valor</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredTransactions.map(t => (
                <React.Fragment key={t.id}>
                    <tr 
                        onClick={() => toggleExpand(t.id)}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${expandedId === t.id ? 'bg-slate-50 dark:bg-slate-700/30' : ''}`}
                    >
                    <td className="px-6 py-4 text-slate-400">
                        {expandedId === t.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{t.date}</td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        {t.attachment && <Paperclip size={14} className="text-slate-400" />}
                        {t.description}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{getAccountName(t.accountId)}</td>
                    <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300">
                        {t.category}
                        </span>
                    </td>
                    <td className={`px-6 py-4 font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td className="px-6 py-4">
                        {t.status === 'completed' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded text-xs">
                                <CheckCircle size={12} /> Pago
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded text-xs">
                                <Clock size={12} /> Pendente
                            </span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={(e) => handleReconcile(e, t)}
                                title={t.reconciled ? "Desconciliar" : "Conciliar no Banco"}
                                className={`transition-colors p-1 ${t.reconciled ? 'text-blue-600' : 'text-slate-300 hover:text-blue-500'}`}
                            >
                                <FileSpreadsheet size={20} />
                            </button>
                            <button 
                                onClick={(e) => handleEdit(e, t)} 
                                className="text-slate-400 hover:text-emerald-600 p-1"
                                title="Editar"
                            >
                                <Pencil size={18} />
                            </button>
                            <button 
                                onClick={(e) => handleDelete(e, t.id)} 
                                className="text-slate-400 hover:text-rose-500 p-1"
                                title="Excluir"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </td>
                    </tr>
                    {expandedId === t.id && (
                        <tr className="bg-slate-50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700">
                            <td colSpan={8} className="px-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                                    <div className="space-y-4">
                                        <div>
                                            <span className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                                <CreditCard size={14} /> Método de Pagamento
                                            </span>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 pl-6">
                                                {getPaymentMethodLabel(t.paymentMethod)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block pl-6">ID da Transação</span>
                                            <p className="text-xs font-mono text-slate-400 pl-6">{t.id}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            <StickyNote size={14} /> Notas & Observações
                                        </span>
                                        <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 ml-6">
                                            {t.notes || <span className="text-slate-400 italic">Nenhuma observação registrada.</span>}
                                        </div>
                                    </div>
                                    <div>
                                         <span className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            <Paperclip size={14} /> Anexos
                                        </span>
                                        <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 ml-6 flex items-center justify-between">
                                            {t.attachment ? (
                                                <>
                                                    <span className="truncate max-w-[150px]">{t.attachment}</span>
                                                    <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded">Arquivo</span>
                                                </>
                                            ) : (
                                                <span className="text-slate-400 italic">Nenhum documento anexado.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                </React.Fragment>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                        Nenhuma transação encontrada para os filtros selecionados.
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

export default TransactionManager;
