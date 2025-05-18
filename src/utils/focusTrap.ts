
import { useRef, useEffect } from 'react';

// Define focusable selector - elements that can be tabbed to
const FOCUSABLE_ELEMENTS = 
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface UseFocusTrapOptions {
  isActive?: boolean;
  autoFocus?: boolean;
  returnFocusOnDeactivate?: boolean;
}

export function useFocusTrap({
  isActive = true, 
  autoFocus = true,
  returnFocusOnDeactivate = true,
}: UseFocusTrapOptions = {}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  
  // Lock focus inside the container when active
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Remember currently focused element to restore later
    if (returnFocusOnDeactivate) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
    }
    
    // Auto-focus the first element
    if (autoFocus && firstElement) {
      firstElement.focus();
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only respond to tab key
      if (e.key !== 'Tab') return;
      
      // SHIFT + TAB
      if (e.shiftKey) {
        // If we're on the first element, move to the last element
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } 
      // TAB
      else {
        // If we're on the last element, cycle back to the first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus when unmounting
      if (returnFocusOnDeactivate && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isActive, autoFocus, returnFocusOnDeactivate]);
  
  return { containerRef };
}
