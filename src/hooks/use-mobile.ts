
import { useResponsive } from '@/responsive/core/ResponsiveContext';

export function useMobile() {
  const { isMobile } = useResponsive();
  return isMobile;
}
