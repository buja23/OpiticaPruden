import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from 'react';
import { supabase } from '../lib/supabase';

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

export interface FilterState {
  searchText: string;
  priceRange: { min: number; max: number };
  sortBy: 'newest' | 'price-asc' | 'price-desc';
}

// 2. Defina a forma do valor do seu contexto
interface StoreContextType {
  products: Product[];
  allProducts: Product[];
  isLoading: boolean;
  addToCart: (productId: number) => void;
  updateStock: (productId: number, newStock: number) => void;
  cartItemCount: number;
  filters: FilterState;
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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<number[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    priceRange: { min: 0, max: Infinity },
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
          stock: dbProduct.stock,
          priceSale: dbProduct.price,
          priceOriginal: dbProduct.price_original || dbProduct.price,
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

  // Funções de exemplo
  const addToCart = (productId: number) => {
    setCart((prevCart) => [...prevCart, productId]);
    console.log(`Produto ${productId} adicionado ao carrinho. Total: ${cart.length + 1}`);
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

  const cartItemCount = cart.length;

  const value = {
    products, // Lista já filtrada e ordenada para a UI
    allProducts, // Lista completa para cálculos (ex: limites de preço)
    isLoading,
    addToCart,
    updateStock,
    cartItemCount,
    filters,
    updateFilters,
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
