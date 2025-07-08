import { useState } from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import { SearchProps, CartItem } from '../types';
import DishItem from './DishItem';
import SpecificationModal from './SpecificationModal';
import Toast from './Toast';
import { Dish } from '../stores/dishes';

export default function SearchModal({ 
  onClose, 
  searchQuery, 
  onSearch,
  onSearchSubmit,
  searchResults,
  searchHistory,
  clearHistory,
  addToCart
}: SearchProps) {
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(searchQuery);
  };

  const handleDishSelect = (dish: Dish) => {
    if (dish.isSelectable) {
      setSelectedDish(dish);
      setIsSpecModalOpen(true);
    } else {
      const cartItem: CartItem = {
        id: dish.id,
        name: dish.name,
        price: dish.price,
        quantity: 1,
        options: {},
        category: dish.category,
        image: dish.image
      };
      addToCart(cartItem);
      showSuccessToast(dish.name);
    }
  };

  const showSuccessToast = (dishName: string) => {
    setToastMessage(`已添加 ${dishName}`);
    setShowToast(true);
  };

  const handleSpecModalAddToCart = (item: CartItem) => {
    addToCart(item);
    setIsSpecModalOpen(false);
    showSuccessToast(item.name);
  };

  return (
    <div className="fixed inset-0 bg-white z-50">
      {/* 搜索头部 */}
      <div className="sticky top-0 bg-white shadow-sm">
        <div className="flex items-center p-4 gap-3">
          <button onClick={onClose} className="p-2">
            <ChevronLeft size={24} />
          </button>
          <form onSubmit={handleSubmit} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="搜索菜品"
                className="w-full py-2 pl-10 pr-4 bg-gray-100 rounded-full outline-none"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </form>
        </div>
      </div>

      {/* 搜索内容 */}
      <div className="p-4">
        {searchQuery ? (
          <SearchResults 
            searchResults={searchResults} 
            handleDishSelect={handleDishSelect} 
            addToCart={addToCart}
          />
        ) : (
          <SearchHistory 
            searchHistory={searchHistory}
            clearHistory={clearHistory}
            onSearchSubmit={onSearchSubmit}
          />
        )}
      </div>

      {/* 规格选择弹窗 */}
      {isSpecModalOpen && selectedDish && (
        <SpecificationModal 
          dish={selectedDish} 
          onClose={() => setIsSpecModalOpen(false)} 
          addToCart={handleSpecModalAddToCart} 
        />
      )}

      {/* 提示信息 */}
      {showToast && (
        <Toast 
          message={toastMessage} 
          onClose={() => setShowToast(false)} 
        />
      )}
    </div>
  );
}

// 搜索结果组件
function SearchResults({ 
  searchResults, 
  handleDishSelect, 
  addToCart 
}: { 
  searchResults: Dish[];
  handleDishSelect: (dish: Dish) => void;
  addToCart: SearchProps['addToCart'];
}) {
  return (
    <>
      <div className="text-sm text-gray-500 mb-4">
        {searchResults.length ? `找到 ${searchResults.length} 个相关菜品` : '未找到相关菜品'}
      </div>
      <div className="space-y-6">
        {searchResults.map((dish, index) => (
          <DishItem
            key={index}
            id={dish.id}
            category={dish.category}
            image={`https://picsum.photos/seed/${dish.name}/200/300`}
            name={dish.name}
            tags={dish.tags}
            price={dish.price}
            originalPrice={dish.originalPrice || dish.price}
            discount={dish.discount || ""}
            isSelectable={dish.isSelectable}
            onSelect={() => handleDishSelect(dish)}
            addToCart={() => handleDishSelect(dish)}
          />
        ))}
      </div>
    </>
  );
}

// 搜索历史组件
function SearchHistory({ 
  searchHistory, 
  clearHistory, 
  onSearchSubmit 
}: { 
  searchHistory: string[];
  clearHistory: () => void;
  onSearchSubmit: (query: string) => void;
}) {
  if (searchHistory.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8">
        <Search size={48} className="mx-auto mb-4 text-gray-300" />
        <p>搜索你想要的菜品</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-gray-500 text-sm">搜索历史</h3>
        <button 
          onClick={clearHistory}
          className="text-gray-400 text-sm hover:text-gray-600"
        >
          清空历史记录
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searchHistory.map((query, index) => (
          <button
            key={index}
            onClick={() => onSearchSubmit(query)}
            className="px-4 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200"
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  );
} 