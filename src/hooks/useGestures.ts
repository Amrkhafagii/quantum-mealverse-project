
import { useState, useRef, useEffect } from 'react';

interface GestureCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchIn?: () => void;
  onPinchOut?: () => void;
  onDoubleTap?: () => void;
}

interface GestureOptions {
  swipeThreshold?: number;
  pinchThreshold?: number;
  doubleTapDelay?: number;
}

export function useGestures(
  elementRef: React.RefObject<HTMLElement>,
  callbacks: GestureCallbacks,
  options: GestureOptions = {}
) {
  const {
    swipeThreshold = 50,
    pinchThreshold = 0.1,
    doubleTapDelay = 300
  } = options;
  
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const pinchStartRef = useRef<number | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // Single touch - could be swipe
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now()
        };
        
        // Check for double tap
        const tapTime = Date.now();
        if (tapTime - lastTapTimeRef.current < doubleTapDelay) {
          callbacks.onDoubleTap?.();
        }
        lastTapTimeRef.current = tapTime;
      } 
      else if (e.touches.length === 2) {
        // Two touches - could be pinch
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        // Calculate initial pinch distance
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        pinchStartRef.current = distance;
      }
      
      setIsActive(true);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      
      // Handle pinch gesture
      if (e.touches.length === 2 && pinchStartRef.current !== null) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        const pinchRatio = currentDistance / pinchStartRef.current;
        
        if (pinchRatio > 1 + pinchThreshold && callbacks.onPinchOut) {
          callbacks.onPinchOut();
          pinchStartRef.current = currentDistance; // Reset to avoid multiple triggers
        } else if (pinchRatio < 1 - pinchThreshold && callbacks.onPinchIn) {
          callbacks.onPinchIn();
          pinchStartRef.current = currentDistance; // Reset to avoid multiple triggers
        }
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      
      touchEndRef.current = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
        time: Date.now()
      };
      
      // Calculate swipe direction and distance
      const deltaX = touchEndRef.current.x - touchStartRef.current.x;
      const deltaY = touchEndRef.current.y - touchStartRef.current.y;
      
      // Check if it's a horizontal or vertical swipe
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > swipeThreshold) {
          if (deltaX > 0 && callbacks.onSwipeRight) {
            callbacks.onSwipeRight();
          } else if (deltaX < 0 && callbacks.onSwipeLeft) {
            callbacks.onSwipeLeft();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > swipeThreshold) {
          if (deltaY > 0 && callbacks.onSwipeDown) {
            callbacks.onSwipeDown();
          } else if (deltaY < 0 && callbacks.onSwipeUp) {
            callbacks.onSwipeUp();
          }
        }
      }
      
      touchStartRef.current = null;
      pinchStartRef.current = null;
      setIsActive(false);
    };
    
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    callbacks.onDoubleTap,
    callbacks.onPinchIn,
    callbacks.onPinchOut,
    callbacks.onSwipeDown,
    callbacks.onSwipeLeft,
    callbacks.onSwipeRight,
    callbacks.onSwipeUp,
    doubleTapDelay,
    elementRef,
    pinchThreshold,
    swipeThreshold
  ]);
  
  return { isActive };
}
