
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Medal, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AchievementNotificationProps {
  title: string;
  description: string;
  points?: number;
  icon?: 'trophy' | 'award' | 'medal' | 'star';
  onDismiss?: () => void;
  className?: string;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  title,
  description,
  points = 0,
  icon = 'trophy',
  onDismiss,
  className = '',
}) => {
  const renderIcon = () => {
    const iconProps = { className: "h-6 w-6 text-yellow-400" };
    
    switch (icon) {
      case 'award':
        return <Award {...iconProps} />;
      case 'medal':
        return <Medal {...iconProps} />;
      case 'star':
        return <Star {...iconProps} />;
      default:
        return <Trophy {...iconProps} />;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`w-full max-w-md mx-auto ${className}`}
    >
      <Card className="bg-quantum-darkBlue/70 border-2 border-quantum-purple overflow-hidden shadow-glow">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-quantum-purple/30 to-quantum-cyan/30 p-4 flex items-center">
            <div className="bg-quantum-black/50 p-2 rounded-full mr-4">
              {renderIcon()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Achievement Unlocked!</h3>
              <p className="text-sm text-gray-300">You've earned {points} points</p>
            </div>
          </div>
          
          <div className="p-4 space-y-2">
            <h4 className="font-semibold text-quantum-cyan">{title}</h4>
            <p className="text-sm text-gray-300">{description}</p>
            
            <div className="flex justify-end pt-2">
              <Button 
                onClick={onDismiss}
                variant="outline"
                size="sm" 
                className="text-xs"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AchievementNotification;
