
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface HolographicCardProps {
  className?: string;
  children: React.ReactNode;
  glowColor?: string;
  onClick?: () => void;
}

const HolographicCard: React.FC<HolographicCardProps> = ({
  className,
  children,
  glowColor = 'rgba(0, 245, 212, 0.5)',
  onClick,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <div
      className={cn(
        'holographic-card transition-all duration-200 cursor-pointer group',
        className
      )}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      style={{
        '--x': `${mousePosition.x}%`,
        '--y': `${mousePosition.y}%`,
        '--glow-color': glowColor,
      } as React.CSSProperties}
    >
      <div className="relative z-10 p-5 backdrop-blur-sm">
        {children}
      </div>
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at var(--x) var(--y), var(--glow-color), transparent 50%)`,
        }}
      />
      <div className="absolute inset-0 opacity-30 group-hover:opacity-0 transition-opacity duration-300">
        <div className="h-full w-full bg-gradient-to-br from-quantum-cyan/10 to-quantum-purple/10" />
      </div>
    </div>
  );
};

export default HolographicCard;
