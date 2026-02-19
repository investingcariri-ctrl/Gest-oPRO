
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { LayoutDashboard, ArrowRightLeft, PieChart, Settings as SettingsIcon, FileText, Landmark, LogOut, Users, Briefcase } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const Layout: React.FC = () => {
  const { associationName } = useFinance();
  const navigate = useNavigate();
  
  const navItems = [
    { section: 'Financeiro', items: [
      { to: '/', label: 'Painel Geral', icon: <LayoutDashboard size={20} /> },
      { to: '/accounts', label: 'Caixas e Contas', icon: <Landmark size={20} /> },
      { to: '/transactions', label: 'Fluxo de Caixa', icon: <ArrowRightLeft size={20} /> },
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
    <div className="flex h-screen bg-slate-50 transition-colors duration-300 animate-in fade-in">
      <aside className="w-64 bg-blue-900 text-white flex flex-col hidden md:flex shadow-xl z-10 border-r border-blue-800 no-print">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="bg-white w-8 h-8 rounded-lg flex items-center justify-center text-blue-900 text-lg">GP</span>
            Gestão Pro
          </h1>
          <p className="text-xs text-blue-300 mt-1 truncate font-medium">{associationName}</p>
        </div>
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {navItems.map((group) => (
            <div key={group.section} className="space-y-2">
              <h2 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-4">{group.section}</h2>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/20'
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
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
        <div className="p-4 border-t border-blue-800 space-y-1">
            <NavLink 
                to="/settings"
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-blue-100 hover:text-white hover:bg-blue-800'
                  }`
                }
            >
                <SettingsIcon size={20} />
                <span className="font-medium">Configurações</span>
            </NavLink>
            <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-red-300 hover:text-white hover:bg-red-600/20 rounded-lg w-full transition-colors"
            >
                <LogOut size={20} />
                <span className="font-medium">Sair do Sistema</span>
            </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto flex flex-col">
        <header className="bg-white shadow-sm p-4 md:hidden flex justify-between items-center sticky top-0 z-20 border-b border-blue-100 no-print">
             <h1 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <span className="bg-blue-600 w-6 h-6 rounded flex items-center justify-center text-white text-xs">GP</span>
                Gestão Integrada Pro
             </h1>
             <div className="flex items-center gap-2">
                <button onClick={() => navigate('/settings')} className="text-blue-600 p-2">
                    <SettingsIcon size={20} />
                </button>
                <button onClick={handleLogout} className="text-red-500 p-2">
                    <LogOut size={20} />
                </button>
             </div>
        </header>
        <div className="p-6 md:p-8 flex-1 bg-slate-50 transition-colors duration-300">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
