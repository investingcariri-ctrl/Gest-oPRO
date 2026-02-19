
import React, { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  Building, 
  Save, 
  Tag, 
  Pencil, 
  Trash2, 
  X, 
  Check, 
  Database, 
  Download, 
  Upload, 
  RefreshCw,
  AlertTriangle,
  Loader2
} from 'lucide-react';

const Settings: React.FC = () => {
  const { 
    associationName, 
    updateAssociationName, 
    categories, 
    updateCategory, 
    deleteCategory,
    transactions,
    accounts,
    boardMembers,
    projects,
    officialDocuments,
    fetchInitialData,
    addTransaction,
    addAccount,
    addBoardMember,
    addProject,
    addCategory
  } = useFinance();

  const [localAssocName, setLocalAssocName] = useState(associationName);
  const [cnpj, setCnpj] = useState('00.000.000/0001-00');
  const [success, setSuccess] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catTempName, setCatTempName] = useState('');

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

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await fetchInitialData();
      alert("Sincronização com o banco de dados concluída!");
    } catch (error) {
      alert("Erro ao sincronizar dados.");
    } finally {
      setSyncing(false);
    }
  };

  const handleExportBackup = () => {
    const dataToExport = {
      associationName,
      exportDate: new Date().toISOString(),
      categories,
      accounts,
      transactions,
      boardMembers,
      projects,
      officialDocuments
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_${associationName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const confirmRestore = window.confirm(
      "Atenção: A restauração irá importar os dados do arquivo para o banco de dados atual. " +
      "Isso pode gerar duplicidade de registros se os dados já existirem. Deseja continuar?"
    );

    if (!confirmRestore) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setRestoring(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content);

        if (!backup.categories || !backup.accounts) {
          throw new Error("Arquivo de backup inválido.");
        }

        for (const cat of backup.categories) {
          await addCategory({ name: cat.name, type: cat.type, budgetLimit: cat.budgetLimit });
        }
        for (const acc of backup.accounts) {
          await addAccount({ name: acc.name, type: acc.type, initialBalance: acc.initialBalance, description: acc.description });
        }
        if (backup.boardMembers) {
          for (const member of backup.boardMembers) {
            await addBoardMember({ 
              name: member.name, role: member.role, 
              termStart: member.termStart, termEnd: member.termEnd, 
              phone: member.phone, email: member.email 
            });
          }
        }
        if (backup.projects) {
          for (const proj of backup.projects) {
            await addProject({ 
              title: proj.title, description: proj.description, 
              objective: proj.objective, targetAudience: proj.targetAudience,
              resources: proj.resources, financialImpact: proj.financialImpact,
              executionDate: proj.executionDate, executionLocation: proj.executionLocation,
              status: proj.status
              // Campo authorId removido da restauração para compatibilidade com o banco
            });
          }
        }
        if (backup.transactions) {
          for (const trans of backup.transactions) {
            await addTransaction({
              date: trans.date, description: trans.description, amount: trans.amount,
              type: trans.type, category: trans.category, accountId: trans.accountId,
              status: trans.status, paymentMethod: trans.paymentMethod, notes: trans.notes,
              attachment: trans.attachment, reconciled: trans.reconciled
            });
          }
        }

        alert("Restauração concluída com sucesso! Recarregando dados...");
        await fetchInitialData();
      } catch (err: any) {
        alert("Erro na restauração: " + err.message);
      } finally {
        setRestoring(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-blue-900">Configurações</h2>
           <p className="text-slate-500">Personalize o ambiente e gerencie a segurança dos seus dados</p>
        </div>
        {success && (
          <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg flex items-center gap-2 border border-emerald-200 animate-in zoom-in">
            <Check size={18} />
            Alterações salvas!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Building size={20} />
            </div>
            <h3 className="font-bold text-blue-900 text-lg">Informações da Entidade</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Oficial da Associação</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                    value={localAssocName}
                    onChange={e => setLocalAssocName(e.target.value)}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                    value={cnpj}
                    onChange={e => setCnpj(e.target.value)}
                  />
               </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
               <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-900/10"
               >
                  <Save size={18} />
                  Salvar Mudanças
               </button>
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Database size={20} />
              </div>
              <h3 className="font-bold text-blue-900 text-lg">Gestão de Dados & Sincronização</h3>
           </div>

           <div className="space-y-6">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                 <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
                 <p className="text-xs text-amber-800 leading-relaxed">
                   <strong>Atenção:</strong> O backup exporta apenas dados de texto e registros. Arquivos anexados (comprovantes) devem ser salvos separadamente no seu armazenamento em nuvem.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <button 
                    onClick={handleExportBackup}
                    className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group"
                 >
                    <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                       <Download size={20} />
                    </div>
                    <div className="text-left">
                       <p className="font-bold text-slate-800 text-sm">Fazer Backup</p>
                       <p className="text-[10px] text-slate-500">Baixar arquivo .JSON</p>
                    </div>
                 </button>

                 <div className="relative">
                    <input 
                      type="file" 
                      accept=".json" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleImportRestore} 
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={restoring}
                        className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group disabled:opacity-50"
                    >
                        <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                          {restoring ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-800 text-sm">Restaurar Dados</p>
                          <p className="text-[10px] text-slate-500">Upload de arquivo .JSON</p>
                        </div>
                    </button>
                 </div>

                 <button 
                    onClick={handleManualSync}
                    disabled={syncing}
                    className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group md:col-span-2 disabled:opacity-50"
                 >
                    <div className={`p-2 bg-white rounded-lg text-blue-900 shadow-sm ${syncing ? 'animate-spin' : 'group-hover:rotate-180'} transition-all duration-500`}>
                       <RefreshCw size={20} />
                    </div>
                    <div className="text-left">
                       <p className="font-bold text-slate-800 text-sm">Sincronizar com Banco</p>
                       <p className="text-[10px] text-slate-500">Atualizar dados com o servidor Supabase</p>
                    </div>
                 </button>
              </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50 lg:col-span-2">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Tag size={20} />
              </div>
              <h3 className="font-bold text-blue-900 text-lg">Gerenciar Categorias</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <p className="text-xs font-bold text-blue-600 uppercase mb-3">Entradas</p>
                    <div className="space-y-2">
                        {categories.filter(c => c.type === 'income').map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group border border-blue-50">
                                {editingCatId === cat.id ? (
                                    <input 
                                        type="text" 
                                        className="flex-1 bg-white text-sm p-1 border border-blue-200 rounded outline-none"
                                        value={catTempName}
                                        onChange={e => setCatTempName(e.target.value)}
                                        autoFocus
                                    />
                                ) : (
                                    <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                                )}
                                <div className="flex gap-2">
                                    {editingCatId === cat.id ? (
                                        <>
                                            <button onClick={handleSaveCat} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Check size={16}/></button>
                                            <button onClick={() => setEditingCatId(null)} className="text-slate-400 p-1 rounded"><X size={16}/></button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleStartEditCat(cat)} className="text-slate-400 hover:text-blue-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Pencil size={16}/></button>
                                            <button onClick={() => {if(confirm('Excluir categoria?')) deleteCategory(cat.id)}} className="text-slate-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="text-xs font-bold text-red-600 uppercase mb-3">Saídas</p>
                    <div className="space-y-2">
                        {categories.filter(c => c.type === 'expense').map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group border border-blue-50">
                                {editingCatId === cat.id ? (
                                    <input 
                                        type="text" 
                                        className="flex-1 bg-white text-sm p-1 border border-blue-200 rounded outline-none"
                                        value={catTempName}
                                        onChange={e => setCatTempName(e.target.value)}
                                        autoFocus
                                    />
                                ) : (
                                    <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                                )}
                                <div className="flex gap-2">
                                    {editingCatId === cat.id ? (
                                        <>
                                            <button onClick={handleSaveCat} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Check size={16}/></button>
                                            <button onClick={() => setEditingCatId(null)} className="text-slate-400 p-1 rounded"><X size={16}/></button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleStartEditCat(cat)} className="text-slate-400 hover:text-blue-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Pencil size={16}/></button>
                                            <button onClick={() => {if(confirm('Excluir categoria?')) deleteCategory(cat.id)}} className="text-slate-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
