import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ThemeSelector } from "@/components/ui/theme-selector";
// Import logo using public path
const cashpotLogo = "/cashpot-logo.png";

const navigation = [
  { name: "Dashboard", href: "/", icon: "📊" },
  { name: "Companies", href: "/companies", icon: "🏢" },
  { name: "Locations", href: "/locations", icon: "📍" },
  { name: "Providers", href: "/providers", icon: "🚚" },
  { name: "Cabinets", href: "/cabinets", icon: "🖥️" },
  { name: "Game Mixes", href: "/game-mixes", icon: "🍒" },
  { name: "Slots", href: "/slots", icon: "🎰" },
  { name: "Invoices", href: "/invoices", icon: "💰" },
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

  return (
    <div className={cn("sidebar-glass fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0", className)}>
      <div className="flex items-center justify-center h-20 px-6 border-b border-white/10">
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
      
      <nav className="mt-8 px-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "nav-item group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-blue-500/20 text-white"
                      : "text-slate-300 hover:text-white hover:bg-blue-500/10"
                  )}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </a>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
