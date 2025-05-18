
import { Platform } from './platform';

/**
 * A11y utility functions for cross-platform accessibility implementation
 */
export const AccessibilityUtils = {
  /**
   * Generate appropriate accessibility props based on platform
   * @param label - Accessibility label for screen readers
   * @param hint - Additional hint text for screen readers
   * @param role - ARIA role for web platforms
   * @param isDisabled - Whether the element is disabled
   */
  getAccessibilityProps(
    label: string,
    hint?: string,
    role?: string,
    isDisabled?: boolean
  ): Record<string, any> {
    // Web platform props (React DOM)
    if (Platform.isWeb) {
      return {
        'aria-label': label,
        'aria-describedby': hint,
        role: role || 'button',
        'aria-disabled': isDisabled ? 'true' : undefined,
        tabIndex: isDisabled ? -1 : 0,
      };
    }
    
    // Native platform props (React Native)
    return {
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: role || 'button',
      accessibilityState: isDisabled ? { disabled: true } : undefined,
    };
  },
  
  /**
   * Generate focus management props based on platform
   * @param onFocus - Handler for focus events
   * @param onBlur - Handler for blur events
   */
  getFocusProps(
    onFocus?: () => void,
    onBlur?: () => void
  ): Record<string, any> {
    if (Platform.isWeb) {
      return {
        onFocus,
        onBlur, 
      };
    }
    
    return {
      onAccessibilityFocus: onFocus,
      onAccessibilityBlur: onBlur,
    };
  },
  
  /**
   * Generate announcement text for screen readers
   * @param message - Message to announce
   * @param priority - Whether this is a high-priority announcement
   */
  announceForAccessibility(message: string, priority: boolean = false): void {
    if (Platform.isWeb) {
      // Create or get live region element
      let liveRegion = document.getElementById('a11y-announcer');
      
      if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'a11y-announcer';
        liveRegion.setAttribute('aria-live', priority ? 'assertive' : 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        liveRegion.style.clip = 'rect(0, 0, 0, 0)';
        document.body.appendChild(liveRegion);
      }
      
      // Set the announcement text
      liveRegion.textContent = '';
      // Force browser to register the change
      setTimeout(() => {
        if (liveRegion) {
          liveRegion.textContent = message;
        }
      }, 50);
    } else {
      // For native platforms, use platform-specific announcement APIs
      try {
        if (Platform.isIOS()) {
          // iOS implementation would use VoiceOver announcement API
          const { Accessibility } = require('@capacitor/accessibility');
          if (Accessibility?.announce) {
            Accessibility.announce({ value: message });
          }
        } else if (Platform.isAndroid()) {
          // Android implementation would use TalkBack announcement API
          const { Accessibility } = require('@capacitor/accessibility');
          if (Accessibility?.announce) {
            Accessibility.announce({ value: message, language: 'en' });
          }
        }
      } catch (e) {
        console.error('Error announcing for accessibility:', e);
      }
    }
  }
};

/**
 * Hook for managing keyboard focus
 */
export const useAccessibleFocus = () => {
  // Implementation would provide methods for managing focus
  // in an accessible way across platforms
  
  const setFocus = (elementId: string) => {
    if (Platform.isWeb) {
      const element = document.getElementById(elementId);
      if (element) {
        element.focus();
      }
    } else {
      // Native focus would be implemented using platform-specific APIs
    }
  };
  
  return { setFocus };
};
