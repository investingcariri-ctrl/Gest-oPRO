
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionManager from './components/TransactionManager';
import FinancialCommitments from './components/FinancialCommitments';
import Reports from './components/Reports';
import Documents from './components/Documents';
import AccountManager from './components/AccountManager';
import BoardManager from './components/BoardManager';
import ProjectManager from './components/ProjectManager';
import Settings from './components/Settings';
import Login from './components/Login';
import { FinanceProvider } from './context/FinanceContext';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
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
                    <Route path="commitments" element={<FinancialCommitments />} />
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
