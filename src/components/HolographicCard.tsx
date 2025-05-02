
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface HolographicCardProps {
  className?: string;
  children: React.ReactNode;
  glowColor?: string;
  onClick?: () => void;
  ariaLabel?: string; // Added aria-label support
}

const HolographicCard: React.FC<HolographicCardProps> = ({
  className,
  children,
  glowColor = 'rgba(0, 245, 212, 0.5)',
  onClick,
  ariaLabel,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <div
      className={cn(
        'holographic-card transition-all duration-200 cursor-pointer group relative rounded-xl overflow-hidden',
        className
      )}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        '--x': `${mousePosition.x}%`,
        '--y': `${mousePosition.y}%`,
        '--glow-color': glowColor,
      } as React.CSSProperties}
      role={onClick ? 'button' : 'region'}
      aria-label={ariaLabel}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-quantum-darkBlue/90 to-quantum-black opacity-80 z-0" aria-hidden="true"></div>
      
      {/* Content with backdrop blur */}
      <div className="relative z-10 backdrop-blur-sm">{children}</div>
      
      {/* Interactive glow effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(circle at var(--x) var(--y), var(--glow-color), transparent 70%)`,
        }}
        aria-hidden="true"
      />
      
      {/* Border glow for highlighted cards */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-500 z-0",
        className?.includes("border-quantum-purple") ? "opacity-10" : ""
      )}
      aria-hidden="true">
        <div className="h-full w-full bg-gradient-to-br from-quantum-cyan/20 to-quantum-purple/20" />
      </div>
      
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(to right, #00f5d420 1px, transparent 1px), linear-gradient(to bottom, #00f5d420 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
        aria-hidden="true"
      />
    </div>
  );
};

export default HolographicCard;
