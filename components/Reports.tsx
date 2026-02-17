
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Printer, Calendar, Landmark, FileText, Download } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports: React.FC = () => {
  const { transactions, categories, accounts } = useFinance();

  // State for Report Filters
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');

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
         <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Relatórios Gerenciais</h2>
         <p className="text-slate-500 dark:text-slate-400">Visualização de despesas e exportação de demonstrativos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 no-print">
        {/* Expense Distribution */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Distribuição de Despesas</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={expensesByCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {expensesByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
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
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
           <div>
               <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                   <FileText size={20} className="text-slate-500"/> 
                   Parâmetros do Relatório
               </h3>
               <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Ajuste o período e as contas para gerar o documento.</p>

               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                            <Calendar size={14} /> Início
                        </label>
                        <input 
                            type="date" 
                            value={dateRange.start}
                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                            className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                            <Calendar size={14} /> Fim
                        </label>
                        <input 
                            type="date" 
                            value={dateRange.end}
                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                            className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                        <Landmark size={14} /> Filtro de Conta
                    </label>
                    <select 
                        className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
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

           <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-4">
              <button 
                  onClick={handleExportCSV}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
              >
                  <Download size={18} />
                  CSV
              </button>
              <button 
                  onClick={handlePrint}
                  className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
              >
                  <Printer size={18} />
                  PDF / Impressão
              </button>
           </div>
        </div>
      </div>

      {/* Hidden Printable Area */}
      <div id="printable-report" className="hidden">
        <div className="text-center mb-8 border-b-2 border-slate-800 pb-4">
            <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-wide">TesourariaPro</h1>
            <h2 className="text-xl text-slate-700 mt-2">Demonstrativo Financeiro</h2>
            <p className="text-slate-500 mt-1">
                Período: {formatDate(dateRange.start)} até {formatDate(dateRange.end)}
            </p>
            <p className="text-slate-500">
                Conta: {selectedAccountId === 'all' ? 'Todas as Contas' : getAccountName(selectedAccountId)}
            </p>
        </div>

        <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-emerald-500 pl-3">Resumo do Período</h3>
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                    <p className="text-sm text-gray-500 uppercase">Total Entradas</p>
                    <p className="text-xl font-bold text-emerald-600">{formatCurrency(reportSummary.income)}</p>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                    <p className="text-sm text-gray-500 uppercase">Total Saídas</p>
                    <p className="text-xl font-bold text-rose-600">{formatCurrency(reportSummary.expense)}</p>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                    <p className="text-sm text-gray-500 uppercase">Resultado</p>
                    <p className={`text-xl font-bold ${reportSummary.income - reportSummary.expense >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatCurrency(reportSummary.income - reportSummary.expense)}
                    </p>
                </div>
            </div>
        </div>

        <div className="mb-12">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-slate-500 pl-3">Detalhamento</h3>
            <table className="w-full text-sm text-left border-collapse">
                <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="px-4 py-2">Data</th>
                        <th className="px-4 py-2">Descrição</th>
                        <th className="px-4 py-2">Categoria</th>
                        <th className="px-4 py-2">Conta</th>
                        <th className="px-4 py-2 text-right">Valor</th>
                    </tr>
                </thead>
                <tbody>
                    {reportTransactions.map((t, idx) => (
                        <tr key={t.id} className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="px-4 py-2 whitespace-nowrap">{formatDate(t.date)}</td>
                            <td className="px-4 py-2">{t.description}</td>
                            <td className="px-4 py-2">{t.category}</td>
                            <td className="px-4 py-2">{getAccountName(t.accountId)}</td>
                            <td className={`px-4 py-2 text-right font-bold whitespace-nowrap ${t.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                            </td>
                        </tr>
                    ))}
                    {reportTransactions.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-8 text-gray-500 italic">Nenhum dado encontrado para o período.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-20">
            <div className="text-center border-t border-slate-400 pt-4">
                <p className="font-bold text-slate-800">Tesoureiro(a)</p>
                <p className="text-xs text-slate-500">Assinatura</p>
            </div>
            <div className="text-center border-t border-slate-400 pt-4">
                <p className="font-bold text-slate-800">Responsável Administrativo</p>
                <p className="text-xs text-slate-500">Assinatura</p>
            </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-slate-400">
            Gerado via TesourariaPro em {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default Reports;
