
import React from 'react';
import { motion } from 'framer-motion';
import { List, Map } from 'lucide-react';

interface MapViewToggleProps {
  isMapView: boolean;
  onToggle: () => void;
  className?: string;
}

const MapViewToggle: React.FC<MapViewToggleProps> = ({ 
  isMapView, 
  onToggle,
  className = '' 
}) => {
  return (
    <motion.div 
      className={`bg-quantum-darkBlue/50 rounded-full p-1 flex items-center ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <button
        onClick={onToggle}
        className={`relative rounded-full flex items-center transition-all duration-300 ease-in-out ${className}`}
        aria-label={isMapView ? "Switch to list view" : "Switch to map view"}
      >
        <div className="flex items-center justify-center">
          <div className="flex bg-quantum-darkBlue p-0.5 rounded-full">
            <motion.div 
              className="flex justify-center items-center w-10 h-10 z-10"
              initial={false}
              animate={{ opacity: isMapView ? 1 : 0.6 }}
            >
              <Map className={`h-4 w-4 ${isMapView ? 'text-quantum-cyan' : 'text-gray-400'}`} />
            </motion.div>
            
            <motion.div 
              className="flex justify-center items-center w-10 h-10 z-10"
              initial={false}
              animate={{ opacity: !isMapView ? 1 : 0.6 }}
            >
              <List className={`h-4 w-4 ${!isMapView ? 'text-quantum-cyan' : 'text-gray-400'}`} />
            </motion.div>
            
            <motion.div
              className="absolute bg-quantum-cyan/20 border border-quantum-cyan/40 w-10 h-10 rounded-full"
              initial={false}
              animate={{ x: isMapView ? 0 : 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
        </div>
      </button>
    </motion.div>
  );
};

export default MapViewToggle;
