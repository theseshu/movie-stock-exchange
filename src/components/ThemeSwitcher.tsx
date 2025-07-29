import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/hooks/useTheme';

const themes = [
  { value: 'dark', label: 'Dark Theme', icon: '🌙' },
  { value: 'light', label: 'Light Theme', icon: '☀️' },
  { value: 'contrast-blue', label: 'Blue Contrast', icon: '🔵' },
  { value: 'contrast-green', label: 'Green Contrast', icon: '🟢' },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  
  const currentTheme = themes.find(t => t.value === theme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Palette className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className={`cursor-pointer ${
              theme === themeOption.value ? 'bg-accent' : ''
            }`}
          >
            <span className="mr-3">{themeOption.icon}</span>
            <span>{themeOption.label}</span>
            {theme === themeOption.value && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}