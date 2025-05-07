import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { GoogleMapsProvider } from './contexts/GoogleMapsContext';
import { DeliveryMapProvider } from './contexts/DeliveryMapContext';
import { MapViewProvider } from './contexts/MapViewContext';
import { useAuth } from './hooks/useAuth';
import { LoadingSuspense } from './components/ui/LoadingSuspense';
import { NotificationsManager } from './components/ui/NotificationsManager';

// Eagerly load critical components
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load page components
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Lazy load non-critical placeholder components
const Products = lazy(() => import('./pages/Shop').then(module => ({ default: () => <div>Products Page</div> })));
const ProductDetail = lazy(() => import('./pages/Shop').then(module => ({ default: () => <div>Product Detail Page</div> })));
const OrderHistory = lazy(() => import('./pages/Orders').then(module => ({ default: () => <div>Order History Page</div> })));

// Lazy load admin components
const AdminDashboard = lazy(() => import('./pages/Admin').then(module => ({ default: () => <div>Admin Dashboard Page</div> })));
const AdminProducts = lazy(() => import('./pages/Admin').then(module => ({ default: () => <div>Admin Products Page</div> })));
const AdminOrders = lazy(() => import('./pages/Admin').then(module => ({ default: () => <div>Admin Orders Page</div> })));
const AdminUsers = lazy(() => import('./pages/Admin').then(module => ({ default: () => <div>Admin Users Page</div> })));

// Lazy load delivery components
const DeliveryDashboard = lazy(() => import('./pages/delivery/DeliveryDashboard').then(module => ({ default: () => <div>Delivery Dashboard Page</div> })));

// Create placeholder route components
const AdminRoute = ({children}: {children: React.ReactNode}) => <>{children}</>;
const DeliveryRoute = ({children}: {children: React.ReactNode}) => <>{children}</>;

const queryClient = new QueryClient();

function App() {
  const { user } = useAuth(); // Changed from authState to user which exists in the context
  
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <GoogleMapsProvider>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <DeliveryMapProvider>
                  <MapViewProvider>
                    <Router>
                      <Routes>
                        <Route path="/" element={
                          <LoadingSuspense>
                            <Home />
                          </LoadingSuspense>
                        } />
                        <Route path="/login" element={
                          <LoadingSuspense>
                            <Login />
                          </LoadingSuspense>
                        } />
                        <Route path="/register" element={
                          <LoadingSuspense>
                            <Register />
                          </LoadingSuspense>
                        } />
                        <Route path="/products" element={
                          <LoadingSuspense>
                            <Products />
                          </LoadingSuspense>
                        } />
                        <Route path="/products/:id" element={
                          <LoadingSuspense>
                            <ProductDetail />
                          </LoadingSuspense>
                        } />
                        <Route path="/cart" element={
                          <LoadingSuspense>
                            <Cart />
                          </LoadingSuspense>
                        } />
                        <Route path="/checkout" element={
                          <ProtectedRoute>
                            <LoadingSuspense>
                              <Checkout />
                            </LoadingSuspense>
                          </ProtectedRoute>
                        } />
                        <Route path="/order-confirmation" element={
                          <ProtectedRoute>
                            <LoadingSuspense>
                              <OrderConfirmation />
                            </LoadingSuspense>
                          </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                          <ProtectedRoute>
                            <LoadingSuspense>
                              <Profile />
                            </LoadingSuspense>
                          </ProtectedRoute>
                        } />
                        <Route path="/order-history" element={
                          <ProtectedRoute>
                            <LoadingSuspense>
                              <OrderHistory />
                            </LoadingSuspense>
                          </ProtectedRoute>
                        } />
                        
                        {/* Admin Routes - Grouped and lazily loaded */}
                        <Route path="/admin" element={
                          <AdminRoute>
                            <LoadingSuspense>
                              <AdminDashboard />
                            </LoadingSuspense>
                          </AdminRoute>
                        } />
                        <Route path="/admin/products" element={
                          <AdminRoute>
                            <LoadingSuspense>
                              <AdminProducts />
                            </LoadingSuspense>
                          </AdminRoute>
                        } />
                        <Route path="/admin/orders" element={
                          <AdminRoute>
                            <LoadingSuspense>
                              <AdminOrders />
                            </LoadingSuspense>
                          </AdminRoute>
                        } />
                        <Route path="/admin/users" element={
                          <AdminRoute>
                            <LoadingSuspense>
                              <AdminUsers />
                            </LoadingSuspense>
                          </AdminRoute>
                        } />
                        
                        {/* Delivery Routes - Lazily loaded */}
                        <Route path="/delivery" element={
                          <DeliveryRoute>
                            <LoadingSuspense>
                              <DeliveryDashboard />
                            </LoadingSuspense>
                          </DeliveryRoute>
                        } />
                        
                        {/* Not Found Route */}
                        <Route path="*" element={
                          <LoadingSuspense>
                            <NotFound />
                          </LoadingSuspense>
                        } />
                      </Routes>
                    </Router>
                  </MapViewProvider>
                </DeliveryMapProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </GoogleMapsProvider>
      </QueryClientProvider>
      
      {/* Add NotificationsManager for mobile notification handling */}
      <NotificationsManager />
    </>
  );
}

export default App;
