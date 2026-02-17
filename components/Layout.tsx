
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { LayoutDashboard, Wallet, ArrowRightLeft, PieChart, Settings as SettingsIcon, FileText, Landmark, LogOut, Users, Briefcase } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const Layout: React.FC = () => {
  const { associationName } = useFinance();
  const navigate = useNavigate();
  
  const navItems = [
    { section: 'Financeiro', items: [
      { to: '/', label: 'Painel Geral', icon: <LayoutDashboard size={20} /> },
      { to: '/accounts', label: 'Caixas e Contas', icon: <Landmark size={20} /> },
      { to: '/transactions', label: 'Fluxo de Caixa', icon: <ArrowRightLeft size={20} /> },
      { to: '/payables', label: 'Contas a Pagar/Receber', icon: <Wallet size={20} /> },
      { to: '/reports', label: 'Relatórios', icon: <PieChart size={20} /> },
    ]},
    { section: 'Secretaria', items: [
      { to: '/board', label: 'Diretoria', icon: <Users size={20} /> },
      { to: '/projects', label: 'Projetos', icon: <Briefcase size={20} /> },
      { to: '/documents', label: 'Documentação', icon: <FileText size={20} /> },
    ]}
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 animate-in fade-in">
      <aside className="w-64 bg-slate-800 dark:bg-slate-900 text-white flex flex-col hidden md:flex shadow-xl z-10 border-r border-slate-700 dark:border-slate-800">
        <div className="p-6 border-b border-slate-700 dark:border-slate-800">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="bg-emerald-500 w-8 h-8 rounded-lg flex items-center justify-center text-white text-lg">TP</span>
            TesourariaPro
          </h1>
          <p className="text-xs text-slate-400 mt-1 truncate">{associationName}</p>
        </div>
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {navItems.map((group) => (
            <div key={group.section} className="space-y-2">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4">{group.section}</h2>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                        : 'text-slate-300 hover:bg-slate-700 dark:hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  {item.icon}
                  <span className="font-medium text-sm">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700 dark:border-slate-800 space-y-1">
            <NavLink 
                to="/settings"
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all duration-200 ${
                    isActive 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-700 dark:hover:bg-slate-800'
                  }`
                }
            >
                <SettingsIcon size={20} />
                <span className="font-medium">Configurações</span>
            </NavLink>
            <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg w-full transition-colors"
            >
                <LogOut size={20} />
                <span className="font-medium">Sair do Sistema</span>
            </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto flex flex-col">
        <header className="bg-white dark:bg-slate-900 shadow-sm p-4 md:hidden flex justify-between items-center sticky top-0 z-20 border-b dark:border-slate-800">
             <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="bg-emerald-500 w-6 h-6 rounded flex items-center justify-center text-white text-xs">TP</span>
                TesourariaPro
             </h1>
             <div className="flex items-center gap-2">
                <button onClick={() => navigate('/settings')} className="text-slate-600 dark:text-slate-400 p-2">
                    <SettingsIcon size={20} />
                </button>
                <button onClick={handleLogout} className="text-rose-500 p-2">
                    <LogOut size={20} />
                </button>
             </div>
        </header>
        <div className="p-6 md:p-8 flex-1 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
