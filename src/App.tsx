
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query/devtools';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { GoogleMapsProvider } from './contexts/GoogleMapsContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import { useAuth } from './hooks/useAuth';
import { DeliveryMapProvider } from './contexts/DeliveryMapContext';
import { MapViewProvider } from './contexts/MapViewContext';
import ProtectedRoute from './components/ProtectedRoute';

// Create a dummy components for missing files until they can be properly implemented
const Products = () => <div>Products Page</div>;
const ProductDetail = () => <div>Product Detail Page</div>;
const OrderHistory = () => <div>Order History Page</div>;
const AdminDashboard = () => <div>Admin Dashboard Page</div>;
const AdminProducts = () => <div>Admin Products Page</div>;
const AdminOrders = () => <div>Admin Orders Page</div>;
const AdminUsers = () => <div>Admin Users Page</div>;
const DeliveryDashboard = () => <div>Delivery Dashboard Page</div>;

// Create placeholder route components
const AdminRoute = ({children}: {children: React.ReactNode}) => <>{children}</>;
const DeliveryRoute = ({children}: {children: React.ReactNode}) => <>{children}</>;

const queryClient = new QueryClient();

function App() {
  const { user } = useAuth(); // Changed from authState to user which exists in the context
  
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleMapsProvider>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <DeliveryMapProvider>
                <MapViewProvider>
                  <Router>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/products/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                      <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                      
                      {/* Admin Routes */}
                      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                      <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
                      <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
                      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                      
                      {/* Delivery Routes */}
                      <Route path="/delivery" element={<DeliveryRoute><DeliveryDashboard /></DeliveryRoute>} />
                      
                      {/* Not Found Route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Router>
                </MapViewProvider>
              </DeliveryMapProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </GoogleMapsProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default App;
