
import React from 'react';

export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-quantum-cyan text-quantum-black px-4 py-2 rounded-md font-medium transition-all duration-200"
    >
      Skip to main content
    </a>
  );
};

export default SkipToContent;
