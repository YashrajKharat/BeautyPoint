import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute.jsx';
import Navbar from './components/Navbar.jsx';
import AdminNavbar from './components/AdminNavbar.jsx';
import AdminWrapper from './components/AdminWrapper.jsx';
import ChatBot from './components/ChatBot.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import Login from './pages/Login.jsx';
// import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import TrackOrder from './pages/TrackOrder.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminCoupon from './pages/admin/AdminCoupon.jsx';
import Footer from './components/Footer.jsx';
import Profile from './pages/Profile.jsx';
import './css/modern-globals.css';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <ChatBot />
          <Routes>
            {/* Regular User Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/profile" element={<Profile />} />


            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" />} />
              <Route path="dashboard" element={<AdminDashboard />} />
            </Route>

            {/* Admin Pages with Navbar (Products, Users, Orders) */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminWrapper />
                </ProtectedAdminRoute>
              }
            >
              <Route path="products" element={<AdminProducts />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="orders" element={<AdminOrders />} />

              <Route path="coupons" element={<AdminCoupon />} />
            </Route>
          </Routes>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
