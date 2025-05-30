
import React from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useNetworkQuality } from '@/responsive/core/hooks';
import { Card } from '@/components/ui/card';

interface AdaptiveFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
  adaptiveMode?: 'auto' | 'basic' | 'enhanced' | 'offline';
}

const AdaptiveForm: React.FC<AdaptiveFormProps> = ({
  children,
  onSubmit,
  className = '',
  adaptiveMode = 'auto'
}) => {
  const { isOnline } = useConnectionStatus();
  const { quality, isLowQuality } = useNetworkQuality();
  
  // Determine the appropriate form mode based on network conditions
  const formMode = adaptiveMode === 'auto' 
    ? !isOnline 
      ? 'offline'
      : isLowQuality
        ? 'basic'
        : 'enhanced' 
    : adaptiveMode;
  
  // Apply form mode-specific classnames and behaviors
  const formClassNames = {
    'offline': 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/20',
    'basic': '',
    'enhanced': '',
  }[formMode];
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (onSubmit) {
      onSubmit(e);
    }
  };
  
  return (
    <Card className={`p-4 ${formClassNames} ${className}`}>
      <form onSubmit={handleSubmit} data-form-mode={formMode}>
        {children}
      </form>
      
      {formMode === 'offline' && (
        <div className="mt-4 text-xs text-amber-600 dark:text-amber-400">
          You're currently offline. Form data will be saved locally and submitted when you're back online.
        </div>
      )}
    </Card>
  );
};

export default AdaptiveForm;
