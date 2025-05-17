import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { GoogleMapsProvider } from './contexts/GoogleMapsContext';
import { DeliveryMapProvider } from './contexts/DeliveryMapContext';
import { MapViewProvider } from './contexts/MapViewContext';
import { LanguageProvider } from './hooks/useLanguage';
import { TouchOptimizerProvider } from './contexts/TouchOptimizerContext';
import { useAuth } from './hooks/useAuth';
import { LoadingSuspense } from './components/ui/LoadingSuspense';
import { NotificationsManager } from './components/notifications/NotificationsManager';
import { BackgroundSyncManager } from '@/components/sync/BackgroundSyncManager';

// Eagerly load critical components
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load page components
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Auth = lazy(() => import('./pages/Auth'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const OrderStatus = lazy(() => import('./pages/OrderStatus'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Customer = lazy(() => import('./pages/Customer'));
const Fitness = lazy(() => import('./pages/Fitness'));
const Subscription = lazy(() => import('./pages/Subscription'));
const Restaurant = lazy(() => import('./pages/Restaurant'));
const MealDetail = lazy(() => import('./pages/MealDetail'));
const Orders = lazy(() => import('./pages/Orders'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Workouts = lazy(() => import('./pages/Workouts'));
const Signup = lazy(() => import('./pages/Signup'));
const Contact = lazy(() => import('./pages/Contact'));

// Restaurant pages
const RestaurantDashboard = lazy(() => import('./pages/restaurant/Dashboard'));
const RestaurantMenu = lazy(() => import('./pages/restaurant/Menu'));
const RestaurantOrders = lazy(() => import('./pages/restaurant/Orders'));

// Delivery pages
const DeliveryDashboard = lazy(() => import('./pages/delivery/DeliveryDashboard'));
const DeliverySettings = lazy(() => import('./pages/delivery/DeliverySettings'));
const OnboardingPage = lazy(() => import('./pages/delivery/OnboardingPage'));

// Lazy load non-critical placeholder components
const Products = lazy(() => import('./pages/Shop').then(module => ({ default: () => <div>Products Page</div> })));
const ProductDetail = lazy(() => import('./pages/Shop').then(module => ({ default: () => <div>Product Detail Page</div> })));
const OrderHistory = lazy(() => import('./pages/Orders').then(module => ({ default: () => <div>Order History Page</div> })));

// Lazy load admin components
const AdminDashboard = lazy(() => import('./pages/Admin').then(module => ({ default: () => <div>Admin Dashboard Page</div> })));
const AdminProducts = lazy(() => import('./pages/Admin').then(module => ({ default: () => <div>Admin Products Page</div> })));
const AdminOrders = lazy(() => import('./pages/Admin').then(module => ({ default: () => <div>Admin Orders Page</div> })));
const AdminUsers = lazy(() => import('./pages/Admin').then(module => ({ default: () => <div>Admin Users Page</div> })));

// Create placeholder route components
const AdminRoute = ({children}: {children: React.ReactNode}) => <>{children}</>;
const DeliveryRoute = ({children}: {children: React.ReactNode}) => <>{children}</>;

function App() {
  // We need to create a QueryClient here, rather than outside the component
  // to avoid shared client state across renders
  const queryClient = new QueryClient();
  
  return (
    <BackgroundSyncManager>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <GoogleMapsProvider>
            <AuthProvider>
              <LanguageProvider>
                <CartProvider>
                  <DeliveryMapProvider>
                    <MapViewProvider>
                      <TouchOptimizerProvider>
                        <Router>
                          <Routes>
                            <Route path="/" element={
                              <LoadingSuspense>
                                <Home />
                              </LoadingSuspense>
                            } />

                            {/* Auth routes */}
                            <Route path="/login" element={
                              <LoadingSuspense>
                                <Login />
                              </LoadingSuspense>
                            } />
                            <Route path="/auth" element={
                              <LoadingSuspense>
                                <Auth />
                              </LoadingSuspense>
                            } />
                            <Route path="/register" element={
                              <LoadingSuspense>
                                <Register />
                              </LoadingSuspense>
                            } />
                            <Route path="/signup" element={
                              <LoadingSuspense>
                                <Signup />
                              </LoadingSuspense>
                            } />

                            {/* Customer routes */}
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
                            <Route path="/customer" element={
                              <LoadingSuspense>
                                <Customer />
                              </LoadingSuspense>
                            } />
                            <Route path="/dashboard" element={
                              <ProtectedRoute>
                                <LoadingSuspense>
                                  <Dashboard />
                                </LoadingSuspense>
                              </ProtectedRoute>
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
                            <Route path="/order-status/:id" element={
                              <ProtectedRoute>
                                <LoadingSuspense>
                                  <OrderStatus />
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
                            
                            {/* Fitness, Nutrition, Workouts */}
                            <Route path="/fitness" element={
                              <LoadingSuspense>
                                <Fitness />
                              </LoadingSuspense>
                            } />
                            <Route path="/nutrition" element={
                              <LoadingSuspense>
                                <Nutrition />
                              </LoadingSuspense>
                            } />
                            <Route path="/workouts" element={
                              <LoadingSuspense>
                                <Workouts />
                              </LoadingSuspense>
                            } />
                            
                            {/* Orders Route */}
                            <Route path="/orders" element={
                              <LoadingSuspense>
                                <Orders />
                              </LoadingSuspense>
                            } />
                            <Route path="/orders/:id" element={
                              <LoadingSuspense>
                                <Orders />
                              </LoadingSuspense>
                            } />
                            
                            {/* Subscription/Meal Plans Route */}
                            <Route path="/subscription" element={
                              <LoadingSuspense>
                                <Subscription />
                              </LoadingSuspense>
                            } />
                            
                            {/* Contact Route */}
                            <Route path="/contact" element={
                              <LoadingSuspense>
                                <Contact />
                              </LoadingSuspense>
                            } />
                            
                            {/* Note: More specific routes should come before less specific ones */}
                            {/* Restaurant Dashboard Routes */}
                            <Route path="/restaurant/dashboard" element={
                              <LoadingSuspense>
                                <RestaurantDashboard />
                              </LoadingSuspense>
                            } />
                            
                            <Route path="/restaurant/menu" element={
                              <LoadingSuspense>
                                <RestaurantMenu />
                              </LoadingSuspense>
                            } />
                            
                            <Route path="/restaurant/orders" element={
                              <LoadingSuspense>
                                <RestaurantOrders />
                              </LoadingSuspense>
                            } />
                            
                            {/* Restaurant Detail Route (must come AFTER the more specific routes) */}
                            <Route path="/restaurant/:id" element={
                              <LoadingSuspense>
                                <Restaurant />
                              </LoadingSuspense>
                            } />
                            
                            <Route path="/meal/:id" element={
                              <LoadingSuspense>
                                <MealDetail />
                              </LoadingSuspense>
                            } />
                            
                            {/* Delivery Routes */}
                            <Route path="/delivery" element={
                              <DeliveryRoute>
                                <LoadingSuspense>
                                  <DeliveryDashboard />
                                </LoadingSuspense>
                              </DeliveryRoute>
                            } />
                            
                            {/* Add missing delivery routes */}
                            <Route path="/delivery/dashboard" element={
                              <DeliveryRoute>
                                <LoadingSuspense>
                                  <DeliveryDashboard />
                                </LoadingSuspense>
                              </DeliveryRoute>
                            } />
                            
                            <Route path="/delivery/settings" element={
                              <DeliveryRoute>
                                <LoadingSuspense>
                                  <DeliverySettings />
                                </LoadingSuspense>
                              </DeliveryRoute>
                            } />
                            
                            <Route path="/delivery/onboarding" element={
                              <DeliveryRoute>
                                <LoadingSuspense>
                                  <OnboardingPage />
                                </LoadingSuspense>
                              </DeliveryRoute>
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
                            
                            {/* Not Found Route */}
                            <Route path="*" element={
                              <LoadingSuspense>
                                <NotFound />
                              </LoadingSuspense>
                            } />
                          </Routes>
                        </Router>
                      </TouchOptimizerProvider>
                    </MapViewProvider>
                  </DeliveryMapProvider>
                </CartProvider>
              </LanguageProvider>
            </AuthProvider>
          </GoogleMapsProvider>
        </ThemeProvider>
      </QueryClientProvider>
      
      {/* Add NotificationsManager for mobile notification handling */}
      <NotificationsManager />
    </BackgroundSyncManager>
  );
}

export default App;
