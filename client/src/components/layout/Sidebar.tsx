import { Link, useLocation } from "wouter";
import { cn } from "../../lib/utils";
import clsx from "clsx";
import cashpotLogo from '../../assets/cashpot-logo.png';

interface SidebarProps {
  className?: string;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: "📊" },
  { name: "Companies", href: "/companies", icon: "🖤" },
  { name: "Locations", href: "/locations", icon: "♦️" },
  { name: "Providers", href: "/providers", icon: "♣️" },
  { name: "Cabinets", href: "/cabinets", icon: "❤️" },
  { name: "Game Mixes", href: "/game-mixes", icon: "🍒" },
  { name: "Slots", href: "/slots", icon: "🎰" },
  { name: "Invoices", href: "/invoices", icon: "🎲" },
  { name: "Rent Management", href: "/rent-management", icon: "🏠" },
  { name: "Users", href: "/users", icon: "👥" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
  { name: "Legal", href: "/legal", icon: "📋" },
];

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-slate-900/80 border-r border-slate-200 dark:border-slate-700 fixed lg:static inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out",
      className
    )}>
      {/* Logo Section - Same color as header */}
      <div className="flex items-center justify-center h-28 min-h-[7rem] bg-blue-800 dark:bg-slate-800 border-b border-blue-700 dark:border-slate-600 px-4">
        <div className="flex items-center gap-3">
          <img
            src={cashpotLogo}
            alt="Cashpot Logo"
            className="h-12 w-auto brightness-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div 
            className="hidden flex-col items-center justify-center text-white font-bold text-lg"
            style={{ display: 'none' }}
          >
            <span className="text-2xl">💰</span>
            <span className="text-sm">CASH</span>
            <span className="text-xs">POT</span>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                  : "text-slate-800 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
            💰
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              Cashpot Pro
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
              Financial Management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
