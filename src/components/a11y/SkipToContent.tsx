
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface SkipToContentProps {
  contentId?: string;
  label?: string;
  className?: string;
}

/**
 * Skip link that allows keyboard users to bypass navigation
 * and jump straight to the main content area
 */
export const SkipToContent: React.FC<SkipToContentProps> = ({
  contentId = 'main-content',
  label = 'Skip to main content',
  className,
}) => {
  const [focused, setFocused] = useState(false);
  
  const handleClick = () => {
    // Find the main content element
    const mainContent = document.getElementById(contentId);
    
    if (mainContent) {
      // Set focus to the main content
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      
      // Add a small delay before removing the tabindex to prevent focus loss
      setTimeout(() => {
        mainContent.removeAttribute('tabindex');
      }, 100);
    }
  };
  
  return (
    <a
      href={`#${contentId}`}
      onClick={handleClick}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50',
        'focus:bg-primary focus:text-primary-foreground focus:p-3 focus:rounded',
        'transition-transform',
        focused ? 'scale-100' : 'scale-95',
        className
      )}
    >
      {label}
    </a>
  );
};

export default SkipToContent;
