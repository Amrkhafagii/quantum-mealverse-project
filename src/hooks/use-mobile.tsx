
import { useResponsive } from '@/contexts/ResponsiveContext';
import { Platform } from '@/utils/platform';

export const useIsMobile = () => {
  const { isMobile } = useResponsive();
  
  // On native platforms, we're always in a "mobile" context
  if (Platform.isNative) return true;
  
  return isMobile;
};
