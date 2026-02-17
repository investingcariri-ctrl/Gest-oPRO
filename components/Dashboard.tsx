
import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Landmark } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const { getSummary, transactions, associationName, accounts } = useFinance();
  const summary = getSummary();
  
  // Prepare data for small chart
  const last7Transactions = [...transactions].slice(0, 7).reverse();
  const chartData = last7Transactions.map(t => ({
    name: t.date.split('-').slice(1).join('/'),
    amount: t.type === 'income' ? t.amount : -t.amount,
    type: t.type
  }));

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const calculateAccountBalance = (accountId: string, initialBalance: number) => {
    const accTransactions = transactions.filter(t => t.accountId === accountId && t.status === 'completed');
    return accTransactions.reduce((acc, t) => {
        return acc + (t.type === 'income' ? t.amount : -t.amount);
    }, initialBalance);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Resumo Operacional</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{associationName}</p>
        </div>
        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full border dark:border-slate-700">
          Última atualização: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Patrimônio Líquido</p>
              <h3 className={`text-2xl font-bold mt-1 ${summary.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
                {formatCurrency(summary.balance)}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">Total em todos os caixas e bancos</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Entradas (Mês)</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">{formatCurrency(summary.totalIncome)}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 flex items-center gap-1">
             <span className="text-blue-500 font-medium">{formatCurrency(summary.pendingIncome)}</span> a receber
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Saídas (Mês)</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">{formatCurrency(summary.totalExpense)}</h3>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400">
              <TrendingDown size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 flex items-center gap-1">
             <span className="text-rose-500 font-medium">{formatCurrency(summary.pendingExpense)}</span> a pagar
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pendências de Banco</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                {transactions.filter(t => !t.reconciled).length}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
              <AlertCircle size={20} />
            </div>
          </div>
           <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">Itens aguardando conciliação</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Saldos por Conta */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 col-span-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Landmark size={18} className="text-emerald-500"/> Saldos Atuais
            </h3>
            <div className="space-y-4">
                {accounts.map(acc => {
                    const balance = calculateAccountBalance(acc.id, acc.initialBalance);
                    return (
                        <div key={acc.id} className="pb-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">{acc.name}</p>
                            <p className={`text-sm font-bold ${balance >= 0 ? 'text-slate-800 dark:text-slate-200' : 'text-rose-500'}`}>
                                {formatCurrency(balance)}
                            </p>
                        </div>
                    );
                })}
                {accounts.length === 0 && (
                    <p className="text-xs text-slate-400 italic">Nenhuma conta cadastrada.</p>
                )}
            </div>
        </div>

        {/* Recent Activity Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Volume Transacionado (Recente)</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff'}}
                          itemStyle={{ color: '#10b981' }}
                          formatter={(value: number) => formatCurrency(value)} 
                        />
                        <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Recent Activity List */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 col-span-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Últimos Lançamentos</h3>
            <div className="space-y-4">
                {transactions.slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50 pb-3 last:border-0 last:pb-0 group">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`flex-shrink-0 w-2 h-2 rounded-full shadow-sm ${t.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                            <div className="truncate">
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{t.description}</p>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.date}</p>
                            </div>
                        </div>
                        <span className={`text-xs font-bold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>
                    </div>
                ))}
            </div>
            <button className="w-full mt-6 py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest bg-slate-50 dark:bg-slate-900 rounded-lg">
                Histórico Completo
            </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
