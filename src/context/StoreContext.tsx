import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

// 1. Defina o tipo Product para corresponder ao Front-end
// Note que aqui mantemos os nomes que o Front já usa (camelCase)
export interface Product {
  id: number;
  created_at: string;
  name: string;
  description: string;
  images: string[];
  stock: number;
  priceSale: number;
  priceOriginal: number;
}

export interface CartItem {
  productId: number;
  quantity: number;
}

export type CartProduct = Product & {
  quantity: number;
};

export interface FilterState {
  searchText: string;
  priceRange: { min: number; max: number };
  sortBy: 'newest' | 'price-asc' | 'price-desc';
}

interface StoreContextType {
  products: Product[];
  allProducts: Product[];
  isCartLoading: boolean;
  isLoading: boolean;
  addToCart: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  cart: CartItem[];
  clearCart: () => void;
  updateStock: (productId: number, newStock: number) => void;
  cartItemCount: number;
  cartItems: CartProduct[];
  cartTotal: number;
  filters: FilterState;
  fetchProducts: () => Promise<void>;
  updateFilters: (newFilters: Partial<FilterState>) => void;
  priceBounds: { min: number; max: number };
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const { user } = useAuth();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    priceRange: { min: 0, max: 99999 },
    sortBy: 'newest',
  });

  // --- 1. FUNÇÃO DE BUSCA COM ADAPTER (A Mágica) ---
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        throw error;
      }

      if (data) {
        // Aqui traduzimos do "Snake_Case do Banco" para "camelCase do React"
        const transformedProducts: Product[] = data.map((dbProduct) => ({
          id: dbProduct.id,
          created_at: dbProduct.created_at,
          name: dbProduct.name,
          description: dbProduct.description || '',
          images: dbProduct.images || [],
          
          // Adapter: Banco (stock_quantity) -> Front (stock)
          stock: dbProduct.stock_quantity ?? dbProduct.stock ?? 0,
          
          // Adapter: Banco (price_sale) -> Front (priceSale)
          priceSale: dbProduct.price_sale ?? dbProduct.price ?? 0,
          
          // Adapter: Banco (price_original) -> Front (priceOriginal)
          priceOriginal: dbProduct.price_original ?? 0,
        }));
        setAllProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Ocorreu um erro em fetchProducts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. HOOKS (Fora da função fetchProducts!) ---
  
  // Busca inicial
  useEffect(() => {
    fetchProducts();
  }, []);

  // Gerenciamento do Carrinho (Sessão do Usuário)
  useEffect(() => {
    const handleUserSessionCart = async () => {
      if (user) {
        setIsCartLoading(true);
        const { data, error } = await supabase
          .from('user_carts')
          .select('product_id, quantity')
          .eq('user_id', user.id);

        if (error) {
          console.error('Erro ao buscar carrinho do usuário:', error);
        } else {
          setCart(data.map(item => ({ productId: item.product_id, quantity: item.quantity })));
        }
        setIsCartLoading(false);
      } else {
        setCart([]);
        setIsCartLoading(false);
      }
    };

    handleUserSessionCart();
  }, [user]);

  // --- 3. FUNÇÕES AUXILIARES ---

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  const products = useMemo(() => {
    let filtered = [...allProducts];

    if (filters.searchText) {
      const lowercasedText = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(lowercasedText) ||
          p.description.toLowerCase().includes(lowercasedText)
      );
    }

    filtered = filtered.filter(
      (p) =>
        p.priceSale >= filters.priceRange.min &&
        p.priceSale <= filters.priceRange.max
    );

    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.priceSale - b.priceSale);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.priceSale - a.priceSale);
        break;
      case 'newest':
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    return filtered;
  }, [allProducts, filters]);

  const cartItems: CartProduct[] = useMemo(() => {
    return cart
      .map((cartItem) => {
        const product = allProducts.find((p) => p.id === cartItem.productId);
        if (product) {
          return { ...product, quantity: cartItem.quantity };
        }
        return null;
      })
      .filter((item): item is CartProduct => item !== null);
  }, [cart, allProducts]);

  const addToCart = async (productId: number) => {
    if (!user) {
      toast(
        (t) => (
          <div className="flex items-center justify-between w-full">
            <span className="mr-4 text-sm">
              Você precisa estar logado para adicionar itens.
            </span>
            <Link
              to="/login"
              onClick={() => toast.dismiss(t.id)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-lg text-sm whitespace-nowrap"
            >
              Fazer Login
            </Link>
          </div>
        ),
        { icon: '🔒' }
      );
      return;
    }

    const product = allProducts.find((p) => p.id === productId);
    if (!product) {
      toast.error('Produto não encontrado.');
      return;
    }

    const itemInCart = cart.find((item) => item.productId === productId);
    const currentQuantityInCart = itemInCart ? itemInCart.quantity : 0;

    if (currentQuantityInCart >= product.stock) {
      toast.error(`Estoque esgotado para "${product.name}".`);
      return;
    }

    // Atualização Otimista
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.productId === productId);
      if (existingItem) {
        return currentCart.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...currentCart, { productId, quantity: 1 }];
    });

    const { error } = await supabase.rpc('add_to_cart', {
      p_product_id: productId,
      p_quantity_change: 1,
    });

    if (error) {
      console.error('Erro ao salvar no carrinho:', error);
      const { data } = await supabase.from('user_carts').select('product_id, quantity').eq('user_id', user.id);
      toast.error('Não foi possível adicionar ao carrinho.');
      setCart(data?.map(item => ({ productId: item.product_id, quantity: item.quantity })) || []);
    }
  };

  const removeFromCart = async (productId: number) => {
    if (!user) return;

    setCart((currentCart) => currentCart.filter((item) => item.productId !== productId));

    const { error } = await supabase
      .from('user_carts')
      .delete()
      .match({ user_id: user.id, product_id: productId });
    
    if (error) {
      console.error('Erro ao remover do carrinho:', error);
      const { data } = await supabase.from('user_carts').select('product_id, quantity').eq('user_id', user.id);
      setCart(data?.map(item => ({ productId: item.product_id, quantity: item.quantity })) || []);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    setCart([]);

    const { error } = await supabase
      .from('user_carts')
      .delete()
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Erro ao limpar carrinho:', error);
      const { data } = await supabase.from('user_carts').select('product_id, quantity').eq('user_id', user.id);
      setCart(data?.map(item => ({ productId: item.product_id, quantity: item.quantity })) || []);
    }
  };

  // --- 4. ATUALIZAÇÃO DE ESTOQUE (Corrigido para stock_quantity) ---
  const updateStock = async (productId: number, newStock: number) => {
    setAllProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)));
    
    // Agora salvamos na coluna certa do banco: stock_quantity
    const { error } = await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', productId);
      
    if (error) {
      console.error('Erro ao atualizar o estoque:', error);
      fetchProducts(); // Reverte em caso de erro
    }
  };

  const priceBounds = useMemo(() => {
    if (allProducts.length === 0) {
      return { min: 0, max: 1000 };
    }
    const prices = allProducts.map((p) => p.priceSale);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [allProducts]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.priceSale * item.quantity,
      0
    );
  }, [cartItems]);

  const value = {
    products,
    allProducts,
    isCartLoading,
    isLoading,
    addToCart,
    updateStock,
    cart,
    removeFromCart,
    clearCart,
    cartItemCount,
    cartItems,
    cartTotal,
    filters,
    updateFilters,
    fetchProducts,
    priceBounds,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore deve ser usado dentro de um StoreProvider');
  }
  return context;
}