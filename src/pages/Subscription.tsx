
import React from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Subscription = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-quantum-black text-white relative overflow-hidden">
      <ParticleBackground />
      <Navbar />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-quantum-purple/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-quantum-cyan/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
      
      <main className="relative z-10 pt-28 pb-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold text-quantum-cyan mb-4 neon-text" id="subscription-heading" tabIndex={-1}>
              Zenith Meal Plans
            </h1>
            <p className="text-xl max-w-3xl mx-auto text-gray-300">
              Our meal plans are currently unavailable. Please check back later or contact us for more information.
            </p>
          </motion.div>
          
          <motion.div
            className="mt-16 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="bg-quantum-darkBlue/30 border-quantum-purple/20 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <h3 className="text-2xl font-bold text-quantum-purple mb-4">Contact Us</h3>
                <p className="mb-6">
                  Interested in learning more about our meal plans? Contact our team for personalized information and options.
                </p>
                <Button 
                  onClick={() => navigate('/contact')}
                  className="bg-quantum-purple hover:bg-quantum-purple/90"
                >
                  Contact Us
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Subscription;
