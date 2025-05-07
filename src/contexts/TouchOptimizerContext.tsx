
import React, { createContext, useContext, useRef } from 'react';
import { hapticFeedback } from '@/utils/hapticFeedback';
import { Platform } from '@/utils/platform';

type TouchCallbacks = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchIn?: () => void;
  onPinchOut?: () => void;
  onDoubleTap?: () => void;
};

type TouchOptimizerContextType = {
  registerTouchCallbacks: (callbacks: TouchCallbacks) => void;
  unregisterTouchCallbacks: () => void;
  getContainerRef: () => React.RefObject<HTMLDivElement>;
  isMobileDevice: boolean;
};

const TouchOptimizerContext = createContext<TouchOptimizerContextType | null>(null);

// Simple gesture detection implementation
const useGestureDetection = (
  ref: React.RefObject<HTMLDivElement>,
  callbacks: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    onPinchIn?: () => void;
    onPinchOut?: () => void;
    onDoubleTap?: () => void;
  }
) => {
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    let touchStartX = 0;
    let touchStartY = 0;
    let lastTapTime = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      
      const now = new Date().getTime();
      const timeDiff = now - lastTapTime;
      if (timeDiff < 300 && callbacks.onDoubleTap) {
        callbacks.onDoubleTap();
        hapticFeedback.light();
      }
      lastTapTime = now;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;
      
      // Simple swipe detection
      const threshold = 50;
      
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > threshold && callbacks.onSwipeLeft) {
          callbacks.onSwipeLeft();
          hapticFeedback.medium();
        } else if (diffX < -threshold && callbacks.onSwipeRight) {
          callbacks.onSwipeRight();
          hapticFeedback.medium();
        }
      } else {
        // Vertical swipe
        if (diffY > threshold && callbacks.onSwipeUp) {
          callbacks.onSwipeUp();
          hapticFeedback.medium();
        } else if (diffY < -threshold && callbacks.onSwipeDown) {
          callbacks.onSwipeDown();
          hapticFeedback.medium();
        }
      }
    };
    
    el.addEventListener('touchstart', handleTouchStart);
    el.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, callbacks]);
};

export const TouchOptimizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef<TouchCallbacks>({});
  const isMobileDevice = Platform.isNative() || (typeof window !== 'undefined' && window.innerWidth < 768);
  
  // Register callbacks for child components to use
  const registerTouchCallbacks = (callbacks: TouchCallbacks) => {
    callbacksRef.current = { ...callbacksRef.current, ...callbacks };
  };
  
  // Unregister callbacks when component unmounts
  const unregisterTouchCallbacks = () => {
    callbacksRef.current = {};
  };
  
  // Use our custom hook instead of the imported useGestures
  useGestureDetection(containerRef, {
    onSwipeLeft: () => callbacksRef.current.onSwipeLeft?.(),
    onSwipeRight: () => callbacksRef.current.onSwipeRight?.(),
    onSwipeUp: () => callbacksRef.current.onSwipeUp?.(),
    onSwipeDown: () => callbacksRef.current.onSwipeDown?.(),
    onPinchIn: () => callbacksRef.current.onPinchIn?.(),
    onPinchOut: () => callbacksRef.current.onPinchOut?.(),
    onDoubleTap: () => callbacksRef.current.onDoubleTap?.(),
  });
  
  const getContainerRef = () => containerRef;
  
  return (
    <TouchOptimizerContext.Provider 
      value={{ 
        registerTouchCallbacks, 
        unregisterTouchCallbacks, 
        getContainerRef,
        isMobileDevice
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        {children}
      </div>
    </TouchOptimizerContext.Provider>
  );
};

export const useTouchOptimizer = () => {
  const context = useContext(TouchOptimizerContext);
  if (!context) {
    throw new Error('useTouchOptimizer must be used within a TouchOptimizerProvider');
  }
  return context;
};

// Convenience hook for touch-enhanced components
export const useTouchEnhanced = (callbacks: TouchCallbacks = {}) => {
  const { registerTouchCallbacks, unregisterTouchCallbacks, isMobileDevice } = useTouchOptimizer();
  
  React.useEffect(() => {
    registerTouchCallbacks(callbacks);
    return () => unregisterTouchCallbacks();
  }, [
    callbacks.onDoubleTap,
    callbacks.onPinchIn, 
    callbacks.onPinchOut,
    callbacks.onSwipeDown,
    callbacks.onSwipeLeft,
    callbacks.onSwipeRight,
    callbacks.onSwipeUp,
    registerTouchCallbacks,
    unregisterTouchCallbacks
  ]);
  
  return { isMobileDevice };
};
