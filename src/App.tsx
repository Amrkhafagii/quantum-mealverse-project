import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation
} from "react-router-dom";
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import MapView from './components/maps/MapView';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { useTheme } from 'next-themes';
import { BackgroundTrackingPermissions } from '@/components/maps/BackgroundTrackingPermissions';
import QrScannerDemo from './pages/QrScannerDemo';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();

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
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Router location={location} key={location.pathname}>
          <Navbar toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
          
          <BackgroundTrackingPermissions />
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/qr-scanner" element={<QrScannerDemo />} />
          </Routes>
          
          <Toaster />
        </Router>
      </ThemeProvider>
    </div>
  );
}

export default App;
