
import React from 'react';
import { useTheme } from "@/components/theme-provider";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from 'lucide-react';

const NavbarThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <Switch
      checked={theme === 'dark'}
      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
    >
      {theme === 'light' ? 
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" /> : 
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      }
      <span className="sr-only">Toggle dark mode</span>
    </Switch>
  );
};

export default NavbarThemeToggle;
