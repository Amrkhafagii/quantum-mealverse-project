
import { useCart } from '@/contexts/CartContext';
import { useCheckoutAuth } from './useCheckoutAuth';
import { useOrderSubmission } from './useOrderSubmission';
import { useEffect } from 'react';

export const useCheckout = () => {
  const { items, totalAmount, clearCart } = useCart();
  const { 
    loggedInUser, 
    hasDeliveryInfo, 
    defaultValues, 
    showLoginPrompt, 
    handleAuthSubmit 
  } = useCheckoutAuth();
  
  const { isSubmitting, handleSubmit } = useOrderSubmission(
    loggedInUser?.id,
    items,
    totalAmount,
    hasDeliveryInfo,
    clearCart
  );

  // Add debug code to check DOM elements on load/mount
  useEffect(() => {
    console.log("[Place Order Debug] useCheckout hook initialized");
    
    // Add a DOM-ready check to verify button existence
    const checkButtonExists = () => {
      const button = document.getElementById('place-order-button');
      const form = document.getElementById('delivery-form');
      
      console.log("[Place Order Debug] Button found:", !!button);
      console.log("[Place Order Debug] Form found:", !!form);
      
      if (button) {
        console.log("[Place Order Debug] Button properties:", {
          disabled: button.hasAttribute('disabled'),
          type: button.getAttribute('type'),
          classList: Array.from(button.classList),
          parentForm: button.closest('form'),
          computedStyles: {
            display: window.getComputedStyle(button).display,
            opacity: window.getComputedStyle(button).opacity,
            pointerEvents: window.getComputedStyle(button).pointerEvents,
            cursor: window.getComputedStyle(button).cursor,
          }
        });
        
        // Try to detect any other event listeners (though this is limited)
        console.log("[Place Order Debug] Component states:", {
          isSubmitting,
          hasItems: items.length > 0,
          userIsLoggedIn: !!loggedInUser,
          hasDeliveryInfo,
        });
      }
      
      if (form) {
        console.log("[Place Order Debug] Form properties:", {
          action: form.getAttribute('action'),
          method: form.getAttribute('method'),
          noValidate: form.hasAttribute('noValidate'),
          enctype: form.getAttribute('enctype'),
        });
        
        form.addEventListener('submit', (e) => {
          console.log("[Place Order Debug] Form submit event captured", {
            defaultPrevented: e.defaultPrevented,
            eventPhase: e.eventPhase,
            currentTarget: e.currentTarget,
            target: e.target,
            timeStamp: e.timeStamp
          });
        }, { once: false, capture: true });
      }
    };

    // Run check on mount
    checkButtonExists();
    
    // Also add event listener for when DOM is fully loaded
    window.addEventListener('DOMContentLoaded', () => {
      console.log("[Place Order Debug] DOM fully loaded, checking button again");
      checkButtonExists();
    });
    
    // Check again after a short delay in case components render asynchronously
    const timeoutId = setTimeout(() => {
      console.log("[Place Order Debug] Delayed check for button");
      checkButtonExists();
    }, 2000);
    
    return () => {
      clearTimeout(timeoutId);
      console.log("[Place Order Debug] useCheckout hook cleanup");
    };
  }, [isSubmitting, items.length, loggedInUser, hasDeliveryInfo]);

  return {
    items,
    isSubmitting,
    loggedInUser,
    hasDeliveryInfo,
    defaultValues,
    showLoginPrompt,
    handleAuthSubmit,
    handleSubmit
  };
};
