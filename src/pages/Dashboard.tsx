import { useMemo } from "react";
import { Wallet, TrendingUp, TrendingDown, Bell } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/PageShell";
import StatCard from "@/components/StatCard";
import { useFinanceStore } from "@/lib/store";
import { formatRupiah, formatDate } from "@/lib/format";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { transactions, notifications, clearNotifications } = useFinanceStore();

  const { totalIncome, totalExpense, balance, chartData } = useMemo(() => {
    let inc = 0, exp = 0;
    const byDate: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((t) => {
      if (t.type === "income") inc += t.amount;
      else exp += t.amount;

      if (!byDate[t.date]) byDate[t.date] = { income: 0, expense: 0 };
      byDate[t.date][t.type] += t.amount;
    });

    const sorted = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({ date: new Date(date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }), ...vals }));

    return { totalIncome: inc, totalExpense: exp, balance: inc - exp, chartData: sorted };
  }, [transactions]);

  const recentTx = transactions.slice(0, 5);

  return (
    <PageShell
      title="Dashboard"
      action={
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative rounded-full p-2 hover:bg-secondary">
              <Bell size={20} className="text-muted-foreground" />
              {notifications.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-expense text-[9px] font-bold text-primary-foreground">
                  {notifications.length}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">Notifikasi</span>
              {notifications.length > 0 && (
                <button onClick={clearNotifications} className="text-xs text-muted-foreground hover:text-foreground">
                  Hapus semua
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">Tidak ada notifikasi</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {notifications.slice(0, 10).map((n) => (
                  <div key={n.id} className="text-xs text-muted-foreground border-b border-border pb-2 last:border-0">
                    {n.message}
                  </div>
                ))}
              </div>
            )}
          </PopoverContent>
        </Popover>
      }
    >
      {/* Stats */}
      <div className="space-y-3 mb-6">
        <StatCard label="Total Saldo" value={formatRupiah(balance)} icon={<Wallet size={16} />} variant="primary" />
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Pemasukan" value={formatRupiah(totalIncome)} icon={<TrendingUp size={16} />} variant="income" />
          <StatCard label="Pengeluaran" value={formatRupiah(totalExpense)} icon={<TrendingDown size={16} />} variant="expense" />
        </div>
      </div>

      {/* Chart */}
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

      {/* Recent Transactions */}
      <div className="rounded-xl bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Transaksi Terbaru</h2>
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
    </PageShell>
  );
}
