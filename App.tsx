
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionManager from './components/TransactionManager';
import Reports from './components/Reports';
import Documents from './components/Documents';
import AccountManager from './components/AccountManager';
import BoardManager from './components/BoardManager';
import ProjectManager from './components/ProjectManager';
import Settings from './components/Settings';
import Login from './components/Login';
import { FinanceProvider } from './context/FinanceContext';
import { supabase } from './services/supabaseClient';

const Payables = () => (
    <div className="space-y-6">
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4">
            <p className="text-sm text-amber-700 dark:text-amber-400">
                <strong>Nota:</strong> Esta visualização filtra automaticamente transações pendentes.
            </p>
        </div>
        <TransactionManager />
    </div>
);

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize theme
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!session) {
    return <Login onLogin={() => {}} />; 
  }

  return (
    <FinanceProvider>
        <HashRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    {/* Financeiro */}
                    <Route path="accounts" element={<AccountManager />} />
                    <Route path="transactions" element={<TransactionManager />} />
                    <Route path="payables" element={<Payables />} />
                    <Route path="reports" element={<Reports />} />
                    {/* Secretaria */}
                    <Route path="board" element={<BoardManager />} />
                    <Route path="projects" element={<ProjectManager />} />
                    <Route path="documents" element={<Documents />} />
                    {/* Geral */}
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </HashRouter>
    </FinanceProvider>
  );
};

export default App;
