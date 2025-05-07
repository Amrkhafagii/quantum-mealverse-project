
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { GoogleMapsProvider } from './contexts/GoogleMapsContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import DeliveryRoute from './components/DeliveryRoute';
import NotFound from './pages/NotFound';
import { useAuth } from './hooks/useAuth';
import { useCart } from './hooks/useCart';
import { DeliveryMapProvider } from './contexts/DeliveryMapContext';
import { MapViewProvider } from './contexts/MapViewContext';

const queryClient = new QueryClient();

function App() {
  const { authState } = useAuth();
  const { cart } = useCart();
  
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
