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
      whileHover={{ scale: 1.02 }}
      className={`rounded-xl p-4 ${variantClasses[variant]}`}
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-medium opacity-80">
        {icon}
        {label}
      </div>
      <div className="text-lg font-bold">{value}</div>
    </motion.div>
  );
}
