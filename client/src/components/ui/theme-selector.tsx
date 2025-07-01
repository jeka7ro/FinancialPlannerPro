import React from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Palette, Sun, Moon, Laptop, Cloud, Zap, Monitor, Square } from "lucide-react";
import { useTheme } from "next-themes";

const themes = [
  { id: 'system', name: 'System', icon: Monitor, description: 'Follow system preference' },
  { id: 'light', name: 'Light', icon: Sun, description: 'Clean and minimal light theme' },
  { id: 'dark', name: 'Dark', icon: Moon, description: 'Professional dark theme' },
  { id: 'monterey', name: 'Monterey', icon: Laptop, description: 'Dark theme with deep purple tones' },
  { id: 'icloud', name: 'iCloud', icon: Cloud, description: 'Dark blue background theme' },
  { id: 'windows11', name: 'Windows 11', icon: Square, description: 'Modern Fluent Design theme' },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const currentTheme = themes.find(t => t.id === theme) || themes[0];
  const Icon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white hover:bg-white/10"
        >
          <Icon className="h-4 w-4 mr-2" />
          {currentTheme.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="theme-selector-dropdown border-white/10 text-white min-w-48">
        {themes.map((themeOption) => {
          const ThemeIcon = themeOption.icon;
          return (
            <DropdownMenuItem
              key={themeOption.id}
              onClick={() => setTheme(themeOption.id)}
              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-white/15 ${
                theme === themeOption.id ? 'bg-white/10' : ''
              }`}
            >
              <ThemeIcon className="h-4 w-4" />
              <div className="flex-1">
                <div className="font-medium">{themeOption.name}</div>
                <div className="text-xs text-slate-400">{themeOption.description}</div>
              </div>
              {theme === themeOption.id && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}