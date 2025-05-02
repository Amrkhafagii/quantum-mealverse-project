
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from './hooks/useLanguage';
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

function App() {
  return (
    <LanguageProvider>
      <Router>
        <AuthProvider>
          <CartProvider>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </Router>
    </LanguageProvider>
  );
}

export default App;
