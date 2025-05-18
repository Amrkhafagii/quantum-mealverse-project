
import React, { useState } from 'react';

interface SkipLinkProps {
  targetId: string;
  label?: string;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId,
  label = "Skip to content",
  className = "",
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <a
      href={`#${targetId}`}
      className={`
        fixed top-4 left-4 z-50 p-2 bg-background border border-border rounded-md
        transform transition-transform duration-200
        ${focused ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
        focus:translate-y-0 focus:opacity-100
        ${className}
      `}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {label}
    </a>
  );
};

export default SkipLink;
