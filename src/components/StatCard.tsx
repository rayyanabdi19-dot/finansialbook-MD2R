import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  variant: "primary" | "income" | "expense";
}

const variantClasses = {
  primary: "gradient-primary text-primary-foreground",
  income: "bg-income-light text-income-foreground",
  expense: "bg-expense-light text-expense-foreground",
};

export default function StatCard({ label, value, icon, variant }: StatCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className={`rounded-2xl p-4 ${variantClasses[variant]} active:opacity-90 transition-opacity`}
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-medium opacity-80">
        {icon}
        {label}
      </div>
      <div className="text-lg font-bold tracking-tight">{value}</div>
    </motion.div>
  );
}
