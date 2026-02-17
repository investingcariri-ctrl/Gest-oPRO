
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Transaction, Category, FinancialSummary, Account, BoardMember, Project, OfficialDocument } from '../types';
import { supabase } from '../services/supabaseClient';

interface DocumentMetadata {
  id: string;
  name: string;
  file_url: string;
  folder: string;
  created_at: string;
}

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  documents: DocumentMetadata[];
  boardMembers: BoardMember[];
  projects: Project[];
  officialDocuments: OfficialDocument[];
  associationName: string;
  loading: boolean;
  updateAssociationName: (name: string) => Promise<void>;
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (t: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addAccount: (a: Omit<Account, 'id'>) => Promise<void>;
  updateAccount: (a: Account) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addCategory: (c: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addDocument: (name: string, url: string, folder: string) => Promise<void>;
  addBoardMember: (m: Omit<BoardMember, 'id'>) => Promise<void>;
  deleteBoardMember: (id: string) => Promise<void>;
  addProject: (p: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (p: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addOfficialDocument: (d: Omit<OfficialDocument, 'id' | 'created_at'>) => Promise<void>;
  deleteOfficialDocument: (id: string) => Promise<void>;
  fetchInitialData: () => Promise<void>;
  getSummary: () => FinancialSummary;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [officialDocuments, setOfficialDocuments] = useState<OfficialDocument[]>([]);
  const [associationName, setAssociationName] = useState('Associação Integrada');
  const [loading, setLoading] = useState(true);

  const mapAccount = (dbAcc: any): Account => ({
    id: dbAcc.id,
    name: dbAcc.name,
    type: dbAcc.type,
    description: dbAcc.description,
    initialBalance: Number(dbAcc.initial_balance)
  });

  const mapTransaction = (dbTrans: any): Transaction => ({
    id: dbTrans.id,
    date: dbTrans.date,
    description: dbTrans.description,
    amount: Number(dbTrans.amount),
    type: dbTrans.type,
    category: dbTrans.category,
    accountId: dbTrans.account_id,
    status: dbTrans.status,
    paymentMethod: dbTrans.payment_method,
    notes: dbTrans.notes,
    attachment: dbTrans.attachment,
    reconciled: dbTrans.reconciled || false
  });

  const mapBoardMember = (db: any): BoardMember => ({
    id: db.id,
    name: db.name,
    role: db.role,
    termStart: db.term_start,
    termEnd: db.term_end,
    phone: db.phone,
    email: db.email
  });

  const mapProject = (db: any): Project => ({
    id: db.id,
    title: db.title,
    description: db.description,
    status: db.status,
    startDate: db.start_date,
    endDate: db.end_date,
    budget: Number(db.budget)
  });

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [p, acc, cat, trans, docs, board, projs, offDocs] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('accounts').select('*').eq('user_id', user.id),
        supabase.from('categories').select('*').eq('user_id', user.id),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('board_members').select('*').eq('user_id', user.id),
        supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('official_documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      if (p.data) setAssociationName(p.data.association_name);
      if (acc.data) setAccounts(acc.data.map(mapAccount));
      if (cat.data) setCategories(cat.data);
      if (trans.data) setTransactions(trans.data.map(mapTransaction));
      if (docs.data) setDocuments(docs.data);
      if (board.data) setBoardMembers(board.data.map(mapBoardMember));
      if (projs.data) setProjects(projs.data.map(mapProject));
      if (offDocs.data) setOfficialDocuments(offDocs.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const updateAssociationName = async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('profiles').upsert({ id: user.id, association_name: name });
    if (!error) setAssociationName(name);
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const dbPayload = {
      user_id: user.id, date: t.date, description: t.description, amount: t.amount, type: t.type,
      category: t.category, account_id: t.accountId, status: t.status, payment_method: t.paymentMethod,
      notes: t.notes, attachment: t.attachment, reconciled: t.reconciled
    };
    const { data, error } = await supabase.from('transactions').insert([dbPayload]).select().single();
    if (data) setTransactions(prev => [mapTransaction(data), ...prev]);
  };

  const updateTransaction = async (updated: Transaction) => {
    const dbPayload = {
      date: updated.date, description: updated.description, amount: updated.amount, type: updated.type,
      category: updated.category, account_id: updated.accountId, status: updated.status,
      payment_method: updated.paymentMethod, notes: updated.notes, attachment: updated.attachment, reconciled: updated.reconciled
    };
    await supabase.from('transactions').update(dbPayload).eq('id', updated.id);
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const deleteTransaction = async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addAccount = async (a: Omit<Account, 'id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const dbPayload = { user_id: user.id, name: a.name, type: a.type, initial_balance: a.initialBalance, description: a.description };
    const { data } = await supabase.from('accounts').insert([dbPayload]).select().single();
    if (data) setAccounts(prev => [...prev, mapAccount(data)]);
  };

  const updateAccount = async (updated: Account) => {
    const dbPayload = { name: updated.name, type: updated.type, initial_balance: updated.initialBalance, description: updated.description };
    await supabase.from('accounts').update(dbPayload).eq('id', updated.id);
    setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  const deleteAccount = async (id: string) => {
    await supabase.from('accounts').delete().eq('id', id);
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const addCategory = async (c: Omit<Category, 'id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('categories').insert([{ ...c, user_id: user.id }]).select().single();
    if (data) setCategories(prev => [...prev, data]);
  };

  const updateCategory = async (id: string, name: string) => {
    await supabase.from('categories').update({ name }).eq('id', id);
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  };

  const deleteCategory = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addDocument = async (name: string, url: string, folder: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('documents').insert([{ name, file_url: url, folder, user_id: user.id }]).select().single();
    if (data) setDocuments(prev => [data, ...prev]);
  };

  const addBoardMember = async (m: Omit<BoardMember, 'id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const dbPayload = { user_id: user.id, name: m.name, role: m.role, term_start: m.termStart, term_end: m.termEnd, phone: m.phone, email: m.email };
    const { data } = await supabase.from('board_members').insert([dbPayload]).select().single();
    if (data) setBoardMembers(prev => [...prev, mapBoardMember(data)]);
  };

  const deleteBoardMember = async (id: string) => {
    await supabase.from('board_members').delete().eq('id', id);
    setBoardMembers(prev => prev.filter(m => m.id !== id));
  };

  const addProject = async (p: Omit<Project, 'id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const dbPayload = { user_id: user.id, title: p.title, description: p.description, status: p.status, start_date: p.startDate, end_date: p.endDate, budget: p.budget };
    const { data } = await supabase.from('projects').insert([dbPayload]).select().single();
    if (data) setProjects(prev => [mapProject(data), ...prev]);
  };

  const updateProject = async (p: Project) => {
    const dbPayload = { title: p.title, description: p.description, status: p.status, start_date: p.startDate, end_date: p.endDate, budget: p.budget };
    await supabase.from('projects').update(dbPayload).eq('id', p.id);
    setProjects(prev => prev.map(proj => proj.id === p.id ? p : proj));
  };

  const deleteProject = async (id: string) => {
    await supabase.from('projects').delete().eq('id', id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const addOfficialDocument = async (d: Omit<OfficialDocument, 'id' | 'created_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('official_documents').insert([{ ...d, user_id: user.id }]).select().single();
    if (data) setOfficialDocuments(prev => [data, ...prev]);
  };

  const deleteOfficialDocument = async (id: string) => {
    await supabase.from('official_documents').delete().eq('id', id);
    setOfficialDocuments(prev => prev.filter(d => d.id !== id));
  };

  const getSummary = (): FinancialSummary => {
    return transactions.reduce((acc, t) => {
      const isIncome = t.type === 'income';
      const isCompleted = t.status === 'completed';
      if (isIncome) {
        if (isCompleted) acc.totalIncome += t.amount;
        else acc.pendingIncome += t.amount;
      } else {
        if (isCompleted) acc.totalExpense += t.amount;
        else acc.pendingExpense += t.amount;
      }
      if (isCompleted) acc.balance += isIncome ? t.amount : -t.amount;
      return acc;
    }, { totalIncome: 0, totalExpense: 0, balance: 0, pendingIncome: 0, pendingExpense: 0 });
  };

  return (
    <FinanceContext.Provider value={{
      transactions, categories, accounts, documents, boardMembers, projects, officialDocuments, associationName, loading,
      updateAssociationName, addTransaction, updateTransaction, deleteTransaction,
      addAccount, updateAccount, deleteAccount, addCategory, updateCategory, deleteCategory,
      addDocument, addBoardMember, deleteBoardMember, addProject, updateProject, deleteProject,
      addOfficialDocument, deleteOfficialDocument, fetchInitialData, getSummary
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance deve ser usado dentro de um FinanceProvider');
  return context;
};
