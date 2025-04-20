
import React from 'react';
import { Card } from "@/components/ui/card";
import { AuthForm } from '@/components/AuthForm';
import ParticleBackground from '@/components/ParticleBackground';

const Login = () => {
  return (
    <div className="min-h-screen bg-quantum-black text-white relative flex items-center justify-center">
      <ParticleBackground />
      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="holographic-card p-8">
          <h1 className="text-4xl font-bold text-quantum-cyan mb-8 text-center neon-text">Quantum Eats</h1>
          <AuthForm />
        </Card>
      </div>
    </div>
  );
};

export default Login;
