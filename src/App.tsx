import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Customer from './pages/Customer';
import Cart from './pages/Cart';
import { CartProvider } from './contexts/CartContext';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import Register from './pages/Register';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import ReviewsManagement from './pages/Admin/ReviewsManagement';
import MealDetailsPage from './pages/MealDetailsPage';
import Subscription from './pages/Subscription';
import About from './pages/About';
import Contact from './pages/Contact';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';
import ThankYou from './pages/ThankYou';
import Orders from './pages/Orders';
import { useCustomerLogger } from '@/hooks/useCustomerLogger';

function App() {
  const queryClient = new QueryClient();
  useCustomerLogger(); // Initialize customer logger

  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/customer" element={<Customer />} />
              <Route path="/meals/:id" element={<MealDetailsPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/thank-you" element={<ThankYou />} />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/order-confirmation/:orderId" 
                element={
                  <ProtectedRoute>
                    <OrderConfirmation />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders/:id" 
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/reviews" 
                element={
                  <ProtectedRoute>
                    <ReviewsManagement />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Router>
          <Toaster position="top-right" />
        </CartProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
