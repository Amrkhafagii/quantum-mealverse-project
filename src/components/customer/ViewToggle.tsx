
import React from 'react';
import { motion } from 'framer-motion';
import { MapViewToggle } from '@/components/location/MapViewToggle';
import { LocationStatusIndicator } from '@/components/location/LocationStatusIndicator';

interface ViewToggleProps {
  isMapView: boolean;
  onToggle: () => void;
  showToggle: boolean;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  isMapView,
  onToggle,
  showToggle
}) => {
  if (!showToggle) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center gap-2">
        <LocationStatusIndicator showTooltip={true} />
        <MapViewToggle isMapView={isMapView} onToggle={onToggle} />
      </div>
    </motion.div>
  );
};
