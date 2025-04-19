
import React from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { CartProvider } from '@/contexts/CartContext';

const Contact = () => {
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent",
      description: "Thank you for contacting us. We'll respond shortly!",
      duration: 3000,
    });
    // Reset form (would clear fields in a real implementation)
  };
  
  return (
    <CartProvider>
      <div className="min-h-screen bg-quantum-black text-white relative">
        <ParticleBackground />
        <Navbar />
        
        <main className="relative z-10 pt-24 pb-12 container mx-auto px-4">
          <h1 className="text-4xl font-bold text-quantum-cyan mb-8 neon-text">Contact Us</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-galaxy-purple mb-4">Get In Touch</h2>
              <p className="mb-6">
                Have questions about our meals, technology, or delivery? We're here to help!
                Fill out the form and our team will respond as soon as possible.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-quantum-cyan/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-quantum-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-quantum-cyan">Email</h3>
                    <p className="text-gray-300">support@quantumeats.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-quantum-cyan/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-quantum-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-quantum-cyan">Phone</h3>
                    <p className="text-gray-300">+20 123 456 7890</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-quantum-cyan/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-quantum-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-quantum-cyan">Location</h3>
                    <p className="text-gray-300">Cairo, Egypt</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <form onSubmit={handleSubmit} className="space-y-6 bg-black/30 p-6 rounded-lg border border-quantum-cyan/20">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-quantum-cyan">Name</label>
                  <Input id="name" required className="bg-black/50 border-quantum-cyan/30" />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-quantum-cyan">Email</label>
                  <Input id="email" type="email" required className="bg-black/50 border-quantum-cyan/30" />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-quantum-cyan">Subject</label>
                  <Input id="subject" required className="bg-black/50 border-quantum-cyan/30" />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-quantum-cyan">Message</label>
                  <Textarea 
                    id="message" 
                    required 
                    className="bg-black/50 border-quantum-cyan/30 min-h-[120px]"
                  />
                </div>
                
                <Button type="submit" className="cyber-button w-full">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </CartProvider>
  );
};

export default Contact;
