import { useMemo } from "react";
import { Wallet, TrendingUp, TrendingDown, LogOut } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/PageShell";
import StatCard from "@/components/StatCard";
import { useTransactions, useProfile } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { formatRupiah, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { signOut } = useAuth();
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: profile } = useProfile();

  const { totalIncome, totalExpense, balance, chartData } = useMemo(() => {
    let inc = 0, exp = 0;
    const byDate: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((t) => {
      if (t.type === "income") inc += t.amount;
      else exp += t.amount;
      if (!byDate[t.date]) byDate[t.date] = { income: 0, expense: 0 };
      byDate[t.date][t.type as "income" | "expense"] += t.amount;
    });

    const sorted = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({ date: new Date(date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }), ...vals }));

    return { totalIncome: inc, totalExpense: exp, balance: inc - exp, chartData: sorted };
  }, [transactions]);

  const recentTx = transactions.slice(0, 5);

  return (
    <PageShell
      title={profile?.display_name ? `Halo, ${profile.display_name.split(" ")[0]}` : "Dashboard"}
      action={
        <button onClick={signOut} className="rounded-full p-2 hover:bg-secondary" title="Keluar">
          <LogOut size={20} className="text-muted-foreground" />
        </button>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            <StatCard label="Total Saldo" value={formatRupiah(balance)} icon={<Wallet size={16} />} variant="primary" />
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Pemasukan" value={formatRupiah(totalIncome)} icon={<TrendingUp size={16} />} variant="income" />
              <StatCard label="Pengeluaran" value={formatRupiah(totalExpense)} icon={<TrendingDown size={16} />} variant="expense" />
            </div>
          </div>

          {chartData.length > 0 && (
            <div className="mb-6 rounded-xl bg-card p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Grafik Keuangan</h2>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(160 60% 45%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(160 60% 45%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(0 72% 51%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(0 72% 51%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(220 9% 46%)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(220 9% 46%)" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`} />
                  <Tooltip formatter={(v: number) => formatRupiah(v)} />
                  <Area type="monotone" dataKey="income" stroke="hsl(160 60% 45%)" fill="url(#incGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expense" stroke="hsl(0 72% 51%)" fill="url(#expGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="rounded-xl bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Transaksi Terbaru</h2>
            {recentTx.length === 0 && <p className="py-4 text-center text-xs text-muted-foreground">Belum ada transaksi</p>}
            <AnimatePresence>
              {recentTx.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between border-b border-border py-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{tx.category} · {formatDate(tx.date)}</p>
                  </div>
                  <Badge variant="outline" className={tx.type === "income" ? "border-income text-income" : "border-expense text-expense"}>
                    {tx.type === "income" ? "+" : "-"}{formatRupiah(tx.amount)}
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </PageShell>
  );
}
