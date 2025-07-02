import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserAvatar, UserAvatarWithInfo } from "@/components/ui/user-avatar";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { useQuery } from "@tanstack/react-query";
import type { User } from "../../../shared/schema";
import { Power } from "lucide-react";
import { useTheme } from "next-themes";
import clsx from "clsx";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

export default function Header({ title, subtitle, onMenuToggle }: HeaderProps) {
  const { toast } = useToast();
  const theme = useTheme();
  
  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header
      className={clsx(
        'w-full h-28 min-h-[7rem] bg-white dark:bg-slate-900/80 shadow flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700',
        theme.theme === 'windows11' ? '[background:var(--sidebar-top-bar)]' : ''
      )}
      style={theme.theme === "windows11" ? { background: "var(--sidebar-top-bar)" } : undefined}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden p-2 text-slate-400 hover:text-blue-600"
          onClick={onMenuToggle}
        >
          <span className="text-lg">☰</span>
        </Button>
        <span className="text-xl font-bold text-blue-700 dark:text-blue-300">{title}</span>
        {subtitle && <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</span>}
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 text-slate-400 hover:text-blue-600"
        >
          <span className="text-lg">🔔</span>
          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </Button>
        <ThemeSelector />
        <div className="flex items-center gap-2">
          <UserAvatar user={currentUser || null} size="lg" className="h-16 w-16 rounded-full object-cover ring-2 ring-blue-200" />
          {currentUser && (
            <span className="hidden sm:inline text-base font-semibold text-slate-900 dark:text-white truncate max-w-xs">
              {currentUser.firstName && currentUser.lastName
                ? `${currentUser.firstName} ${currentUser.lastName}`
                : currentUser.username}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-500 hover:text-white hover:bg-red-500/80 focus:ring-2 focus:ring-red-400 shadow-lg shadow-red-500/50"
            title="Logout"
          >
            <Power className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
