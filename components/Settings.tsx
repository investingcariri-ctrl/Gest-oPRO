
import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Moon, Sun, Building, Shield, Bell, Cloud, Save, RefreshCw, Tag, Pencil, Trash2, X, Check } from 'lucide-react';

const Settings: React.FC = () => {
  const { associationName, updateAssociationName, categories, updateCategory, deleteCategory } = useFinance();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [localAssocName, setLocalAssocName] = useState(associationName);
  const [cnpj, setCnpj] = useState('00.000.000/0001-00');
  const [success, setSuccess] = useState(false);
  
  // Category management state
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catTempName, setCatTempName] = useState('');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAssociationName(localAssocName);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleStartEditCat = (cat: any) => {
    setEditingCatId(cat.id);
    setCatTempName(cat.name);
  };

  const handleSaveCat = async () => {
    if (editingCatId && catTempName) {
        await updateCategory(editingCatId, catTempName);
        setEditingCatId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Configurações</h2>
           <p className="text-slate-500 dark:text-slate-400">Personalize o ambiente e dados da sua tesouraria</p>
        </div>
        {success && (
          <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg flex items-center gap-2 border border-emerald-200 animate-in zoom-in">
            <Save size={18} />
            Alterações salvas!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appearance Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                <Sun size={20} />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">Aparência</h3>
           </div>
           
           <div className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Escolha como o sistema deve ser exibido.</p>
              
              <div className="grid grid-cols-2 gap-3">
                 <button 
                    onClick={() => setDarkMode(false)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${!darkMode ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                 >
                    <Sun className={!darkMode ? 'text-emerald-600' : 'text-slate-400'} size={32} />
                    <span className={`text-sm font-bold ${!darkMode ? 'text-emerald-700' : 'text-slate-500'}`}>Claro</span>
                 </button>
                 <button 
                    onClick={() => setDarkMode(true)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${darkMode ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                 >
                    <Moon className={darkMode ? 'text-emerald-400' : 'text-slate-400'} size={32} />
                    <span className={`text-sm font-bold ${darkMode ? 'text-emerald-400' : 'text-slate-500'}`}>Escuro</span>
                 </button>
              </div>
           </div>
        </div>

        {/* Category Management */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                <Tag size={20} />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">Gerenciar Categorias</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase mb-3">Entradas</p>
                    <div className="space-y-2">
                        {categories.filter(c => c.type === 'income').map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl group border dark:border-slate-700">
                                {editingCatId === cat.id ? (
                                    <input 
                                        type="text" 
                                        className="flex-1 bg-white dark:bg-slate-800 text-sm p-1 border rounded outline-none dark:text-white"
                                        value={catTempName}
                                        onChange={e => setCatTempName(e.target.value)}
                                        autoFocus
                                    />
                                ) : (
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                                )}
                                <div className="flex gap-2">
                                    {editingCatId === cat.id ? (
                                        <>
                                            <button onClick={handleSaveCat} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"><Check size={16}/></button>
                                            <button onClick={() => setEditingCatId(null)} className="text-slate-400 p-1 rounded"><X size={16}/></button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleStartEditCat(cat)} className="text-slate-400 hover:text-emerald-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Pencil size={16}/></button>
                                            <button onClick={() => {if(confirm('Excluir categoria?')) deleteCategory(cat.id)}} className="text-slate-400 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="text-xs font-bold text-rose-600 uppercase mb-3">Saídas</p>
                    <div className="space-y-2">
                        {categories.filter(c => c.type === 'expense').map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl group border dark:border-slate-700">
                                {editingCatId === cat.id ? (
                                    <input 
                                        type="text" 
                                        className="flex-1 bg-white dark:bg-slate-800 text-sm p-1 border rounded outline-none dark:text-white"
                                        value={catTempName}
                                        onChange={e => setCatTempName(e.target.value)}
                                        autoFocus
                                    />
                                ) : (
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                                )}
                                <div className="flex gap-2">
                                    {editingCatId === cat.id ? (
                                        <>
                                            <button onClick={handleSaveCat} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"><Check size={16}/></button>
                                            <button onClick={() => setEditingCatId(null)} className="text-slate-400 p-1 rounded"><X size={16}/></button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleStartEditCat(cat)} className="text-slate-400 hover:text-emerald-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Pencil size={16}/></button>
                                            <button onClick={() => {if(confirm('Excluir categoria?')) deleteCategory(cat.id)}} className="text-slate-400 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
           </div>
        </div>

        {/* Association Details */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Building size={20} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Informações da Entidade</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Oficial da Associação</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white"
                    value={localAssocName}
                    onChange={e => setLocalAssocName(e.target.value)}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CNPJ</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white"
                    value={cnpj}
                    onChange={e => setCnpj(e.target.value)}
                  />
               </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
               <button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/10"
               >
                  <Save size={18} />
                  Salvar Mudanças
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
