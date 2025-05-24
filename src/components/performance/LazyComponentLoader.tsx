
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LazyComponentLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export const LazyComponentLoader: React.FC<LazyComponentLoaderProps> = ({
  children,
  fallback,
  className = "min-h-[200px]"
}) => {
  const defaultFallback = (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center justify-center ${className}`}
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-quantum-cyan" />
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    </motion.div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

export default LazyComponentLoader;
