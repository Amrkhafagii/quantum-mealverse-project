
import React, { createContext, useContext, useRef } from 'react';
import { useGestures } from '@/hooks/useGestures';
import { toast } from 'sonner';
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
  
  // Set up gesture detection on the container
  useGestures(containerRef, {
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
