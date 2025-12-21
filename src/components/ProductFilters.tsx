import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Search } from 'lucide-react';

export default function ProductFilters() {
  const store = useStore();

  // Adiciona uma guarda para garantir que o contexto esteja totalmente inicializado.
  // Isso previne erros se o componente renderizar antes dos valores do contexto estarem prontos.
  if (!store.filters || !store.priceBounds) {
    return null; // Não renderiza nada até que os filtros e limites de preço estejam disponíveis.
  }

  const { filters, updateFilters, priceBounds } = store;
  // Estados locais para os inputs, permitindo o debounce
  // O estado local é necessário para que a UI seja responsiva enquanto o usuário digita ou arrasta,
  // enquanto a atualização do filtro global (que dispara uma nova busca/filtragem) é atrasada (debounced).
  const [searchText, setSearchText] = useState(filters.searchText);
  const [sliderPrice, setSliderPrice] = useState(priceBounds.max);

  // Efeito para aplicar o debounce na busca por texto
  useEffect(() => {
    const handler = setTimeout(() => {
      updateFilters({ searchText });
    }, 300); // Atraso de 300ms

    return () => clearTimeout(handler);
  }, [searchText, updateFilters]);

  // Efeito para aplicar o debounce no filtro de preço
  useEffect(() => {
    const handler = setTimeout(() => {
      // Atualiza o filtro global apenas se o valor do slider for diferente do filtro atual,
      // para evitar atualizações desnecessárias na montagem inicial.
      if (sliderPrice !== filters.priceRange.max) {
        updateFilters({ priceRange: { min: 0, max: sliderPrice } });
      }
    }, 200); // Atraso de 200ms

    return () => clearTimeout(handler);
  }, [sliderPrice, filters.priceRange.max, updateFilters]);

  // Sincroniza o estado local com o contexto global.
  // Isso é crucial para duas situações:
  // 1. Na montagem inicial, quando `priceBounds` é atualizado com os dados reais dos produtos.
  // 2. Se os filtros forem resetados por outra parte da aplicação.
  useEffect(() => {
    setSearchText(filters.searchText);

    const newSliderPrice = filters.priceRange.max === Infinity ? priceBounds.max : filters.priceRange.max;
    setSliderPrice(newSliderPrice);
  }, [filters.searchText, filters.priceRange.max, priceBounds.max]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ sortBy: e.target.value as 'newest' | 'price-asc' | 'price-desc' });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {/* Filtro de Busca */}
        <div className="md:col-span-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar Produto
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
              placeholder="Óculos de sol..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {/* Filtro de Preço */}
        <div className="md:col-span-1">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Preço Máximo: <span className="font-bold text-blue-900">R${sliderPrice.toFixed(0)}</span>
          </label>
          <input
            type="range"
            id="price"
            min={priceBounds.min}
            max={priceBounds.max}
            value={sliderPrice}
            onChange={(e) => setSliderPrice(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Ordenação */}
        <div className="md:col-span-1">
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            Ordenar por
          </label>
          <select
            id="sort"
            name="sort"
            value={filters.sortBy}
            onChange={handleSortChange}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
          >
            <option value="newest">Mais Recentes</option>
            <option value="price-asc">Preço: Menor para Maior</option>
            <option value="price-desc">Preço: Maior para Menor</option>
          </select>
        </div>
      </div>
    </div>
  );
}