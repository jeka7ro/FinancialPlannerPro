import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserAvatar, UserAvatarWithInfo } from "@/components/ui/user-avatar";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
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
        'header',
        theme.theme === 'windows11' ? '[background:var(--sidebar-top-bar)]' : '',
        'glass-morphism h-28 flex items-center justify-between px-6 border-b border-white/10 min-h-[7rem]'
      )}
      style={theme.theme === "windows11" ? { background: "var(--sidebar-top-bar)" } : undefined}
    >
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-white/10"
          onClick={onMenuToggle}
        >
          <span className="text-lg">☰</span>
        </Button>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl"
        >
          <span className="text-lg">🔔</span>
          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </Button>
        
        {/* Theme Selector */}
        <ThemeSelector />
        
        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <UserAvatarWithInfo 
            user={currentUser || null} 
            className="flex sm:hidden"
          />
          <UserAvatar 
            user={currentUser || null} 
            size="lg"
            className="hidden sm:flex ring-2 ring-white/20"
          />
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
