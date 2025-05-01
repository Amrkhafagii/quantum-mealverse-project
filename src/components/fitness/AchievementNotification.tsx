
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface AchievementNotificationProps {
  title: string;
  description: string;
  isVisible: boolean;
  onClose: () => void;
  points?: number;
  level?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  title,
  description,
  isVisible,
  onClose,
  points = 10,
  level = 'bronze'
}) => {
  // Trigger confetti when achievement is shown
  React.useEffect(() => {
    if (isVisible) {
      const colors = {
        bronze: ['#CD7F32', '#B87333'],
        silver: ['#C0C0C0', '#D8D8D8'],
        gold: ['#FFD700', '#FFC125'],
        platinum: ['#E5E4E2', '#A9F8F7']
      };
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors[level]
      });
    }
  }, [isVisible, level]);
  
  const getBadgeColor = () => {
    switch (level) {
      case 'bronze': return 'bg-amber-600';
      case 'silver': return 'bg-slate-300';
      case 'gold': return 'bg-yellow-400';
      case 'platinum': return 'bg-quantum-purple';
      default: return 'bg-amber-600';
    }
  };
  
  const getAchievementIcon = () => {
    switch (level) {
      case 'bronze': return <Award className="h-8 w-8 text-amber-600" />;
      case 'silver': return <Award className="h-8 w-8 text-slate-300" />;
      case 'gold': return <Trophy className="h-8 w-8 text-yellow-400" />;
      case 'platinum': return <Star className="h-8 w-8 text-quantum-purple" />;
      default: return <Award className="h-8 w-8 text-amber-600" />;
    }
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-11/12"
        >
          <div className="bg-gradient-to-r from-quantum-purple/90 to-quantum-cyan/90 backdrop-blur-lg rounded-lg shadow-lg border border-quantum-cyan p-4 relative">
            <motion.div 
              className="absolute -top-6 left-1/2 transform -translate-x-1/2 rounded-full p-2 border-2 border-quantum-cyan"
              initial={{ rotate: 0, scale: 0.5 }}
              animate={{ rotate: 360, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              {getAchievementIcon()}
            </motion.div>
            
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="pt-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h3 className="text-center font-bold text-lg text-white mt-2">Achievement Unlocked!</h3>
                <h4 className="text-center font-medium text-white">{title}</h4>
                <p className="text-center text-gray-100 text-sm mt-2">{description}</p>
              </motion.div>
              
              <motion.div 
                className="mt-3 bg-quantum-black/30 py-1.5 px-3 rounded-full mx-auto w-fit"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
              >
                <span className="flex items-center justify-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  <span className="font-bold text-white">+{points} points</span>
                </span>
              </motion.div>
              
              <motion.div
                className="mt-3 flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
              >
                <Button
                  size="sm"
                  onClick={onClose}
                  className="bg-white text-quantum-purple"
                >
                  Awesome!
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementNotification;
