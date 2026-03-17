export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
}

export interface Debt {
  id: string;
  name: string;
  amount: number;
  paid: number;
  dueDate: string;
  isPaidOff: boolean;
}

export const INCOME_CATEGORIES = [
  "Gaji", "Freelance", "Investasi", "Bonus", "Hadiah", "Lainnya",
];

export const EXPENSE_CATEGORIES = [
  "Makanan", "Transportasi", "Belanja", "Tagihan", "Hiburan", "Kesehatan", "Pendidikan", "Lainnya",
];
