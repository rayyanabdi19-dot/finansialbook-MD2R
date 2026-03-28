import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type DbTransaction = Database["public"]["Tables"]["transactions"]["Row"];
type DbDebt = Database["public"]["Tables"]["debts"]["Row"];
type DbSavingsGoal = Database["public"]["Tables"]["savings_goals"]["Row"];
type DbDebtHistory = Database["public"]["Tables"]["debt_history"]["Row"];

// Query helpers
export const api = {
  // Transactions
  async getTransactions() {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });
    if (error) throw error;
    return data as DbTransaction[];
  },
  async addTransaction(t: Omit<DbTransaction, "id" | "created_at" | "updated_at" | "user_id">) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("transactions")
      .insert({ ...t, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async updateTransaction(id: string, t: Partial<DbTransaction>) {
    const { error } = await supabase.from("transactions").update(t).eq("id", id);
    if (error) throw error;
  },
  async deleteTransaction(id: string) {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw error;
  },

  // Savings Goals
  async getSavingsGoals() {
    const { data, error } = await supabase
      .from("savings_goals")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as DbSavingsGoal[];
  },
  async addSavingsGoal(g: Omit<DbSavingsGoal, "id" | "created_at" | "updated_at" | "user_id">) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("savings_goals")
      .insert({ ...g, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async updateSavingsGoal(id: string, g: Partial<DbSavingsGoal>) {
    const { error } = await supabase.from("savings_goals").update(g).eq("id", id);
    if (error) throw error;
  },
  async deleteSavingsGoal(id: string) {
    const { error } = await supabase.from("savings_goals").delete().eq("id", id);
    if (error) throw error;
  },

  // Debts
  async getDebts() {
    const { data, error } = await supabase
      .from("debts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as DbDebt[];
  },
  async addDebt(d: Omit<DbDebt, "id" | "created_at" | "updated_at" | "user_id">) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("debts")
      .insert({ ...d, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    // Add created history
    await supabase.from("debt_history").insert({
      user_id: user.id,
      debt_id: data.id,
      action: "created",
      amount: d.amount,
      note: `Hutang "${d.name}" dibuat`,
    });
    return data;
  },
  async updateDebt(id: string, d: Partial<DbDebt>) {
    const { error } = await supabase.from("debts").update(d).eq("id", id);
    if (error) throw error;
  },
  async deleteDebt(id: string) {
    const { error } = await supabase.from("debts").delete().eq("id", id);
    if (error) throw error;
  },
  async payDebt(id: string, amount: number, actionDate: string, note?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { data: debt } = await supabase.from("debts").select("*").eq("id", id).single();
    if (!debt) throw new Error("Debt not found");
    const newPaid = Math.min(debt.paid + amount, debt.amount);
    const isPaidOff = newPaid >= debt.amount;
    await supabase.from("debts").update({ paid: newPaid, is_paid_off: isPaidOff }).eq("id", id);
    // Payment history
    await supabase.from("debt_history").insert({
      user_id: user.id,
      debt_id: id,
      action: "payment",
      amount,
      action_date: actionDate,
      note: note || `Pembayaran Rp ${amount.toLocaleString("id-ID")}`,
    });
    // Paid off history
    if (isPaidOff) {
      await supabase.from("debt_history").insert({
        user_id: user.id,
        debt_id: id,
        action: "paid_off",
        note: `Hutang "${debt.name}" lunas!`,
        action_date: actionDate,
      });
    }
    return { newPaid, isPaidOff };
  },

  // Debt History
  async getDebtHistory(debtId: string) {
    const { data, error } = await supabase
      .from("debt_history")
      .select("*")
      .eq("debt_id", debtId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as DbDebtHistory[];
  },

  // Profile
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
    return data;
  },
};
