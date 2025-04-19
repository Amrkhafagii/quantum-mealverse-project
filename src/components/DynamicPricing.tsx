
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Calculator, Activity, TrendingUp } from 'lucide-react';
import HolographicCard from './HolographicCard';

interface PricingFactorProps {
  name: string;
  min: number;
  max: number;
  defaultValue: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

const PricingFactor = ({ name, min, max, defaultValue, step, unit, onChange }: PricingFactorProps) => {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <label className="text-quantum-cyan text-sm">{name}</label>
        <span className="text-quantum-purple text-sm font-bold">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-quantum-black rounded-lg appearance-none cursor-pointer accent-quantum-purple"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
};

interface DynamicPricingProps {
  className?: string;
}

const DynamicPricing = ({ className }: DynamicPricingProps) => {
  const [basePrice, setBasePrice] = useState(129);
  const [calculatedPrice, setCalculatedPrice] = useState(129);
  const [qualityFactor, setQualityFactor] = useState(1);
  const [quantityFactor, setQuantityFactor] = useState(1);
  const [frequencyFactor, setFrequencyFactor] = useState(1);
  
  // Recalculate price when factors change
  const recalculatePrice = () => {
    const price = basePrice * qualityFactor * quantityFactor * frequencyFactor;
    setCalculatedPrice(Math.round(price));
  };

  // Update factors and recalculate
  const updateQuality = (value: number) => {
    const factor = 0.8 + (value / 10) * 0.8; // 0.8 to 1.6 scaling
    setQualityFactor(factor);
    recalculatePrice();
  };
  
  const updateQuantity = (value: number) => {
    const factor = (value / 10) * 0.8 + 0.6; // 0.6 to 1.4 scaling
    setQuantityFactor(factor);
    recalculatePrice();
  };
  
  const updateFrequency = (value: number) => {
    const factor = 1.5 - (value / 10) * 0.7; // 0.8 to 1.5 scaling (higher frequency = lower price)
    setFrequencyFactor(factor);
    recalculatePrice();
  };

  return (
    <HolographicCard className={cn("p-6", className)}>
      <div className="flex items-center mb-6">
        <Calculator className="h-8 w-8 text-quantum-purple mr-3" />
        <h3 className="text-xl font-bold text-quantum-cyan">Dynamic Pricing Engine</h3>
      </div>
      
      <p className="text-gray-400 mb-6">
        Adjust the parameters below to see how our AI-powered pricing engine calculates your personalized meal plan cost.
      </p>
      
      <div className="mb-6">
        <PricingFactor
          name="Meal Quality"
          min={1}
          max={10}
          defaultValue={5}
          step={1}
          unit="★"
          onChange={updateQuality}
        />
        
        <PricingFactor
          name="Meals Per Week"
          min={5}
          max={21}
          defaultValue={10}
          step={1}
          unit="meals"
          onChange={updateQuantity}
        />
        
        <PricingFactor
          name="Delivery Frequency"
          min={1}
          max={7}
          defaultValue={3}
          step={1}
          unit="days"
          onChange={updateFrequency}
        />
      </div>
      
      <div className="bg-quantum-black/50 backdrop-blur-sm rounded-md p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-quantum-cyan mr-2" />
            <span className="text-gray-400">Your custom price:</span>
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-quantum-purple">${calculatedPrice}</span>
            <span className="text-sm text-gray-500 ml-1">/month</span>
          </div>
        </div>
        
        <div className="flex items-center mt-2 text-xs text-gray-500">
          <TrendingUp className="h-3 w-3 mr-1" />
          <span>Price dynamically calculated based on your preferences</span>
        </div>
      </div>
      
      <button className="cyber-button w-full">
        Get Custom Plan
      </button>
      
      <div className="mt-4 text-center text-xs text-gray-600">
        Note: This is a simulation of our Python microservice pricing engine.
      </div>
    </HolographicCard>
  );
};

export default DynamicPricing;
