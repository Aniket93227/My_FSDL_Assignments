import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart]         = useState({ items: [] });
  const [loading, setLoading]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) return setCart({ items: [] });
    try {
      const { data } = await getCart();
      setCart(data.cart);
    } catch {}
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const { data } = await addToCart(productId, quantity);
      setCart(data.cart);
      toast.success('Added to cart!');
      setSidebarOpen(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally { setLoading(false); }
  };

  const updateItem = async (productId, quantity) => {
    const { data } = await updateCartItem(productId, quantity);
    setCart(data.cart);
  };

  const removeItem = async (productId) => {
    const { data } = await removeFromCart(productId);
    setCart(data.cart);
    toast.success('Item removed');
  };

  const emptyCart = async () => {
    await clearCart();
    setCart({ items: [] });
  };

  const cartTotal = cart.items?.reduce((acc, i) => acc + i.price * i.quantity, 0) || 0;
  const cartCount = cart.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{
      cart, loading, sidebarOpen, setSidebarOpen,
      addItem, updateItem, removeItem, emptyCart,
      cartTotal, cartCount, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);