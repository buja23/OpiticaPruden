import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_urls: string[];
  stock: number;
  active: boolean;
}

interface CartItem {
  productId: number;
  quantity: number;
}

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  addToCart: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  updateStock: (productId: number, newStock: number) => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  loading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true);
      
      if (error) throw error;
      if (data) setProducts(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  }

  const addToCart = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock < 1) return;

    setCart(prev => {
      const existingItem = prev.find(item => item.productId === productId);
      if (existingItem) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });

    setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, stock: p.stock - 1 } : p
      )
    );
  };

  const removeFromCart = (productId: number) => {
    const cartItem = cart.find(item => item.productId === productId);
    if (!cartItem) return;

    setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, stock: p.stock + cartItem.quantity } : p
      )
    );

    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateStock = (productId: number, newStock: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, stock: newStock } : p))
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        addToCart,
        removeFromCart,
        updateStock,
        getCartTotal,
        getCartItemCount,
        loading,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
