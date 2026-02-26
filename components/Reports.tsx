import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Printer, Calendar, Landmark, FileText, Download, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { CommitmentStatus } from '../types';

const COLORS = ['#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

const Reports: React.FC = () => {
  const { transactions, categories, accounts, commitments, boardMembers } = useFinance();
  const [activeTab, setActiveTab] = useState<'general' | 'commitments'>('general');

  // State for Report Filters
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  
  // Commitment Filter State
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Report Generation Logic
  const reportTransactions = transactions
    .filter(t => {
        const matchesDate = t.date >= dateRange.start && t.date <= dateRange.end;
        const matchesAccount = selectedAccountId === 'all' || t.accountId === selectedAccountId;
        return matchesDate && matchesAccount;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const reportSummary = reportTransactions.reduce((acc, t) => {
    if (t.type === 'income') acc.income += t.amount;
    else acc.expense += t.amount;
    return acc;
  }, { income: 0, expense: 0 });

  // Calculate data for Pie Chart (Expenses by Category)
  const expensesByCategory = categories
    .filter(c => c.type === 'expense')
    .map(c => {
      const total = reportTransactions
        .filter(t => t.category === c.name && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: c.name, value: total };
    })
    .filter(item => item.value > 0);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Data', 'Descricao', 'Categoria', 'Conta', 'Valor', 'Tipo', 'Status'];
    const rows = reportTransactions.map(t => [
        t.date,
        `"${t.description.replace(/"/g, '""')}"`,
        `"${t.category}"`,
        `"${getAccountName(t.accountId)}"`,
        t.amount.toFixed(2),
        t.type === 'income' ? 'Entrada' : 'Saida',
        t.status === 'completed' ? 'Concluido' : 'Pendente'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_tesouraria_${dateRange.start}_a_${dateRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'Todos';

  const reportCommitments = commitments.filter(c => {
    const matchesDate = c.dueDate >= dateRange.start && c.dueDate <= dateRange.end;
    const matchesMember = selectedMemberIds.length === 0 || selectedMemberIds.includes(c.memberId);
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    return matchesDate && matchesMember && matchesStatus;
  });

  const commitmentSummary = reportCommitments.reduce((acc, c) => {
    if (c.status === 'paid') acc.paid += c.amount;
    else if (c.status === 'pending') acc.pending += c.amount;
    return acc;
  }, { paid: 0, pending: 0 });

  const handleExportCommitmentsCSV = () => {
    const headers = ['Membro', 'Referencia', 'Vencimento', 'Valor', 'Status', 'Tipo'];
    const rows = reportCommitments.map(c => {
        const member = boardMembers.find(m => m.id === c.memberId);
        return [
            `"${member?.name || 'N/A'}"`,
            `"${c.reference}"`,
            c.dueDate,
            c.amount.toFixed(2),
            c.status,
            c.type
        ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_compromissos_${dateRange.start}_a_${dateRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Print CSS Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 20px;
            z-index: 9999;
          }
          nav, aside, header, .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="no-print">
         <h2 className="text-2xl font-bold text-blue-900">Relatórios Gerenciais</h2>
         <p className="text-slate-500">Visualização de despesas e exportação de demonstrativos</p>
         
         <div className="flex gap-4 mt-6 border-b border-slate-200">
            <button 
                onClick={() => setActiveTab('general')}
                className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'general' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
                Geral (Fluxo de Caixa)
            </button>
            <button 
                onClick={() => setActiveTab('commitments')}
                className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'commitments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
                Compromissos Financeiros
            </button>
         </div>
      </div>

      {activeTab === 'general' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 no-print animate-in fade-in duration-300">
          {/* Expense Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-50">
              <h3 className="text-lg font-bold text-blue-900 mb-4">Distribuição de Despesas</h3>
              <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                              data={expensesByCategory}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              fill="#3b82f6"
                              paddingAngle={5}
                              dataKey="value"
                          >
                              {expensesByCategory.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                          </Pie>
                          <Tooltip 
                              formatter={(value: number) => formatCurrency(value)}
                              contentStyle={{ backgroundColor: '#1e3a8a', border: 'none', borderRadius: '8px', color: '#fff' }}
                          />
                          <Legend />
                      </PieChart>
                  </ResponsiveContainer>
              </div>
              {expensesByCategory.length === 0 && (
                  <div className="text-center text-slate-400 py-20 text-sm italic">
                      Nenhuma despesa para os filtros selecionados.
                  </div>
              )}
          </div>

          {/* Report Generation Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-50 flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2 mb-2">
                    <FileText size={20} className="text-blue-500"/> 
                    Parâmetros do Relatório
                </h3>
                <p className="text-sm text-slate-500 mb-6">Ajuste o período e as contas para gerar o documento.</p>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                              <Calendar size={14} className="text-blue-500" /> Início
                          </label>
                          <input 
                              type="date" 
                              value={dateRange.start}
                              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                              className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                              <Calendar size={14} className="text-blue-500" /> Fim
                          </label>
                          <input 
                              type="date" 
                              value={dateRange.end}
                              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                              className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                          <Landmark size={14} className="text-blue-500" /> Filtro de Conta
                      </label>
                      <select 
                          className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          value={selectedAccountId}
                          onChange={(e) => setSelectedAccountId(e.target.value)}
                      >
                          <option value="all">Todas as Contas</option>
                          {accounts.map(acc => (
                              <option key={acc.id} value={acc.id}>{acc.name}</option>
                          ))}
                      </select>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-blue-50 grid grid-cols-2 gap-4">
                <button 
                    onClick={handleExportCSV}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold shadow-md"
                >
                    <Download size={18} />
                    Exportar CSV
                </button>
                <button 
                    onClick={handlePrint}
                    className="bg-blue-900 hover:bg-blue-950 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold shadow-md"
                >
                    <Printer size={18} />
                    Imprimir PDF
                </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 no-print animate-in fade-in duration-300">
          {/* Commitment Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-50">
              <h3 className="text-lg font-bold text-blue-900 mb-4">Resumo de Compromissos</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle size={20}/></div>
                    <div>
                      <p className="text-xs text-emerald-600 font-bold uppercase">Total Recebido</p>
                      <p className="text-xl font-bold text-emerald-700">{formatCurrency(commitmentSummary.paid)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Clock size={20}/></div>
                    <div>
                      <p className="text-xs text-amber-600 font-bold uppercase">A Receber (Pendentes)</p>
                      <p className="text-xl font-bold text-amber-700">{formatCurrency(commitmentSummary.pending)}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500 mb-2">Compromissos no período selecionado: <span className="font-bold text-slate-800">{reportCommitments.length}</span></p>
                </div>
              </div>
          </div>

          {/* Commitment Filters Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-50 flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2 mb-2">
                    <Users size={20} className="text-blue-500"/> 
                    Filtros de Compromissos
                </h3>
                <p className="text-sm text-slate-500 mb-6">Selecione os membros e o status para o relatório.</p>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                              <Calendar size={14} className="text-blue-500" /> Início
                          </label>
                          <input 
                              type="date" 
                              value={dateRange.start}
                              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                              className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                              <Calendar size={14} className="text-blue-500" /> Fim
                          </label>
                          <input 
                              type="date" 
                              value={dateRange.end}
                              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                              className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                          <Users size={14} className="text-blue-500" /> Selecionar Membros
                      </label>
                      <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50">
                        {boardMembers.map(member => (
                          <label key={member.id} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={selectedMemberIds.includes(member.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedMemberIds([...selectedMemberIds, member.id]);
                                else setSelectedMemberIds(selectedMemberIds.filter(id => id !== member.id));
                              }}
                              className="rounded text-blue-600"
                            />
                            <span className="text-xs text-slate-700">{member.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                          <Clock size={14} className="text-blue-500" /> Status
                      </label>
                      <select 
                          className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                      >
                          <option value="all">Todos os Status</option>
                          <option value="pending">Pendentes</option>
                          <option value="paid">Pagos</option>
                          <option value="cancelled">Cancelados</option>
                      </select>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-blue-50 grid grid-cols-2 gap-4">
                <button 
                    onClick={handleExportCommitmentsCSV}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold shadow-md"
                >
                    <Download size={18} />
                    Exportar CSV
                </button>
                <button 
                    onClick={handlePrint}
                    className="bg-blue-900 hover:bg-blue-950 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold shadow-md"
                >
                    <Printer size={18} />
                    Imprimir PDF
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Printable Area */}
      <div id="printable-report" className="hidden">
        <div className="text-center mb-8 border-b-2 border-blue-900 pb-4">
            <h1 className="text-3xl font-bold text-blue-900 uppercase tracking-wide">Gestão Integrada Pro</h1>
            <h2 className="text-xl text-slate-700 mt-2">{activeTab === 'general' ? 'Demonstrativo Financeiro' : 'Relatório de Compromissos Financeiros'}</h2>
            <p className="text-slate-500 mt-1 font-medium">
                Período: {formatDate(dateRange.start)} até {formatDate(dateRange.end)}
            </p>
            {activeTab === 'general' && (
              <p className="text-slate-500 font-medium">
                  Conta: {selectedAccountId === 'all' ? 'Todas as Contas' : getAccountName(selectedAccountId)}
              </p>
            )}
        </div>

        {activeTab === 'general' ? (
          <>
            <div className="mb-8">
                <h3 className="text-lg font-bold text-blue-900 mb-4 border-l-4 border-blue-600 pl-3 uppercase">Resumo do Período</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded">
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Total Entradas</p>
                        <p className="text-xl font-bold text-blue-700">{formatCurrency(reportSummary.income)}</p>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-100 rounded">
                        <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Total Saídas</p>
                        <p className="text-xl font-bold text-red-700">{formatCurrency(reportSummary.expense)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Resultado</p>
                        <p className={`text-xl font-bold ${reportSummary.income - reportSummary.expense >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                            {formatCurrency(reportSummary.income - reportSummary.expense)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-12">
                <h3 className="text-lg font-bold text-blue-900 mb-4 border-l-4 border-blue-900 pl-3 uppercase">Detalhamento das Operações</h3>
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="bg-blue-50 border-b-2 border-blue-200">
                            <th className="px-4 py-2 text-blue-900">Data</th>
                            <th className="px-4 py-2 text-blue-900">Descrição</th>
                            <th className="px-4 py-2 text-blue-900">Categoria</th>
                            <th className="px-4 py-2 text-blue-900">Conta</th>
                            <th className="px-4 py-2 text-blue-900 text-right">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportTransactions.map((t, idx) => (
                            <tr key={t.id} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-blue-50/20'}`}>
                                <td className="px-4 py-2 whitespace-nowrap">{formatDate(t.date)}</td>
                                <td className="px-4 py-2 font-medium">{t.description}</td>
                                <td className="px-4 py-2">{t.category}</td>
                                <td className="px-4 py-2">{getAccountName(t.accountId)}</td>
                                <td className={`px-4 py-2 text-right font-bold whitespace-nowrap ${t.type === 'income' ? 'text-blue-700' : 'text-red-700'}`}>
                                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                </td>
                            </tr>
                        ))}
                        {reportTransactions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-400 italic">Nenhum dado encontrado para o período.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
                <h3 className="text-lg font-bold text-blue-900 mb-4 border-l-4 border-blue-600 pl-3 uppercase">Resumo Financeiro dos Membros</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded">
                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Total Recebido</p>
                        <p className="text-xl font-bold text-emerald-700">{formatCurrency(commitmentSummary.paid)}</p>
                    </div>
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded">
                        <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">Total Pendente</p>
                        <p className="text-xl font-bold text-amber-700">{formatCurrency(commitmentSummary.pending)}</p>
                    </div>
                </div>
            </div>

            <div className="mb-12">
                <h3 className="text-lg font-bold text-blue-900 mb-4 border-l-4 border-blue-900 pl-3 uppercase">Detalhamento dos Compromissos</h3>
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="bg-blue-50 border-b-2 border-blue-200">
                            <th className="px-4 py-2 text-blue-900">Membro</th>
                            <th className="px-4 py-2 text-blue-900">Referência</th>
                            <th className="px-4 py-2 text-blue-900">Vencimento</th>
                            <th className="px-4 py-2 text-blue-900">Tipo</th>
                            <th className="px-4 py-2 text-blue-900">Status</th>
                            <th className="px-4 py-2 text-blue-900 text-right">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportCommitments.map((c, idx) => {
                            const member = boardMembers.find(m => m.id === c.memberId);
                            return (
                              <tr key={c.id} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-blue-50/20'}`}>
                                  <td className="px-4 py-2 font-medium">{member?.name || 'N/A'}</td>
                                  <td className="px-4 py-2">{c.reference}</td>
                                  <td className="px-4 py-2 whitespace-nowrap">{formatDate(c.dueDate)}</td>
                                  <td className="px-4 py-2">{c.type}</td>
                                  <td className="px-4 py-2 uppercase text-[10px] font-bold">
                                    {c.status === 'paid' ? 'Pago' : c.status === 'pending' ? 'Pendente' : 'Cancelado'}
                                  </td>
                                  <td className="px-4 py-2 text-right font-bold whitespace-nowrap">
                                      {formatCurrency(c.amount)}
                                  </td>
                              </tr>
                            );
                        })}
                        {reportCommitments.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-400 italic">Nenhum compromisso encontrado para os filtros.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
          </>
        )}

        <div className="mt-20 grid grid-cols-2 gap-20">
            <div className="text-center border-t border-slate-300 pt-4">
                <p className="font-bold text-slate-800">Assinatura Tesouraria</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Carimbo e Assinatura</p>
            </div>
            <div className="text-center border-t border-slate-300 pt-4">
                <p className="font-bold text-slate-800">Responsável Legal</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Carimbo e Assinatura</p>
            </div>
        </div>
        
        <div className="mt-8 text-center text-[10px] text-slate-300 italic">
            Gerado via Gestão Integrada Pro em {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default Reports;