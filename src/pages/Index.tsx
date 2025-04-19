
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import HolographicCard from '@/components/HolographicCard';
import MealViewer from '@/components/MealViewer';
import SubscriptionPlan from '@/components/SubscriptionPlan';
import ARMealPreview from '@/components/ARMealPreview';
import DynamicPricing from '@/components/DynamicPricing';
import Footer from '@/components/Footer';
import { ArrowRight, Brain, Dna, Leaf, Zap, Shield, Sparkles } from 'lucide-react';

const mealPlans = [
  {
    id: 1,
    title: 'Quantum Protein Bowl',
    description: 'High-protein meal with nano-enhanced amino acids and chromium-infused quinoa.',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    calories: 450,
    protein: 32,
    carbs: 45,
    fat: 15
  },
  {
    id: 2,
    title: 'Neon Sushi Platter',
    description: 'Omega-rich sushi with bioluminescent seaweed and cellular-repair compounds.',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    calories: 520,
    protein: 28,
    carbs: 60,
    fat: 18
  },
  {
    id: 3,
    title: 'Cyber Salad',
    description: 'Nutrient-dense greens with cognitive enhancers and mitochondrial supporters.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    calories: 380,
    protein: 15,
    carbs: 40,
    fat: 12
  }
];

const subscriptionPlans = [
  {
    title: 'Standard',
    price: 99,
    period: 'month',
    description: 'Perfect for individuals looking to upgrade their nutrition.',
    features: [
      { text: '12 meals per month', included: true },
      { text: 'Basic nutritional profile', included: true },
      { text: 'Weekly delivery', included: true },
      { text: 'AI meal recommendations', included: false },
      { text: 'Genetic optimization', included: false },
      { text: 'Premium ingredients', included: false },
    ],
  },
  {
    title: 'Premium',
    price: 179,
    period: 'month',
    description: 'Advanced nutrition with AI personalization for optimal performance.',
    features: [
      { text: '20 meals per month', included: true },
      { text: 'Advanced nutritional profile', included: true },
      { text: 'Flexible delivery schedule', included: true },
      { text: 'AI meal recommendations', included: true },
      { text: 'Genetic optimization', included: false },
      { text: 'Premium ingredients', included: true },
    ],
    highlighted: true,
  },
  {
    title: 'Ultimate',
    price: 299,
    period: 'month',
    description: 'Complete genetic optimization with unlimited premium meals.',
    features: [
      { text: 'Unlimited meals', included: true },
      { text: 'Complete nutritional profile', included: true },
      { text: 'On-demand delivery', included: true },
      { text: 'AI meal recommendations', included: true },
      { text: 'Genetic optimization', included: true },
      { text: 'Exclusive premium ingredients', included: true },
    ],
  },
];

const features = [
  {
    icon: <Brain className="w-10 h-10 text-quantum-cyan" />,
    title: 'AI Meal Planning',
    description: 'Our neural network analyzes your preferences, nutritional needs, and health goals to create personalized meal plans.',
  },
  {
    icon: <Dna className="w-10 h-10 text-quantum-purple" />,
    title: 'Genetic Optimization',
    description: 'Meals designed to complement your genetic profile, optimizing nutrient absorption and health outcomes.',
  },
  {
    icon: <Leaf className="w-10 h-10 text-quantum-cyan" />,
    title: 'Sustainable Sourcing',
    description: 'All ingredients are ethically sourced from sustainable farms with zero carbon footprint.',
  },
  {
    icon: <Zap className="w-10 h-10 text-quantum-purple" />,
    title: 'Enhanced Performance',
    description: 'Specialized meals that boost cognitive function, physical performance, and overall energy levels.',
  },
  {
    icon: <Shield className="w-10 h-10 text-quantum-cyan" />,
    title: 'Immune Support',
    description: 'Advanced nutrient combinations that strengthen your immune system against modern threats.',
  },
  {
    icon: <Sparkles className="w-10 h-10 text-quantum-purple" />,
    title: 'Molecular Gastronomy',
    description: 'Cutting-edge food science creates incredible flavors while maximizing nutritional benefits.',
  },
];

