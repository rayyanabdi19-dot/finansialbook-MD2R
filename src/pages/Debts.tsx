import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle, CalendarIcon, History, CreditCard, PenLine, PartyPopper } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import PageShell from "@/components/PageShell";
import { useDebts, useAddDebt, useDeleteDebt, usePayDebt, useDebtHistory } from "@/hooks/use-data";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

function DebtTimeline({ debtId }: { debtId: string }) {
  const { data: history = [], isLoading } = useDebtHistory(debtId);

  if (isLoading) return <Skeleton className="h-16 mt-2" />;
  if (history.length === 0) return null;

  const actionConfig: Record<string, { icon: typeof CreditCard; label: string; color: string }> = {
    created: { icon: PenLine, label: "Dibuat", color: "text-primary" },
    payment: { icon: CreditCard, label: "Pembayaran", color: "text-income" },
    edited: { icon: PenLine, label: "Diedit", color: "text-muted-foreground" },
    paid_off: { icon: PartyPopper, label: "Lunas", color: "text-income" },
  };

  return (
    <div className="mt-3 space-y-0">
      <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
        <History size={12} /> Riwayat Aktivitas
      </p>
      <div className="relative pl-4 border-l-2 border-border space-y-2">
        {history.map((h) => {
          const cfg = actionConfig[h.action] || actionConfig.created;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className={`absolute -left-[21px] top-0.5 h-4 w-4 rounded-full bg-card border-2 border-current flex items-center justify-center ${cfg.color}`}>
                <Icon size={8} />
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold uppercase ${cfg.color}`}>{cfg.label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(h.action_date), "dd MMM yyyy", { locale: localeId })}
                  </span>
                </div>
                {h.amount && h.action === "payment" && (
                  <p className="text-xs font-medium text-foreground">{formatRupiah(h.amount)}</p>
                )}
                {h.note && <p className="text-[11px] text-muted-foreground">{h.note}</p>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function Debts() {
  const { data: debts = [], isLoading } = useDebts();
  const addMutation = useAddDebt();
  const deleteMutation = useDeleteDebt();
  const payMutation = usePayDebt();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [paid, setPaid] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [payId, setPayId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState<Date | undefined>(new Date());
  const [historyId, setHistoryId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!name.trim() || !parseFloat(amount)) return;
    const paidAmt = parseFloat(paid) || 0;
    const totalAmt = parseFloat(amount);
    addMutation.mutate({
      name: name.trim(),
      amount: totalAmt,
      paid: paidAmt,
      due_date: dueDate ? dueDate.toISOString().split("T")[0] : null,
      is_paid_off: paidAmt >= totalAmt,
    });
    setName(""); setAmount(""); setPaid(""); setDueDate(undefined);
    setOpen(false);
  };

  const handlePay = (id: string) => {
    const amt = parseFloat(payAmount);
    if (!amt) return;
    const actionDate = payDate ? payDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
    payMutation.mutate({ id, amount: amt, actionDate });
    setPayAmount(""); setPayId(null); setPayDate(new Date());
  };

  const activeDebts = debts.filter((d) => !d.is_paid_off);
  const paidDebts = debts.filter((d) => d.is_paid_off);

  return (
    <PageShell
      title="Hutang"
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus size={16} /> Tambah</Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Tambah Hutang</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nama / keterangan" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} />
              <Input type="number" placeholder="Total hutang (Rp)" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Input type="number" placeholder="Sudah dibayar (Rp)" value={paid} onChange={(e) => setPaid(e.target.value)} />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "dd MMMM yyyy", { locale: localeId }) : "Pilih jatuh tempo"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <Button onClick={handleSubmit} className="w-full" disabled={addMutation.isPending}>Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {isLoading ? (
        <div className="space-y-2">{[1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : (
        <>
          {activeDebts.length > 0 && <h2 className="mb-2 text-sm font-semibold text-foreground">Belum Lunas</h2>}
          <div className="space-y-2 mb-6">
            <AnimatePresence>
              {activeDebts.map((d, i) => {
                const pct = d.amount > 0 ? Math.round((d.paid / d.amount) * 100) : 0;
                return (
                  <motion.div key={d.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ delay: i * 0.05 }} className="rounded-xl bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Circle size={18} className="text-debt" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{d.name}</p>
                          {d.due_date && <p className="text-xs text-muted-foreground">Jatuh tempo: {new Date(d.due_date).toLocaleDateString("id-ID")}</p>}
                        </div>
                      </div>
                      <button onClick={() => deleteMutation.mutate(d.id)} className="rounded p-1 hover:bg-expense-light"><Trash2 size={14} className="text-expense" /></button>
                    </div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Dibayar: {formatRupiah(d.paid)}</span>
                      <span>{formatRupiah(d.amount)}</span>
                    </div>
                    <Progress value={pct} className="h-2 mb-1" />
                    <p className="text-right text-xs font-medium text-debt">{pct}%</p>

                    {payId === d.id ? (
                      <div className="mt-3 space-y-2 rounded-lg border border-border p-3">
                        <p className="text-xs font-medium text-foreground">Pembayaran Hutang</p>
                        <Input type="number" placeholder="Jumlah bayar (Rp)" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="h-9 text-sm" />
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className={cn("w-full justify-start text-left font-normal h-9", !payDate && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                              {payDate ? format(payDate, "dd MMM yyyy", { locale: localeId }) : "Tanggal bayar"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={payDate} onSelect={setPayDate} initialFocus className="p-3 pointer-events-auto" />
                          </PopoverContent>
                        </Popover>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handlePay(d.id)} className="flex-1 h-8 bg-debt hover:bg-debt/90 text-primary-foreground" disabled={payMutation.isPending}>Bayar</Button>
                          <Button size="sm" variant="ghost" onClick={() => { setPayId(null); setPayAmount(""); setPayDate(new Date()); }} className="h-8">Batal</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setPayId(d.id); setPayDate(new Date()); }}>+ Bayar</Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => setHistoryId(historyId === d.id ? null : d.id)}>
                          <History size={12} /> Riwayat
                        </Button>
                      </div>
                    )}

                    <AnimatePresence>
                      {historyId === d.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                          <DebtTimeline debtId={d.id} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {paidDebts.length > 0 && <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Lunas</h2>}
          <div className="space-y-2">
            {paidDebts.map((d) => (
              <div key={d.id} className="rounded-xl bg-card/60 p-3 opacity-60">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-income" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground line-through">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{formatRupiah(d.amount)}</p>
                  </div>
                  <button onClick={() => deleteMutation.mutate(d.id)} className="rounded p-1 hover:bg-expense-light"><Trash2 size={14} className="text-expense" /></button>
                </div>
                <Button size="sm" variant="ghost" className="h-6 text-xs gap-1 mt-1 ml-7" onClick={() => setHistoryId(historyId === d.id ? null : d.id)}>
                  <History size={10} /> Riwayat
                </Button>
                <AnimatePresence>
                  {historyId === d.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <DebtTimeline debtId={d.id} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {debts.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">Belum ada hutang 🎉</p>}
        </>
      )}
    </PageShell>
  );
}
