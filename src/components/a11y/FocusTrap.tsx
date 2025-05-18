
import React, { useRef, useEffect } from 'react';

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  initialFocus?: boolean;
  returnFocusOnDeactivate?: boolean;
  className?: string;
}

/**
 * A component that traps focus within its children
 * Useful for modals, dialogs, and other overlay components
 */
export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active = true,
  initialFocus = true,
  returnFocusOnDeactivate = true,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  // Store the previously focused element when the trap becomes active
  useEffect(() => {
    if (active) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [active]);
  
  // Set initial focus when the trap becomes active
  useEffect(() => {
    if (!active || !initialFocus || !containerRef.current) return;
    
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    } else {
      containerRef.current.focus();
    }
  }, [active, initialFocus]);
  
  // Return focus to the previously focused element when the trap becomes inactive
  useEffect(() => {
    if (!returnFocusOnDeactivate) return;
    
    return () => {
      if (active && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [active, returnFocusOnDeactivate]);
  
  // Handle tabbing within the trap
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!active || !containerRef.current || e.key !== 'Tab') return;
    
    const focusableElements = Array.from(
      containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Shift+Tab from first element should focus the last element
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
    // Tab from last element should focus the first element
    else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };
  
  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      className={className}
      role="region"
    >
      {children}
    </div>
  );
};

export default FocusTrap;