const Index = () => {
  const [selectedMealId, setSelectedMealId] = useState(1);

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Navbar */}
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                <span className="text-quantum-cyan neon-text">Future</span> of{" "}
                <span className="text-quantum-purple neon-text">Nutrition</span> Has Arrived
              </h1>
              <p className="text-gray-400 text-lg mb-8">
                AI-powered meal delivery optimized for your genetic profile, health goals, and taste preferences. Welcome to the quantum leap in nutrition.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-quantum-black font-bold py-3 px-8 rounded-md transition-all duration-300 flex items-center">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <button className="cyber-button">
                  Learn More
                </button>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <MealViewer selectedMealId={selectedMealId} />
              <div className="absolute -bottom-4 -right-4 bg-quantum-purple/80 backdrop-blur-sm text-white px-4 py-2 rounded-md text-sm">
                Interactive 3D Preview
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Quantum Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our cutting-edge technology revolutionizes meal delivery with personalized nutrition at the molecular level.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <HolographicCard key={index} className="p-2">
                <div className="p-4">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-quantum-cyan">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </HolographicCard>
            ))}
          </div>
        </div>
      </section>
      
      {/* Meals Section */}
      <section id="meals" className="py-16 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Meals</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Explore our most popular quantum-enhanced meal options, designed for peak performance and optimal health.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mealPlans.map((meal) => (
              <HolographicCard 
                key={meal.id} 
                className="overflow-hidden" 
                onClick={() => setSelectedMealId(meal.id)}
              >
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                    <img
                      src={meal.imageUrl}
                      alt={meal.title}
                      className="object-cover w-full h-48 transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-quantum-cyan">{meal.title}</h3>
                    <p className="text-gray-400 mb-4">{meal.description}</p>
                    
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="text-center">
                        <div className="text-quantum-purple font-bold">{meal.calories}</div>
                        <div className="text-xs text-gray-500">KCAL</div>
                      </div>
                      <div className="text-center">
                        <div className="text-quantum-cyan font-bold">{meal.protein}g</div>
                        <div className="text-xs text-gray-500">PROTEIN</div>
                      </div>
                      <div className="text-center">
                        <div className="text-quantum-purple font-bold">{meal.carbs}g</div>
                        <div className="text-xs text-gray-500">CARBS</div>
                      </div>
                      <div className="text-center">
                        <div className="text-quantum-cyan font-bold">{meal.fat}g</div>
                        <div className="text-xs text-gray-500">FAT</div>
                      </div>
                    </div>
                    
                    <button className="cyber-button w-full">
                      View Details
                    </button>
                  </div>
                </div>
              </HolographicCard>
            ))}
          </div>
        </div>
      </section>
      
      {/* 3D Meal Preview Section */}
      <section className="py-16 relative bg-gradient-to-b from-quantum-black to-quantum-black/60">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">3D Meal Preview</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Explore your meal in immersive 3D before ordering. Click and drag to rotate. Zoom to explore details.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <MealViewer selectedMealId={selectedMealId} className="h-96" />
            </div>
            <div className="md:w-1/2 md:pl-10">
              <HolographicCard>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-4 text-quantum-cyan">
                    {mealPlans.find(m => m.id === selectedMealId)?.title}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {mealPlans.find(m => m.id === selectedMealId)?.description}
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Calories</span>
                      <span className="text-quantum-purple font-bold">
                        {mealPlans.find(m => m.id === selectedMealId)?.calories} kcal
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Protein</span>
                      <span className="text-quantum-cyan font-bold">
                        {mealPlans.find(m => m.id === selectedMealId)?.protein}g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Carbohydrates</span>
                      <span className="text-quantum-purple font-bold">
                        {mealPlans.find(m => m.id === selectedMealId)?.carbs}g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fat</span>
                      <span className="text-quantum-cyan font-bold">
                        {mealPlans.find(m => m.id === selectedMealId)?.fat}g
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button className="bg-quantum-purple hover:bg-quantum-darkPurple text-white py-2 px-6 rounded-md transition-colors duration-300 flex-1">
                      Add to Cart
                    </button>
                    <button className="cyber-button flex-1">
                      Customize
                    </button>
                  </div>
                </div>
              </HolographicCard>
            </div>
          </div>
          
          {/* AR Meal Preview */}
          <div className="mt-12">
            <ARMealPreview 
              mealId={selectedMealId} 
              mealName={mealPlans.find(m => m.id === selectedMealId)?.title || ''} 
              className="max-w-lg mx-auto"
            />
          </div>
        </div>
      </section>
      
      {/* Subscription Section */}
      <section id="subscription" className="py-16 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Subscription Plans</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Choose a subscription plan that fits your lifestyle and nutritional needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan, index) => (
              <SubscriptionPlan
                key={index}
                title={plan.title}
                price={plan.price}
                period={plan.period}
                description={plan.description}
                features={plan.features}
                highlighted={plan.highlighted}
                className="h-full"
              />
            ))}
          </div>
          
          {/* Dynamic Pricing Section */}
          <div className="mt-20">
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-3">Custom Pricing</h3>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Don't see a plan that fits your needs? Use our AI-powered dynamic pricing engine to create a custom subscription.
              </p>
            </div>
            <DynamicPricing className="max-w-xl mx-auto" />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-6">
          <HolographicCard className="max-w-4xl mx-auto overflow-hidden">
            <div className="p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Nutrition?</h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Join thousands of cybernetic optimizers who have upgraded their nutrition system with QuantumMeals.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button className="bg-quantum-purple hover:bg-quantum-darkPurple text-white font-bold py-3 px-8 rounded-md transition-colors duration-300">
                  Start Your Journey
                </button>
                <button className="cyber-button">
                  Schedule a Demo
                </button>
              </div>
            </div>
          </HolographicCard>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
