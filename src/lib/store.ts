import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Transaction, SavingsGoal, Debt } from "./types";

interface FinanceStore {
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  debts: Debt[];
  notifications: { id: string; message: string; date: string }[];

  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  addSavingsGoal: (g: Omit<SavingsGoal, "id">) => void;
  updateSavingsGoal: (id: string, g: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;

  addDebt: (d: Omit<Debt, "id">) => void;
  updateDebt: (id: string, d: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;

  addNotification: (message: string) => void;
  clearNotifications: () => void;
}

const uid = () => crypto.randomUUID();

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      transactions: [
        { id: uid(), type: "income", amount: 8500000, category: "Gaji", description: "Gaji Maret", date: "2026-03-01" },
        { id: uid(), type: "expense", amount: 1200000, category: "Makanan", description: "Groceries", date: "2026-03-05" },
        { id: uid(), type: "expense", amount: 500000, category: "Transportasi", description: "Bensin", date: "2026-03-08" },
        { id: uid(), type: "income", amount: 2000000, category: "Freelance", description: "Project web", date: "2026-03-10" },
        { id: uid(), type: "expense", amount: 350000, category: "Hiburan", description: "Netflix & Spotify", date: "2026-03-12" },
        { id: uid(), type: "expense", amount: 800000, category: "Tagihan", description: "Listrik & Air", date: "2026-03-15" },
      ],
      savingsGoals: [
        { id: uid(), name: "Dana Darurat", target: 30000000, current: 12000000, deadline: "2026-12-31" },
        { id: uid(), name: "Liburan Bali", target: 5000000, current: 3200000, deadline: "2026-06-01" },
      ],
      debts: [
        { id: uid(), name: "Pinjaman Teman", amount: 2000000, paid: 500000, dueDate: "2026-04-15", isPaidOff: false },
        { id: uid(), name: "Cicilan Laptop", amount: 6000000, paid: 6000000, dueDate: "2026-03-01", isPaidOff: true },
      ],
      notifications: [],

      addTransaction: (t) =>
        set((s) => ({
          transactions: [{ ...t, id: uid() }, ...s.transactions],
          notifications: [{ id: uid(), message: `Transaksi ${t.type === "income" ? "pemasukan" : "pengeluaran"} Rp ${t.amount.toLocaleString("id-ID")} ditambahkan`, date: new Date().toISOString() }, ...s.notifications],
        })),
      updateTransaction: (id, t) =>
        set((s) => ({ transactions: s.transactions.map((x) => (x.id === id ? { ...x, ...t } : x)) })),
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) })),

      addSavingsGoal: (g) =>
        set((s) => ({ savingsGoals: [{ ...g, id: uid() }, ...s.savingsGoals] })),
      updateSavingsGoal: (id, g) =>
        set((s) => ({ savingsGoals: s.savingsGoals.map((x) => (x.id === id ? { ...x, ...g } : x)) })),
      deleteSavingsGoal: (id) =>
        set((s) => ({ savingsGoals: s.savingsGoals.filter((x) => x.id !== id) })),

      addDebt: (d) =>
        set((s) => ({ debts: [{ ...d, id: uid() }, ...s.debts] })),
      updateDebt: (id, d) =>
        set((s) => ({ debts: s.debts.map((x) => (x.id === id ? { ...x, ...d } : x)) })),
      deleteDebt: (id) =>
        set((s) => ({ debts: s.debts.filter((x) => x.id !== id) })),

      addNotification: (message) =>
        set((s) => ({ notifications: [{ id: uid(), message, date: new Date().toISOString() }, ...s.notifications] })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    { name: "finance-store" }
  )
);
