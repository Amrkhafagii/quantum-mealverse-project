
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  description?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  description,
  icon = <AlertTriangle className="h-12 w-12 text-gray-400" />
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon}
      <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
        {message}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
};

export default EmptyState;
