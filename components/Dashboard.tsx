
import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Landmark } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const { getSummary, transactions, associationName, accounts } = useFinance();
  
  const summary = useMemo(() => getSummary(), [getSummary]);
  
  const chartData = useMemo(() => {
    return [...transactions]
      .slice(0, 10)
      .reverse()
      .map(t => ({
        name: t.date.split('-').slice(1).join('/'),
        amount: t.type === 'income' ? t.amount : -t.amount,
        type: t.type
      }));
  }, [transactions]);

  const accountBalances = useMemo(() => {
    return accounts.map(acc => {
      const accTrans = transactions.filter(t => t.accountId === acc.id && t.status === 'completed');
      const balance = accTrans.reduce((total, t) => {
        return total + (t.type === 'income' ? t.amount : -t.amount);
      }, acc.initialBalance);
      return { ...acc, currentBalance: balance };
    });
  }, [accounts, transactions]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 tracking-tight">Painel Executivo</h2>
          <p className="text-sm text-slate-500 font-medium">{associationName}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-100 rounded-full shadow-sm">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase">Sistema Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Patrimônio Líquido" value={summary.balance} icon={<DollarSign size={20}/>} subtitle="Consolidado Bancário" />
        <StatCard title="Receitas do Mês" value={summary.totalIncome} icon={<TrendingUp size={20}/>} subtitle={`${formatCurrency(summary.pendingIncome)} a receber`} />
        <StatCard title="Despesas do Mês" value={summary.totalExpense} icon={<TrendingDown size={20}/>} subtitle={`${formatCurrency(summary.pendingExpense)} a pagar`} negative />
        <StatCard title="Conciliações" value={transactions.filter(t => !t.reconciled).length} icon={<AlertCircle size={20}/>} subtitle="Itens pendentes" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-blue-50">
            <h3 className="text-lg font-bold text-blue-900 mb-6">Fluxo Transacional</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff'}}
                          formatter={(value: number) => formatCurrency(value)} 
                        />
                        <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50">
            <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2">
                <Landmark size={18} className="text-blue-500"/> Contas & Caixas
            </h3>
            <div className="space-y-4">
                {accountBalances.map(acc => (
                    <div key={acc.id} className="pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{acc.name}</p>
                        <p className={`text-lg font-bold ${acc.currentBalance >= 0 ? 'text-blue-700' : 'text-rose-600'}`}>
                            {formatCurrency(acc.currentBalance)}
                        </p>
                    </div>
                ))}
                {accountBalances.length === 0 && (
                    <p className="text-xs text-slate-400 italic">Nenhuma conta ativa.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, subtitle, negative = false }: any) => {
    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50 hover:border-blue-200 transition-colors">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className={`text-2xl font-bold mt-1 ${typeof value === 'number' && value < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {typeof value === 'number' ? formatCurrency(value) : value}
                    </h3>
                </div>
                <div className={`p-3 rounded-xl ${negative ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                    {icon}
                </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">{subtitle}</p>
        </div>
    );
};

export default Dashboard;
