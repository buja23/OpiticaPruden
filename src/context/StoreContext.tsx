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

// 1. Defina o tipo Product para corresponder à sua tabela Supabase
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

// Combina o tipo Product com a quantidade, para uso na UI
export type CartProduct = Product & {
  quantity: number;
};

export interface FilterState {
  searchText: string;
  priceRange: { min: number; max: number };
  sortBy: 'newest' | 'price-asc' | 'price-desc';
}

// 2. Defina a forma do valor do seu contexto
interface StoreContextType {
  products: Product[];
  allProducts: Product[];
  isCartLoading: boolean;
  isLoading: boolean;
  addToCart: (productId: number) => void;
  removeFromCart: (productId: number) => void;
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

// 3. Crie o contexto com um valor padrão
const StoreContext = createContext<StoreContextType | undefined>(undefined);

// 4. Crie o componente Provider
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

  // Função para buscar produtos do Supabase
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false }); // Ordena para mostrar os mais novos primeiro

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        throw error;
      }

      if (data) {
        // Mapeamento explícito para garantir que o objeto do produto corresponda exatamente à interface Product.
        const transformedProducts: Product[] = data.map((dbProduct) => ({
          id: dbProduct.id,
          created_at: dbProduct.created_at,
          name: dbProduct.name,
          description: dbProduct.description || '',
          images: dbProduct.images || [],
          stock: dbProduct.stock ?? 0,
          priceSale: dbProduct.price ?? 0,
          priceOriginal: dbProduct.price_original ?? dbProduct.price ?? 0,
        }));
        setAllProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Ocorreu um erro em fetchProducts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Busca os produtos quando o provedor é montado
  useEffect(() => {
    fetchProducts();
  }, []);

  // Efeito para buscar/limpar o carrinho do banco de dados baseado na sessão do usuário
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
        // Se o usuário deslogar, limpa o carrinho do estado local
        setCart([]);
        setIsCartLoading(false);
      }
    };

    handleUserSessionCart();
  }, [user]);

  // Função para atualizar os filtros de forma segura
  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  // Lógica de filtragem e ordenação otimizada com useMemo
  const products = useMemo(() => {
    let filtered = [...allProducts];

    // 1. Filtrar por texto (nome e descrição)
    if (filters.searchText) {
      const lowercasedText = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(lowercasedText) ||
          p.description.toLowerCase().includes(lowercasedText)
      );
    }

    // 2. Filtrar por faixa de preço
    filtered = filtered.filter(
      (p) =>
        p.priceSale >= filters.priceRange.min &&
        p.priceSale <= filters.priceRange.max
    );

    // 3. Ordenar
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

  // Deriva a lista de produtos no carrinho (com detalhes completos) a partir do estado do carrinho.
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

  // Adiciona um produto ao carrinho ou incrementa sua quantidade.
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

    // Validação de estoque ANTES da atualização otimista
    const product = allProducts.find((p) => p.id === productId);
    if (!product) {
      console.error(`Produto com ID ${productId} não encontrado.`);
      toast.error('Ocorreu um erro e o produto não foi encontrado.');
      return;
    }

    const itemInCart = cart.find((item) => item.productId === productId);
    const currentQuantityInCart = itemInCart ? itemInCart.quantity : 0;

    // Verifica se a quantidade desejada excede o estoque
    if (currentQuantityInCart >= product.stock) {
      toast.error(`Estoque esgotado para "${product.name}".`);
      return;
    }

    // Atualização otimista da UI
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.productId === productId);
      if (existingItem) {
        return currentCart.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...currentCart, { productId, quantity: 1 }];
    });

    // Sincroniza com o banco de dados usando a RPC
    const { error } = await supabase.rpc('add_to_cart', {
      p_product_id: productId,
      p_quantity_change: 1,
    });

    if (error) {
      console.error('Erro ao salvar no carrinho:', error);
      // Em caso de erro, reverte a UI buscando os dados reais do banco
      const { data } = await supabase.from('user_carts').select('product_id, quantity').eq('user_id', user.id);
      toast.error('Não foi possível adicionar ao carrinho.');
      setCart(data?.map(item => ({ productId: item.product_id, quantity: item.quantity })) || []);
    }
  };

  // Remove um produto completamente do carrinho.
  const removeFromCart = async (productId: number) => {
    if (!user) return;

    // Atualização otimista da UI
    setCart((currentCart) => currentCart.filter((item) => item.productId !== productId));

    // Sincroniza com o banco de dados
    const { error } = await supabase
      .from('user_carts')
      .delete()
      .match({ user_id: user.id, product_id: productId });
    
    if (error) {
      console.error('Erro ao remover do carrinho:', error);
      // Reverte em caso de erro
      const { data } = await supabase.from('user_carts').select('product_id, quantity').eq('user_id', user.id);
      setCart(data?.map(item => ({ productId: item.product_id, quantity: item.quantity })) || []);
    }
  };

  // Limpa todos os itens do carrinho.
  const clearCart = async () => {
    if (!user) return;

    // Atualização otimista da UI
    setCart([]);

    // Sincroniza com o banco de dados
    const { error } = await supabase
      .from('user_carts')
      .delete()
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Erro ao limpar carrinho:', error);
      // Reverte em caso de erro
      const { data } = await supabase.from('user_carts').select('product_id, quantity').eq('user_id', user.id);
      setCart(data?.map(item => ({ productId: item.product_id, quantity: item.quantity })) || []);
    }
  };

  const updateStock = async (productId: number, newStock: number) => {
    setAllProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)));
    const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', productId);
    if (error) {
      console.error('Erro ao atualizar o estoque:', error);
      fetchProducts(); // Reverte se a atualização falhar
    }
  };

  // Calcula os limites de preço (min/max) para usar em um slider de filtro
  const priceBounds = useMemo(() => {
    if (allProducts.length === 0) {
      return { min: 0, max: 1000 }; // Fallback
    }
    const prices = allProducts.map((p) => p.priceSale);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [allProducts]);

  // Calcula o número total de itens no carrinho (somando as quantidades).
  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // Calcula o valor total do carrinho.
  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.priceSale * item.quantity,
      0
    );
  }, [cartItems]);

  const value = {
    products, // Lista já filtrada e ordenada para a UI
    allProducts, // Lista completa para cálculos (ex: limites de preço)
    isCartLoading,
    isLoading,
    addToCart,
    updateStock,
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

// 5. Crie um hook customizado para facilitar o uso
export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore deve ser usado dentro de um StoreProvider');
  }
  return context;
}
