
import React from 'react';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export const CustomerNavigation: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Explore Services Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-quantum-cyan" />
          <h2 className="text-xl font-semibold text-white">Explore Services</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-quantum-cyan text-quantum-black p-6 hover:bg-quantum-cyan/90 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🍽️</div>
              <div>
                <h3 className="font-semibold">Order Food</h3>
                <p className="text-sm opacity-80">Browse restaurants and order meals</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 p-6 hover:bg-quantum-darkBlue/50 transition-colors cursor-pointer opacity-50">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🚗</div>
              <div>
                <h3 className="font-semibold text-white">Delivery</h3>
                <p className="text-sm text-gray-300">Coming Soon</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 p-6 hover:bg-quantum-darkBlue/50 transition-colors cursor-pointer opacity-50">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🛒</div>
              <div>
                <h3 className="font-semibold text-white">Grocery</h3>
                <p className="text-sm text-gray-300">Coming Soon</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20 p-6 hover:bg-quantum-darkBlue/50 transition-colors cursor-pointer opacity-50">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💊</div>
              <div>
                <h3 className="font-semibold text-white">Pharmacy</h3>
                <p className="text-sm text-gray-300">Coming Soon</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
