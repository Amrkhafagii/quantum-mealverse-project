import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import MapView from './components/maps/MapView';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { useTheme } from '@/components/theme-provider';
import { BackgroundTrackingPermissions } from '@/components/maps/BackgroundTrackingPermissions';
import QrScannerDemo from './pages/QrScannerDemo';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ResponsiveProvider } from './contexts/ResponsiveContext';
import ARViewPage from './pages/ARViewPage';

function AppContent() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setIsDarkMode(theme === 'dark');
  }, [theme]);

  const toggleDarkMode = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    setIsDarkMode(newTheme === 'dark');
  };
  
  return (
    <div className="App">
      <Navbar toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      
      <BackgroundTrackingPermissions />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/qr-scanner" element={<QrScannerDemo />} />
        {/* Add the AR View route */}
        <Route path="/ar-view/:id" element={<ARViewPage />} />
      </Routes>
      
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <CartProvider>
          <ResponsiveProvider>
            <Router>
              <AppContent />
            </Router>
          </ResponsiveProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
