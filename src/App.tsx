
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Customer from './pages/Customer';
import MealDetails from './components/MealDetails';
import Cart from './pages/Cart';
import { CartProvider } from './contexts/CartContext';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import ReviewsManagement from './pages/Admin/ReviewsManagement';

function App() {
  const queryClient = new QueryClient();

  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/customer" element={<Customer />} />
              {/* Fix MealDetails route to pass required props */}
              <Route path="/meals/:id" element={
                <MealDetails 
                  meal={{
                    id: '',
                    name: '',
                    description: '',
                    price: 0,
                    image_url: '',
                    calories: 0,
                    protein: 0,
                    fat: 0,
                    carbs: 0
                  }} 
                  onAddToCart={() => {}} 
                />
              } />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
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
              
              {/* Add the new admin reviews route */}
              <Route path="/admin/reviews" element={<ReviewsManagement />} />
              
            </Routes>
          </Router>
          <Toaster position="top-right" />
        </CartProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
