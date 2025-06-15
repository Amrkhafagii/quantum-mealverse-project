
import { useMemo } from "react";
import { useResponsive } from "@/contexts/ResponsiveContext";

export interface PlatformStyleSet {
  input: string;
  error: string;
  label: string;
  description: string;
}

export function usePlatformStyles(): PlatformStyleSet {
  const {
    isPlatformIOS,
    isPlatformAndroid,
    isMobile,
    isDarkMode,
  } = useResponsive();

  /**
   * Centralized style utility for platform-aware fields
   */
  return useMemo(() => {
    // Base
    let inputBase =
      "block w-full shadow-sm text-sm border rounded-md py-2 px-3 focus:outline-none transition-colors";
    let labelBase = "block text-sm font-medium";
    let errorBase = "text-red-500 text-sm mt-1";
    let descBase = "text-gray-500 text-xs mt-1";
    if (isPlatformIOS) {
      inputBase += " ios-form focus:ring-blue-500 focus:border-blue-500";
    } else if (isPlatformAndroid) {
      inputBase += " android-form focus:ring-green-600 focus:border-green-600";
    } else if (isMobile) {
      inputBase += " focus:ring-blue-500 focus:border-blue-500";
    } else {
      inputBase += " focus:ring-blue-400 focus:border-blue-400";
    }
    if (isDarkMode) {
      inputBase += " bg-slate-900 text-white border-slate-500";
      labelBase += " text-slate-200";
      descBase = "text-slate-400 text-xs mt-1";
    } else {
      inputBase += " bg-white text-black border-gray-300";
      labelBase += " text-gray-700";
    }
    return {
      input: inputBase,
      error: errorBase,
      label: labelBase,
      description: descBase,
    };
  }, [isPlatformIOS, isPlatformAndroid, isMobile, isDarkMode]);
}
