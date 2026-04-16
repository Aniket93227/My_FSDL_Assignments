import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Dashboard from './pages/admin/Dashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import ManageUsers from './pages/admin/ManageUsers';
import Loader from './components/Loader';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user?.role === 'admin' ? children : <Navigate to="/" />;
};

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <CartSidebar />
      <main>
        <Routes>
          <Route path="/"                    element={<Home />} />
          <Route path="/products"            element={<Products />} />
          <Route path="/products/:id"        element={<ProductDetail />} />
          <Route path="/cart"                element={<Cart />} />
          <Route path="/login"               element={<Login />} />
          <Route path="/register"            element={<Register />} />
          <Route path="/checkout"            element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/profile"             element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/orders"              element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/wishlist"            element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/admin"               element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/admin/products"      element={<AdminRoute><ManageProducts /></AdminRoute>} />
          <Route path="/admin/orders"        element={<AdminRoute><ManageOrders /></AdminRoute>} />
          <Route path="/admin/users"         element={<AdminRoute><ManageUsers /></AdminRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}