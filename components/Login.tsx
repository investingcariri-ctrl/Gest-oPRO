import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name }
          }
        });
        if (error) throw error;
        alert("Cadastro realizado! Verifique seu e-mail para confirmar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-blue-50 overflow-hidden relative">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <ShieldCheck size={28} />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-blue-900 tracking-tight">
              {isRegistering ? 'Criar sua conta' : 'Gestão Integrada Pro'}
            </h1>
            <p className="text-slate-500 mt-2">
              {isRegistering 
                ? 'Comece a gerir sua associação hoje mesmo' 
                : 'Acesse sua Gestão Integrada Pro'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-2 text-sm animate-in fade-in zoom-in">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="relative">
                <label className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1 block ml-1">Nome Completo</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    required
                    placeholder="João Silva"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="relative">
              <label className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1 block ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1 block ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-950 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 group transition-all"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isRegistering ? 'Registrar' : 'Entrar no Sistema'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-blue-50 text-center">
            <p className="text-slate-500 text-sm">
              {isRegistering ? 'Já possui uma conta?' : 'Ainda não tem conta?'}
              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="ml-1 text-blue-600 font-bold hover:underline"
              >
                {isRegistering ? 'Faça login' : 'Cadastre sua conta'}
              </button>
            </p>
          </div>
        </div>
        <div className="bg-blue-50 px-8 py-4 flex items-center justify-center gap-2 border-t border-blue-100">
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Gestão Integrada Pro v2.5</span>
        </div>
      </div>
    </div>
  );
};

export default Login;