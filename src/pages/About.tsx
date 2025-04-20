
import React from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { CartProvider } from '@/contexts/CartContext';

const About = () => {
  return (
    <CartProvider>
      <div className="min-h-screen bg-quantum-black text-white relative">
        <ParticleBackground />
        <Navbar />
        
        <main className="relative z-10 pt-24 pb-12 container mx-auto px-4">
          <h1 className="text-4xl font-bold text-quantum-cyan mb-8 neon-text">About Zenith Meals</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-galaxy-purple mb-4">Our Vision</h2>
              <p className="mb-4">
                Zenith Meals represents the pinnacle of culinary excellence and innovative food delivery.
                Founded in 2025, our mission is to revolutionize the way people experience food through
                personalized meal services.
              </p>
              <p>
                We combine culinary expertise with advanced technology to create personalized dining experiences
                that cater to individual taste preferences, nutritional needs, and dietary restrictions.
              </p>
            </div>
            <div className="bg-quantum-black/50 p-6 rounded-lg border border-quantum-cyan/20">
              <h2 className="text-2xl font-bold text-galaxy-purple mb-4">Our Technology</h2>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-quantum-cyan mr-2">•</span>
                  <span>Smart meal recommendations based on your preferences</span>
                </li>
                <li className="flex items-start">
                  <span className="text-quantum-cyan mr-2">•</span>
                  <span>Real-time meal previews</span>
                </li>
                <li className="flex items-start">
                  <span className="text-quantum-cyan mr-2">•</span>
                  <span>Nutritional analysis and health optimization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-quantum-cyan mr-2">•</span>
                  <span>Sustainable sourcing and carbon footprint tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-quantum-cyan mr-2">•</span>
                  <span>Advanced delivery logistics</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-galaxy-purple mb-4">Our Team</h2>
            <p className="mb-6">
              Behind Zenith Meals is a diverse team of culinary experts, technologists, nutritionists, and food
              enthusiasts united by a passion for revolutionizing the future of food delivery.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                { name: "Sarah Chen", position: "Head Chef" },
                { name: "Michael Rodriguez", position: "Nutrition Director" },
                { name: "Emily Thompson", position: "Technology Lead" },
                { name: "David Kim", position: "Operations Manager" }
              ].map((member) => (
                <div key={member.name} className="text-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-quantum-cyan to-galaxy-purple mx-auto mb-4"></div>
                  <h3 className="text-lg font-bold text-quantum-cyan">{member.name}</h3>
                  <p className="text-sm text-gray-300">{member.position}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </CartProvider>
  );
};

export default About;
