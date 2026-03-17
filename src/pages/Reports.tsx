import { useState, useMemo } from "react";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import PageShell from "@/components/PageShell";
import { useFinanceStore } from "@/lib/store";
import { formatRupiah } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export default function Reports() {
  const { transactions } = useFinanceStore();
  const [startDate, setStartDate] = useState("2026-03-01");
  const [endDate, setEndDate] = useState("2026-03-31");

  const filtered = useMemo(
    () => transactions.filter((t) => t.date >= startDate && t.date <= endDate),
    [transactions, startDate, endDate]
  );

  const { totalIncome, totalExpense, categoryData, monthlyData } = useMemo(() => {
    let inc = 0, exp = 0;
    const cats: Record<string, number> = {};
    const months: Record<string, { income: number; expense: number }> = {};

    filtered.forEach((t) => {
      if (t.type === "income") inc += t.amount; else exp += t.amount;
      if (t.type === "expense") cats[t.category] = (cats[t.category] || 0) + t.amount;

      const month = t.date.slice(0, 7);
      if (!months[month]) months[month] = { income: 0, expense: 0 };
      months[month][t.type] += t.amount;
    });

    return {
      totalIncome: inc,
      totalExpense: exp,
      categoryData: Object.entries(cats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      monthlyData: Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).map(([month, v]) => ({ month, ...v })),
    };
  }, [filtered]);

  const exportCSV = () => {
    const header = "Tanggal,Tipe,Kategori,Deskripsi,Jumlah\n";
    const rows = filtered.map((t) => `${t.date},${t.type === "income" ? "Pemasukan" : "Pengeluaran"},${t.category},"${t.description}",${t.amount}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `laporan_${startDate}_${endDate}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageShell title="Laporan">
      {/* Date Filter */}
      <div className="mb-4 flex gap-2">
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 text-sm" />
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 text-sm" />
      </div>

      {/* Summary */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-card p-3 text-center shadow-sm">
          <p className="text-xs text-muted-foreground">Transaksi</p>
          <p className="text-lg font-bold text-foreground">{filtered.length}</p>
        </div>
        <div className="rounded-lg bg-income-light p-3 text-center">
          <p className="text-xs text-income-foreground/70">Pemasukan</p>
          <p className="text-sm font-bold text-income">{formatRupiah(totalIncome)}</p>
        </div>
        <div className="rounded-lg bg-expense-light p-3 text-center">
          <p className="text-xs text-expense-foreground/70">Pengeluaran</p>
          <p className="text-sm font-bold text-expense">{formatRupiah(totalExpense)}</p>
        </div>
      </div>

      {/* Bar chart */}
      {monthlyData.length > 0 && (
        <div className="mb-4 rounded-xl bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Pemasukan vs Pengeluaran</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`} />
              <Tooltip formatter={(v: number) => formatRupiah(v)} />
              <Bar dataKey="income" fill="hsl(160 60% 45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pie chart */}
      {categoryData.length > 0 && (
        <div className="mb-4 rounded-xl bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Pengeluaran per Kategori</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatRupiah(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Export */}
      <Button variant="outline" className="w-full gap-2" onClick={exportCSV}>
        <Download size={16} /> Export CSV
      </Button>
    </PageShell>
  );
}
