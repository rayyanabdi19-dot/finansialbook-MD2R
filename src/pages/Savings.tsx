import { useState } from "react";
import { Plus, Trash2, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/PageShell";
import { useFinanceStore } from "@/lib/store";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Savings() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [deadline, setDeadline] = useState("");
  const [addAmountId, setAddAmountId] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !parseFloat(target)) return;
    addSavingsGoal({ name: name.trim(), target: parseFloat(target), current: parseFloat(current) || 0, deadline });
    setName(""); setTarget(""); setCurrent(""); setDeadline("");
    setOpen(false);
  };

  const handleAddAmount = (id: string) => {
    const amt = parseFloat(addAmount);
    if (!amt) return;
    const goal = savingsGoals.find((g) => g.id === id);
    if (goal) updateSavingsGoal(id, { current: Math.min(goal.current + amt, goal.target) });
    setAddAmount(""); setAddAmountId(null);
  };

  return (
    <PageShell
      title="Tabungan"
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus size={16} /> Target Baru</Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Target Tabungan Baru</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nama target" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} />
              <Input type="number" placeholder="Target (Rp)" value={target} onChange={(e) => setTarget(e.target.value)} />
              <Input type="number" placeholder="Saldo awal (Rp)" value={current} onChange={(e) => setCurrent(e.target.value)} />
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              <Button onClick={handleSubmit} className="w-full">Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-3">
        <AnimatePresence>
          {savingsGoals.map((goal, i) => {
            const pct = Math.round((goal.current / goal.target) * 100);
            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-savings-light">
                      <Target size={16} className="text-savings" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{goal.name}</p>
                      {goal.deadline && <p className="text-xs text-muted-foreground">Target: {new Date(goal.deadline).toLocaleDateString("id-ID")}</p>}
                    </div>
                  </div>
                  <button onClick={() => deleteSavingsGoal(goal.id)} className="rounded p-1 hover:bg-expense-light">
                    <Trash2 size={14} className="text-expense" />
                  </button>
                </div>

                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>{formatRupiah(goal.current)}</span>
                  <span>{formatRupiah(goal.target)}</span>
                </div>
                <Progress value={pct} className="h-2.5 mb-1" />
                <p className="text-right text-xs font-medium text-savings">{pct}%</p>

                {addAmountId === goal.id ? (
                  <div className="mt-2 flex gap-2">
                    <Input type="number" placeholder="Jumlah" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} className="h-8 text-sm" />
                    <Button size="sm" onClick={() => handleAddAmount(goal.id)} className="h-8 bg-savings hover:bg-savings/90 text-primary-foreground">
                      Tambah
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setAddAmountId(null)} className="h-8">Batal</Button>
                  </div>
                ) : (
                  pct < 100 && (
                    <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={() => setAddAmountId(goal.id)}>
                      + Tambah Dana
                    </Button>
                  )
                )}
                {pct >= 100 && <p className="mt-2 text-xs font-semibold text-income">🎉 Target tercapai!</p>}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {savingsGoals.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">Belum ada target tabungan</p>}
      </div>
    </PageShell>
  );
}
