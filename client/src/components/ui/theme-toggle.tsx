import React from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const getThemeIcon = (themeName: string) => {
    switch (themeName) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'monterey':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const getThemeLabel = (themeName: string) => {
    switch (themeName) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'monterey':
        return 'Monterey';
      default:
        return 'Light';
    }
  };

  return (
    <Select value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'monterey')}>
      <SelectTrigger className="w-[140px] bg-transparent border-white/20 text-white hover:bg-white/10">
        <div className="flex items-center gap-2">
          {getThemeIcon(theme)}
          <SelectValue placeholder="Theme" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-slate-800 border-slate-700">
        <SelectItem value="light" className="text-white hover:bg-slate-700">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </div>
        </SelectItem>
        <SelectItem value="dark" className="text-white hover:bg-slate-700">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </div>
        </SelectItem>
        <SelectItem value="monterey" className="text-white hover:bg-slate-700">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Monterey</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
} 