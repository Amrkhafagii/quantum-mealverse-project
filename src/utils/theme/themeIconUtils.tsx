
import React from 'react';
import { Sun, Moon } from 'lucide-react';

export const getThemeIcon = (theme: string) => {
  const iconClasses = "h-[1.2rem] w-[1.2rem] transition-all";
  
  if (theme === 'light') {
    return <Sun className={`${iconClasses} rotate-0 scale-100 dark:-rotate-90 dark:scale-0`} />;
  }
  
  return <Moon className={`${iconClasses} absolute rotate-90 scale-0 dark:rotate-0 dark:scale-100`} />;
};
