
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from './hooks/useLanguage';
import { CurrencyProvider } from './hooks/useCurrency';
import { KeyboardNavigation } from './components/a11y/KeyboardNavigation';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Customer from './pages/Customer';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Restaurant from './pages/Restaurant';
import Subscription from './pages/Subscription';
import OrderStatus from './pages/OrderStatus';
import MealDetail from './pages/MealDetail';
import NotFound from './pages/NotFound';
import Nutrition from './pages/Nutrition';
import Fitness from './pages/Fitness';
import WorkoutsPage from './pages/Workouts';
import FitnessProfile from './pages/FitnessProfile';
import Orders from './pages/Orders';
import OrderConfirmation from './pages/OrderConfirmation';
import ThankYou from './pages/ThankYou';
import Auth from './pages/Auth';

// Restaurant admin routes
import RestaurantDashboard from './pages/restaurant/Dashboard';
import RestaurantMenu from './pages/restaurant/Menu';
import RestaurantOrders from './pages/restaurant/Orders';

// Delivery routes
import OnboardingPage from './pages/delivery/OnboardingPage';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

// Import the GoogleMapsProvider and DeliveryMapProvider
import { GoogleMapsProvider } from './contexts/GoogleMapsContext';
import { DeliveryMapProvider } from './contexts/DeliveryMapContext';

function App() {
  return (
    <GoogleMapsProvider>
      <DeliveryMapProvider>
        <LanguageProvider>
          <Router>
            <AuthProvider>
              <CurrencyProvider>
                <CartProvider>
                  <KeyboardNavigation />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/auth" element={<Auth />} />
                    
                    {/* Customer routes - protected for customer users */}
                    <Route path="/customer" element={
                      <ProtectedRoute allowedUserTypes={['customer', undefined]}>
                        <Customer />
                      </ProtectedRoute>
                    } />
                    <Route path="/cart" element={
                      <ProtectedRoute allowedUserTypes={['customer', undefined]}>
                        <Cart />
                      </ProtectedRoute>
                    } />
                    <Route path="/checkout" element={
                      <ProtectedRoute allowedUserTypes={['customer', undefined]}>
                        <Checkout />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/restaurants/:id" element={<Restaurant />} />
                    <Route path="/meal/:id" element={<MealDetail />} />
                    <Route path="/subscription" element={
                      <ProtectedRoute allowedUserTypes={['customer', undefined]}>
                        <Subscription />
                      </ProtectedRoute>
                    } />
                    <Route path="/order/status/:id" element={
                      <ProtectedRoute>
                        <OrderStatus />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <ProtectedRoute allowedUserTypes={['customer', undefined]}>
                        <Orders />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders/:id" element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    } />
                    <Route path="/order-confirmation/:id" element={
                      <ProtectedRoute>
                        <OrderConfirmation />
                      </ProtectedRoute>
                    } />
                    <Route path="/thank-you" element={<ThankYou />} />
                    <Route path="/nutrition" element={
                      <ProtectedRoute allowedUserTypes={['customer', undefined]}>
                        <Nutrition />
                      </ProtectedRoute>
                    } />
                    <Route path="/fitness" element={
                      <ProtectedRoute allowedUserTypes={['customer', undefined]}>
                        <Fitness />
                      </ProtectedRoute>
                    } />
                    <Route path="/workouts" element={
                      <ProtectedRoute allowedUserTypes={['customer', undefined]}>
                        <WorkoutsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/fitness-profile" element={
                      <ProtectedRoute allowedUserTypes={['customer', undefined]}>
                        <FitnessProfile />
                      </ProtectedRoute>
                    } />
                    
                    {/* Restaurant Admin Routes - protected for restaurant users */}
                    <Route path="/restaurant/dashboard" element={
                      <ProtectedRoute allowedUserTypes={['restaurant']}>
                        <RestaurantDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/restaurant/menu" element={
                      <ProtectedRoute allowedUserTypes={['restaurant']}>
                        <RestaurantMenu />
                      </ProtectedRoute>
                    } />
                    <Route path="/restaurant/orders" element={
                      <ProtectedRoute allowedUserTypes={['restaurant']}>
                        <RestaurantOrders />
                      </ProtectedRoute>
                    } />

                    {/* Delivery Routes - protected for delivery users */}
                    <Route path="/delivery/onboarding" element={
                      <ProtectedRoute allowedUserTypes={['delivery']}>
                        <OnboardingPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/delivery/dashboard" element={
                      <ProtectedRoute allowedUserTypes={['delivery']}>
                        <DeliveryDashboard />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                </CartProvider>
              </CurrencyProvider>
            </AuthProvider>
          </Router>
        </LanguageProvider>
      </DeliveryMapProvider>
    </GoogleMapsProvider>
  );
}

export default App;
