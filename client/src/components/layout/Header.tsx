import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserAvatar, UserAvatarWithInfo } from "@/components/ui/user-avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useQuery } from "@tanstack/react-query";
import type { User } from "../../../shared/schema";
import { Power } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

export default function Header({ title, subtitle, onMenuToggle }: HeaderProps) {
  const { toast } = useToast();
  
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
      // Instead of reloading, invalidate the auth query to trigger re-authentication
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Force a page reload to reset the entire app state
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
    <header className="w-full h-28 min-h-[7rem] bg-gradient-to-r from-blue-100 to-indigo-200 dark:from-slate-800 dark:to-slate-700 shadow-lg flex items-center justify-between px-6 border-b border-blue-300 dark:border-slate-600">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden p-2 text-slate-400 hover:text-blue-600"
          onClick={onMenuToggle}
        >
          <span className="text-lg">☰</span>
        </Button>
        
        <div className="flex flex-col">
          <span className="text-xl font-bold text-blue-800 dark:text-blue-200">{title}</span>
          {subtitle && <span className="text-sm text-slate-700 dark:text-slate-300">{subtitle}</span>}
        </div>
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
        <ThemeToggle />
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
