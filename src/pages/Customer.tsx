
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { MainContent } from '@/components/customer/MainContent';
import { useAuth } from '@/contexts/AuthContext';
import { useNearestRestaurant } from '@/hooks/useNearestRestaurant';
import { useMenuItems } from '@/hooks/useMenuItems';

const CustomerPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMapView, setIsMapView] = useState(false);
  
  // Get nearby restaurants data with error handling
  const { nearbyRestaurants = [], loading: isLoadingRestaurants } = useNearestRestaurant() || {};
  
  // Get menu items data - pass the nearbyRestaurants array with fallback
  const { data: menuItems = [], isLoading: isLoadingMenuItems, error: menuItemsError } = useMenuItems(nearbyRestaurants || []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMapView = () => {
    setIsMapView(!isMapView);
  };

  const handleLocationRequest = () => {
    // This would trigger location permission request
    console.log('Location permission requested');
  };

  const isLoading = isLoadingRestaurants || isLoadingMenuItems;

  // Add console logs for debugging
  console.log('Customer page rendering with:', {
    user: user?.email,
    nearbyRestaurants: nearbyRestaurants?.length,
    menuItems: menuItems?.length,
    isLoading,
    error: menuItemsError
  });

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="relative z-10 pt-20">
        <CustomerHeader 
          userEmail={user?.email}
          onLogout={handleLogout}
        />
        <MainContent 
          isMapView={isMapView}
          menuItems={menuItems}
          isLoading={isLoading}
          error={menuItemsError}
          nearbyRestaurants={nearbyRestaurants || []}
          toggleMapView={toggleMapView}
          onLocationRequest={handleLocationRequest}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default CustomerPage;
