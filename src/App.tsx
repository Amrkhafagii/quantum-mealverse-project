
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from './hooks/useLanguage';
import { CurrencyProvider } from './hooks/useCurrency';
import { KeyboardNavigation } from './components/a11y/KeyboardNavigation';
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
import Workouts from './pages/Workouts';
import FitnessProfile from './pages/FitnessProfile';
import Orders from './pages/Orders';

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
                    <Route path="/customer" element={<Customer />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/restaurants/:id" element={<Restaurant />} />
                    <Route path="/meal/:id" element={<MealDetail />} />
                    <Route path="/subscription" element={<Subscription />} />
                    <Route path="/order/status/:id" element={<OrderStatus />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/orders/:id" element={<Orders />} />
                    <Route path="/nutrition" element={<Nutrition />} />
                    <Route path="/fitness" element={<Fitness />} />
                    <Route path="/workouts" element={<Workouts />} />
                    <Route path="/fitness-profile" element={<FitnessProfile />} />
                    
                    {/* Restaurant Admin Routes */}
                    <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
                    <Route path="/restaurant/menu" element={<RestaurantMenu />} />
                    <Route path="/restaurant/orders" element={<RestaurantOrders />} />

                    {/* Delivery Routes */}
                    <Route path="/delivery/onboarding" element={<OnboardingPage />} />
                    <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
                    
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
