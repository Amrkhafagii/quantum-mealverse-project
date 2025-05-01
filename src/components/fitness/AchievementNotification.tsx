
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AchievementNotificationProps {
  title: string;
  description: string;
  isVisible: boolean;
  onClose: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  title,
  description,
  isVisible,
  onClose
}) => {
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
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-quantum-purple rounded-full p-2 border-2 border-quantum-cyan">
              <Award className="h-8 w-8 text-yellow-300" />
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="pt-4">
              <h3 className="text-center font-bold text-lg text-white mt-2">Achievement Unlocked!</h3>
              <h4 className="text-center font-medium text-white">{title}</h4>
              <p className="text-center text-gray-100 text-sm mt-2">{description}</p>
              
              <motion.div
                className="mt-3 flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
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
