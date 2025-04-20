
import React from 'react';
import { Card } from "@/components/ui/card";
import { AuthForm } from '@/components/AuthForm';
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';

const Register = () => {
  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md px-4 -mt-16">
          <Card className="holographic-card p-8">
            <h1 className="text-4xl font-bold text-quantum-cyan mb-8 text-center neon-text">Create Account</h1>
            <AuthForm isRegister />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
