
import React from 'react';
import { useTheme } from "@/components/theme-provider";
import { Switch } from "@/components/ui/switch";
import { getThemeIcon } from '@/utils/theme/themeIconUtils';

const NavbarThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <Switch
      checked={theme === 'dark'}
      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
    >
      {getThemeIcon(theme)}
      <span className="sr-only">Toggle dark mode</span>
    </Switch>
  );
};

export default NavbarThemeToggle;
