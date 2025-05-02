
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcut {
  key: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  description: string;
  action: () => void;
}

export const KeyboardNavigation = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'h',
        altKey: true,
        description: 'Navigate to home page',
        action: () => navigate('/')
      },
      {
        key: 'c',
        altKey: true,
        description: 'Navigate to cart',
        action: () => navigate('/cart')
      },
      {
        key: 'p',
        altKey: true,
        description: 'Navigate to profile',
        action: () => navigate('/profile')
      },
      {
        key: 's',
        altKey: true,
        description: 'Navigate to subscription page',
        action: () => navigate('/subscription')
      },
      {
        key: '/',
        description: 'Focus search input',
        action: () => {
          const searchInput = document.querySelector('#search-input') as HTMLElement;
          if (searchInput) {
            searchInput.focus();
          }
        }
      },
      {
        key: 'Escape',
        description: 'Close any open modal or dropdown',
        action: () => {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        }
      }
    ];
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in form elements
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '')) {
        return;
      }
      
      const shortcut = shortcuts.find(s => 
        s.key === event.key && 
        Boolean(s.altKey) === event.altKey && 
        Boolean(s.ctrlKey) === event.ctrlKey
      );
      
      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);
  
  // This component doesn't render anything
  return null;
};

export default KeyboardNavigation;
