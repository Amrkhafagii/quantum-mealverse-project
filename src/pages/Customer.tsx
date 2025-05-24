
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
  
  // Get nearby restaurants data
  const { nearbyRestaurants, loading: isLoadingRestaurants, error: restaurantError } = useNearestRestaurant();
  
  // Get menu items data
  const { data: menuItems = [], isLoading: isLoadingMenuItems, error: menuItemsError } = useMenuItems(nearbyRestaurants);

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
    console.log('Location permission requested');
  };

  const isLoading = isLoadingRestaurants || isLoadingMenuItems;
  const error = restaurantError || menuItemsError;

  // Debug logging
  console.log('Customer page state:', {
    user: user?.email,
    nearbyRestaurants: nearbyRestaurants?.length || 0,
    menuItems: menuItems?.length || 0,
    isLoading,
    error
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
          error={error}
          nearbyRestaurants={nearbyRestaurants}
          toggleMapView={toggleMapView}
          onLocationRequest={handleLocationRequest}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default CustomerPage;
