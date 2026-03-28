import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/PageShell";
import { useTransactions, useAddTransaction, useUpdateTransaction, useDeleteTransaction } from "@/hooks/use-data";
import { formatRupiah, formatDate } from "@/lib/format";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, type TransactionType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Transactions() {
  const { data: transactions = [], isLoading } = useTransactions();
  const addMutation = useAddTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [filter, setFilter] = useState<"all" | TransactionType>("all");

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.type === filter);

  const resetForm = () => {
    setAmount(""); setCategory(""); setDescription(""); setDate(new Date().toISOString().split("T")[0]); setType("expense"); setEditId(null);
  };

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    if (!amt || !category || !description.trim()) return;
    if (editId) {
      updateMutation.mutate({ id: editId, data: { type, amount: amt, category, description: description.trim(), date } });
    } else {
      addMutation.mutate({ type, amount: amt, category, description: description.trim(), date });
    }
    resetForm();
    setOpen(false);
  };

  const handleEdit = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;
    setEditId(id); setType(tx.type as TransactionType); setAmount(String(tx.amount)); setCategory(tx.category); setDescription(tx.description || ""); setDate(tx.date);
    setOpen(true);
  };

  return (
    <PageShell
      title="Transaksi"
      action={
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus size={16} /> Tambah</Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{editId ? "Edit" : "Tambah"} Transaksi</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button variant={type === "income" ? "default" : "outline"} size="sm" onClick={() => { setType("income"); setCategory(""); }} className={type === "income" ? "bg-income hover:bg-income/90 text-income-foreground" : ""}>Pemasukan</Button>
                <Button variant={type === "expense" ? "default" : "outline"} size="sm" onClick={() => { setType("expense"); setCategory(""); }} className={type === "expense" ? "bg-expense hover:bg-expense/90 text-primary-foreground" : ""}>Pengeluaran</Button>
              </div>
              <Input type="number" placeholder="Jumlah (Rp)" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Kategori" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Deskripsi" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={100} />
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Button onClick={handleSubmit} className="w-full" disabled={addMutation.isPending || updateMutation.isPending}>
                {editId ? "Simpan" : "Tambah"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="mb-4 flex gap-2">
        {(["all", "income", "expense"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            {f === "all" ? "Semua" : f === "income" ? "Pemasukan" : "Pengeluaran"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((tx, i) => (
              <motion.div key={tx.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${tx.type === "income" ? "bg-income-light text-income" : "bg-expense-light text-expense"}`}>
                  {tx.type === "income" ? "+" : "-"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{tx.category} · {formatDate(tx.date)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${tx.type === "income" ? "text-income" : "text-expense"}`}>{formatRupiah(tx.amount)}</p>
                  <div className="flex gap-1 mt-1">
                    <button onClick={() => handleEdit(tx.id)} className="rounded p-1 hover:bg-secondary"><Pencil size={12} className="text-muted-foreground" /></button>
                    <button onClick={() => deleteMutation.mutate(tx.id)} className="rounded p-1 hover:bg-expense-light"><Trash2 size={12} className="text-expense" /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">Belum ada transaksi</p>}
        </div>
      )}
    </PageShell>
  );
}
