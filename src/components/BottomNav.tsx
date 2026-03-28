import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, PiggyBank, HandCoins, FileBarChart } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/transactions", icon: ArrowLeftRight, label: "Transaksi" },
  { to: "/savings", icon: PiggyBank, label: "Tabungan" },
  { to: "/debts", icon: HandCoins, label: "Hutang" },
  { to: "/reports", icon: FileBarChart, label: "Laporan" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/90 backdrop-blur-xl safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around py-1.5">
        {tabs.map((tab) => {
          const active = location.pathname === tab.to;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1 active:scale-95 transition-transform"
            >
              {active && (
                <motion.div
                  layoutId="bottomnav-indicator"
                  className="absolute -top-1.5 h-0.5 w-8 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <tab.icon
                size={20}
                strokeWidth={active ? 2.5 : 1.8}
                className={active ? "text-primary" : "text-muted-foreground"}
              />
              <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
