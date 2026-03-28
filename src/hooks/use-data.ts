import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/store";
import { useAuth } from "@/hooks/use-auth";

export function useTransactions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: api.getTransactions,
    enabled: !!user,
  });
}

export function useAddTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.addTransaction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.updateTransaction>[1] }) =>
      api.updateTransaction(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteTransaction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useSavingsGoals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["savings_goals", user?.id],
    queryFn: api.getSavingsGoals,
    enabled: !!user,
  });
}

export function useAddSavingsGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.addSavingsGoal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savings_goals"] }),
  });
}

export function useUpdateSavingsGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.updateSavingsGoal>[1] }) =>
      api.updateSavingsGoal(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savings_goals"] }),
  });
}

export function useDeleteSavingsGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteSavingsGoal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savings_goals"] }),
  });
}

export function useDebts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["debts", user?.id],
    queryFn: api.getDebts,
    enabled: !!user,
  });
}

export function useAddDebt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.addDebt,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["debts"] }),
  });
}

export function useUpdateDebt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.updateDebt>[1] }) =>
      api.updateDebt(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["debts"] }),
  });
}

export function useDeleteDebt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteDebt,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["debts"] }),
  });
}

export function usePayDebt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount, actionDate, note }: { id: string; amount: number; actionDate: string; note?: string }) =>
      api.payDebt(id, amount, actionDate, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["debts"] });
      qc.invalidateQueries({ queryKey: ["debt_history"] });
    },
  });
}

export function useDebtHistory(debtId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["debt_history", debtId],
    queryFn: () => api.getDebtHistory(debtId!),
    enabled: !!user && !!debtId,
  });
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: api.getProfile,
    enabled: !!user,
  });
}
