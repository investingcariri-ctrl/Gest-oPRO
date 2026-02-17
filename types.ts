
export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'cash' | 'check' | 'pix';
export type ProjectStatus = 'planned' | 'ongoing' | 'completed' | 'cancelled';
export type OfficialDocType = 'oficio' | 'comissao' | 'escala';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  budgetLimit?: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'savings';
  description?: string;
  initialBalance: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  accountId: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  attachment?: string;
  reconciled: boolean;
}

export interface BoardMember {
  id: string;
  name: string;
  role: string;
  termStart: string;
  termEnd: string;
  phone?: string;
  email?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  budget: number;
}

export interface OfficialDocument {
  id: string;
  type: OfficialDocType;
  title: string;
  content: any;
  created_at: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  pendingIncome: number;
  pendingExpense: number;
}

export interface AIAnalysisResult {
  summary: string;
  risks: string[];
  recommendations: string[];
  lastUpdated: string;
}
