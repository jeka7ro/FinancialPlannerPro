import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import clsx from "clsx";
// Import logo using public path
const cashpotLogo = "/cashpot-logo.png";

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
  { name: "Legal", href: "/legal", icon: "⚖️" },
  { name: "ONJN", href: "/onjn", icon: "🛡️" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const theme = useTheme();

  return (
    <div
      className={clsx(
        'sidebar-glass fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        theme.theme === 'windows11' ? '[background:var(--sidebar-top-bar)]' : '',
        className
      )}
      style={theme.theme === "windows11" ? { background: "var(--sidebar-top-bar)" } : undefined}
    >
      <div className="flex items-center justify-center h-28 px-6 border-b border-white/10 min-h-[7rem]">
        <div className="flex items-center justify-center w-full">
          <img 
            src={cashpotLogo} 
            alt="CASHPOT" 
            className="h-12 w-auto object-contain filter brightness-110"
            onLoad={() => console.log('Logo loaded successfully')}
            onError={(e) => {
              console.log('Logo failed to load, showing fallback');
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'text-white font-bold text-xl';
              fallback.textContent = 'CASHPOT';
              target.parentNode?.appendChild(fallback);
            }}
          />
        </div>
      </div>
      
      <nav className="mt-8 px-2">
        <ul className="flex flex-col gap-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors duration-200",
                      isActive
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-white"
                    )}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="truncate">{item.name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
