
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Orders from './pages/Orders';
import ThankYou from './pages/ThankYou';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import MealDetailsPage from './pages/MealDetailsPage';
import Subscription from './pages/Subscription';
import ProtectedRoute from './components/ProtectedRoute';

// Restaurant Routes
import RestaurantDashboard from './pages/restaurant/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/auth" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/meal/:id" element={<MealDetailsPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/subscription" element={<Subscription />} />

        {/* Protected Customer Routes */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/thank-you" element={<ProtectedRoute><ThankYou /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/admin/:section" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        
        {/* Restaurant Routes */}
        <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
