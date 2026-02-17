
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { OfficialDocument, OfficialDocType } from '../types';
import { Folder, Upload, FileText, Download, Plus, X, Printer, Trash2, Mail, Users, ListChecks, ChevronRight } from 'lucide-react';

const Documents: React.FC = () => {
  const { documents, addDocument, officialDocuments, addOfficialDocument, deleteOfficialDocument, associationName } = useFinance();
  const [activeTab, setActiveTab] = useState<'files' | 'official'>('files');
  const [showUpload, setShowUpload] = useState(false);
  const [showDocForm, setShowDocForm] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<OfficialDocument | null>(null);

  // States para novos docs
  const [newFile, setNewFile] = useState({ name: '', folder: 'Geral' });
  const [newOffDoc, setNewOffDoc] = useState({
    type: 'oficio' as OfficialDocType,
    title: '',
    content: {
        number: '', recipient: '', subject: '', body: '',
        members: [] as string[],
        tasks: [] as { date: string, responsible: string, activity: string }[]
    }
  });

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const fakeUrl = `https://storage.supabase.com/mock/${newFile.name}.pdf`;
    await addDocument(newFile.name, fakeUrl, newFile.folder);
    setShowUpload(false);
  };

  const handleCreateOffDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    await addOfficialDocument({
        type: newOffDoc.type,
        title: newOffDoc.title,
        content: newOffDoc.content
    });
    setShowDocForm(false);
  };

  const printDocument = (doc: OfficialDocument) => {
    setSelectedDoc(doc);
    setTimeout(() => window.print(), 100);
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-doc, #printable-doc * { visibility: visible; }
          #printable-doc {
            position: absolute;
            left: 0; top: 0; width: 100%;
            background: white; padding: 50px;
          }
        }
      `}</style>

      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Central de Documentos</h2>
            <p className="text-slate-500 dark:text-slate-400">Arquivo digital e emissão de documentos oficiais</p>
         </div>
         <div className="flex gap-2">
            <button 
                onClick={() => setActiveTab('files')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'files' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
                Arquivos Recebidos
            </button>
            <button 
                onClick={() => setActiveTab('official')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'official' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
            >
                Documentos Oficiais
            </button>
         </div>
      </div>

      {activeTab === 'files' ? (
        <div className="space-y-6 animate-in fade-in">
           <div className="flex justify-end">
              <button 
                onClick={() => setShowUpload(true)}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700 transition-colors"
              >
                <Upload size={18} /> Registrar Arquivo
              </button>
           </div>

           {showUpload && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700 shadow-lg animate-in zoom-in">
                <form onSubmit={handleFileUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Nome do documento" className="p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white" required value={newFile.name} onChange={e => setNewFile({...newFile, name: e.target.value})} />
                    <select className="p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={newFile.folder} onChange={e => setNewFile({...newFile, folder: e.target.value})}>
                        <option value="Geral">Geral</option>
                        <option value="Contas">Contas</option>
                        <option value="Contratos">Contratos</option>
                    </select>
                    <button type="submit" className="md:col-span-2 bg-emerald-600 text-white py-2 rounded font-bold">Salvar Metadados</button>
                </form>
            </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Geral', 'Contas', 'Contratos'].map(folder => (
                    <div key={folder} className="bg-white dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700">
                        <Folder size={32} className="text-emerald-500 mb-2" />
                        <h3 className="font-bold text-slate-800 dark:text-white">{folder}</h3>
                        <p className="text-sm text-slate-400">{documents.filter(d => d.folder === folder).length} documentos</p>
                    </div>
                ))}
           </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-end">
                <button 
                    onClick={() => setShowDocForm(true)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={18} /> Novo Documento Oficial
                </button>
            </div>

            {showDocForm && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700 shadow-lg">
                    <form onSubmit={handleCreateOffDoc} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1">Tipo de Documento</label>
                                <select 
                                    className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                    value={newOffDoc.type} onChange={e => setNewOffDoc({...newOffDoc, type: e.target.value as any})}
                                >
                                    <option value="oficio">Ofício</option>
                                    <option value="comissao">Comissão/Portaria</option>
                                    <option value="escala">Escala de Serviço</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1">Título/Identificação</label>
                                <input type="text" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white" required value={newOffDoc.title} onChange={e => setNewOffDoc({...newOffDoc, title: e.target.value})} />
                            </div>
                        </div>

                        {newOffDoc.type === 'oficio' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Número do Ofício" className="p-2 border rounded dark:bg-slate-900" onChange={e => setNewOffDoc({...newOffDoc, content: {...newOffDoc.content, number: e.target.value}})} />
                                    <input type="text" placeholder="Destinatário" className="p-2 border rounded dark:bg-slate-900" onChange={e => setNewOffDoc({...newOffDoc, content: {...newOffDoc.content, recipient: e.target.value}})} />
                                </div>
                                <input type="text" placeholder="Assunto" className="w-full p-2 border rounded dark:bg-slate-900" onChange={e => setNewOffDoc({...newOffDoc, content: {...newOffDoc.content, subject: e.target.value}})} />
                                <textarea placeholder="Corpo do Ofício..." rows={6} className="w-full p-2 border rounded dark:bg-slate-900" onChange={e => setNewOffDoc({...newOffDoc, content: {...newOffDoc.content, body: e.target.value}})}></textarea>
                            </div>
                        )}

                        {newOffDoc.type === 'comissao' && (
                            <div>
                                <textarea placeholder="Objetivo da Comissão e Membros (separe por vírgula)..." rows={4} className="w-full p-2 border rounded dark:bg-slate-900" onChange={e => setNewOffDoc({...newOffDoc, content: {...newOffDoc.content, body: e.target.value}})}></textarea>
                            </div>
                        )}

                        {newOffDoc.type === 'escala' && (
                            <div>
                                <textarea placeholder="Descreva a escala, datas e responsáveis..." rows={6} className="w-full p-2 border rounded dark:bg-slate-900" onChange={e => setNewOffDoc({...newOffDoc, content: {...newOffDoc.content, body: e.target.value}})}></textarea>
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowDocForm(false)} className="px-4 py-2 bg-slate-100 rounded">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded font-bold">Gerar Documento</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase font-bold text-slate-500">
                        <tr>
                            <th className="p-4">Tipo</th>
                            <th className="p-4">Título</th>
                            <th className="p-4">Data de Criação</th>
                            <th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-slate-700">
                        {officialDocuments.map(doc => (
                            <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${doc.type === 'oficio' ? 'bg-blue-100 text-blue-700' : doc.type === 'comissao' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {doc.type}
                                    </span>
                                </td>
                                <td className="p-4 font-medium">{doc.title}</td>
                                <td className="p-4 text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => printDocument(doc)} className="p-1 text-slate-400 hover:text-emerald-600"><Printer size={18}/></button>
                                        <button onClick={() => deleteOfficialDocument(doc.id)} className="p-1 text-slate-400 hover:text-rose-500"><Trash2 size={18}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* Printable Official Document */}
      {selectedDoc && (
        <div id="printable-doc" className="hidden">
            <div className="text-center mb-12 border-b-2 border-slate-900 pb-8">
                <h1 className="text-3xl font-bold uppercase">{associationName}</h1>
                <p className="text-sm mt-2 font-medium">Sede Administrativa - Secretaria Executiva</p>
            </div>

            <div className="text-right mb-8">
                <p>{new Date(selectedDoc.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            <div className="mb-12">
                <h2 className="text-2xl font-bold uppercase mb-4 text-center underline">
                    {selectedDoc.type === 'oficio' ? `OFÍCIO Nº ${selectedDoc.content.number || '___'}` : 
                     selectedDoc.type === 'comissao' ? `PORTARIA DE COMISSÃO: ${selectedDoc.title}` : 
                     `ESCALA DE SERVIÇO: ${selectedDoc.title}`}
                </h2>
            </div>

            {selectedDoc.type === 'oficio' && (
                <div className="space-y-6 text-lg leading-relaxed">
                    <p><strong>Ao Sr(a):</strong> {selectedDoc.content.recipient || '___________________'}</p>
                    <p><strong>Assunto:</strong> {selectedDoc.content.subject || 'Assunto Geral'}</p>
                    <div className="mt-8 whitespace-pre-wrap">{selectedDoc.content.body}</div>
                </div>
            )}

            {(selectedDoc.type === 'comissao' || selectedDoc.type === 'escala') && (
                <div className="space-y-6 text-lg leading-relaxed">
                    <div className="whitespace-pre-wrap">{selectedDoc.content.body}</div>
                </div>
            )}

            <div className="mt-32 text-center">
                <div className="w-64 border-t border-slate-900 mx-auto pt-2">
                    <p className="font-bold">Diretoria Executiva</p>
                    <p className="text-sm">{associationName}</p>
                </div>
            </div>

            <div className="mt-20 text-[10px] text-slate-400 text-center">
                Documento gerado eletronicamente através da plataforma TesourariaPro em {new Date().toLocaleString()}
            </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
