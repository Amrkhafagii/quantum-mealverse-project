
import React from 'react';
import { Button } from "@/components/ui/button";
import { Map, List } from 'lucide-react';

interface MapViewToggleProps {
  isMapView: boolean;
  onToggle: () => void;
}

const MapViewToggle: React.FC<MapViewToggleProps> = ({ isMapView, onToggle }) => {
  return (
    <Button 
      size="sm" 
      variant="outline" 
      onClick={onToggle}
      className="bg-quantum-darkBlue/50 border-quantum-cyan/30 transition-all hover:bg-quantum-darkBlue hover:border-quantum-cyan/60"
    >
      {isMapView ? (
        <React.Fragment>
          <List className="h-4 w-4 mr-2" />
          <span>List View</span>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Map className="h-4 w-4 mr-2" />
          <span>Map View</span>
        </React.Fragment>
      )}
    </Button>
  );
};

export default MapViewToggle;
