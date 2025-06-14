
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import AuthForm from '@/components/AuthForm'; // Fixed import
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from 'lucide-react';

const Login = () => {
  const { user, loading } = useAuth();

  // Show loading state while auth is in progress
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-quantum-black">
        <Loader className="h-8 w-8 text-quantum-cyan animate-spin" />
      </div>
    );
  }

  // If user is logged in, show loading (Auth page will handle redirect)
  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-quantum-black">
        <Loader className="h-8 w-8 text-quantum-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      <div className="relative z-10 flex items-center justify-center min-h-screen py-20">
        <div className="w-full max-w-md px-4">
          <Card className="holographic-card p-8">
            <h1 className="text-4xl font-bold text-quantum-cyan mb-8 text-center neon-text">HealthAndFix</h1>
            <AuthForm />
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
