import { ReactNode } from "react";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

interface PageShellProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

export default function PageShell({ title, children, action }: PageShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto min-h-screen max-w-lg px-4 pb-24 pt-4 safe-top"
    >
      {/* Status bar area */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <div className="flex items-center gap-2">
          {action}
          <ThemeToggle />
        </div>
      </div>
      {children}
    </motion.div>
  );
}
