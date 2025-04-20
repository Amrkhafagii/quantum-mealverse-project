
import React from 'react';
import { Card } from "@/components/ui/card";
import { AuthForm } from '@/components/AuthForm';
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';

const Login = () => {
  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      <div className="relative z-10 w-full max-w-md px-4 mx-auto pt-24 pb-12">
        <Card className="holographic-card p-8">
          <h1 className="text-4xl font-bold text-quantum-cyan mb-8 text-center neon-text">Quantum Eats</h1>
          <AuthForm />
        </Card>
      </div>
    </div>
  );
};

export default Login;
