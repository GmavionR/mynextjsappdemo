'use client';
import { ChevronLeft, Search, Star, MessageCircle, MoreHorizontal, Plus, ShoppingCart, X, Trash2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { dishesData, type Dish, type Specifications, type SpecificationOption, type Tag } from '../stores/dishes';
import { CartItem, Coupon } from '../types';
import { useSearch } from '../hooks/useSearch';
import SearchModal from '../components/SearchModal';
import Toast from '../components/Toast';
import DishItem from '../components/DishItem';
import CouponList from '../components/CouponList';
import { DISH_CATEGORIES, DISH_CATEGORY_NAMES, getCategoryNameById, type DishCategoryId } from '../types/constants';

const menuData = dishesData;

const RestaurantPage = () => {
  const [activeTab, setActiveTab] = useState('点菜');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const {
    searchQuery,
    searchResults,
    searchHistory,
    handleSearch,
    handleSearchSubmit,
    clearHistory,
  } = useSearch(menuData);

  useEffect(() => {
    if (isCartOpen || isSearchOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isCartOpen, isSearchOpen]);

  useEffect(() => {
    if (activeTab === '超优惠') {
      fetchCoupons();
    }
  }, [activeTab]);

  const showSuccessToast = (dishName: string) => {
    setToastMessage(`已添加 ${dishName}`);
    setShowToast(true);
  };

  const addToCart = (item: CartItem) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(cartItem => 
        cartItem.name === item.name && 
        JSON.stringify(cartItem.options) === JSON.stringify(item.options)
      );
      
      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity++;
        return newCart;
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
    showSuccessToast(item.name);
  };

  const updateQuantity = (name: string, options: Record<string, string>, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.name === name && JSON.stringify(item.options) === JSON.stringify(options)) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter((item): item is CartItem => item !== null);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/coupon');
      const data = await response.json();
      if (data.coupons) {
        console.log('Fetched coupons:', data.coupons);
        setCoupons(data.coupons);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white min-h-screen pb-24">
        <BannerAndHeader onSearchClick={() => setIsSearchOpen(true)} />
        <div className="p-4 relative z-10">
          <RestaurantInfoCard />
        </div>
        <div className="bg-white sticky top-0 z-10 shadow-sm">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="p-4">
          {activeTab === '点菜' && <Menu addToCart={addToCart} />}
          {activeTab === '超优惠' && <CouponList coupons={coupons} />}
          {activeTab === '评价' && <div className="text-center p-8">评价 Content</div>}
          {activeTab === '商家' && <div className="text-center p-8">商家 Content</div>}
        </div>
        <CartFooter cart={cart} toggleCart={() => setIsCartOpen(!isCartOpen)} />
        {isCartOpen && (
          <CartPopup 
            cart={cart} 
            onClose={() => setIsCartOpen(false)} 
            updateQuantity={updateQuantity} 
            clearCart={clearCart} 
          />
        )}
        {isSearchOpen && (
          <SearchModal 
            onClose={() => setIsSearchOpen(false)} 
            searchQuery={searchQuery}
            onSearch={handleSearch}
            onSearchSubmit={handleSearchSubmit}
            searchResults={searchResults}
            searchHistory={searchHistory}
            clearHistory={clearHistory}
            addToCart={addToCart}
          />
        )}
        {showToast && (
          <Toast 
            message={toastMessage} 
            onClose={() => setShowToast(false)} 
          />
        )}
      </div>
    </div>
  );
};

const BannerAndHeader = ({ onSearchClick }: { onSearchClick: () => void }) => (
    <div className="relative">
        <Image 
            src="/20250707_185154.jpg" 
            alt="Restaurant Banner" 
            width={500} 
            height={250}
            className="w-full h-48 md:h-64 object-cover" 
        />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-end items-center bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center space-x-2 md:space-x-3">
                <button onClick={onSearchClick} className="text-white bg-black/30 rounded-full p-1"><Search size={20} /></button>
                <button className="text-white bg-black/30 rounded-full p-1"><MoreHorizontal size={20} /></button>
            </div>
        </div>
    </div>
);


const RestaurantInfoCard = () => (
    <div className="bg-white p-4 rounded-lg shadow-md -mt-16">
        <div className="flex flex-col md:flex-row items-start md:items-end">
            <div className="w-24 h-24 bg-gray-300 rounded-lg flex-shrink-0 -mt-8 border-4 border-white">
            </div>
            <div className="mt-4 md:mt-0 md:ml-4">
                <h1 className="text-2xl font-bold">正宗山东手工水饺</h1>
                <div className="flex flex-wrap items-center text-xs text-gray-500 mt-1 space-x-3">
                    <span>评分 4.8</span>
                    <span>月售 2000+</span>
                    <span>美团快送 约40分钟</span>
                </div>
            </div>
        </div>
        <div className="mt-4 text-xs text-gray-500">
            <p>羊, 质量为本。欢迎您光临小店。本店提供手撕定额发票。 手工制作, 拒...</p>
        </div>
        <div className="mt-4 flex items-center space-x-2 overflow-x-auto pb-2">
            <div className="bg-red-100 border border-red-500 text-red-500 px-2 py-1 rounded-md flex items-center text-sm flex-shrink-0">
                <span className="font-bold text-red-600">神券</span> 
                <span className="font-bold text-lg text-red-600 mx-1">¥18</span>
                <span>满38可用</span>
            </div>
            <div className="bg-red-500 text-white px-3 py-1 rounded-md text-sm flex-shrink-0">¥1 领</div>
            <div className="bg-red-500 text-white px-3 py-1 rounded-md text-sm flex-shrink-0">¥20 领</div>
            <span className="text-red-500 text-sm flex-shrink-0">45减3 | 65减6 | 100减15</span>
        </div>
    </div>
);

const Tabs = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
    const tabs = ['点菜', '超优惠', '评价', '商家'];
    const tabCounts: { [key: string]: string } = { '评价': '697' };

    return (
        <div className="flex border-b">
            {tabs.map(tab => (
                <button
                    key={tab}
                    className={`flex-1 py-3 text-center relative ${activeTab === tab ? 'text-black font-bold' : 'text-gray-500'}`}
                    onClick={() => setActiveTab(tab)}
                >
                    <span>{tab}</span>
                    {tabCounts[tab] && (
                        <span className="ml-1 text-xs text-gray-400">
                            {tabCounts[tab]}
                        </span>
                    )}
                    {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400"></div>
                    )}
                </button>
            ))}
        </div>
    );
};

const Menu = ({ addToCart }: { addToCart: (item: CartItem) => void }) => {
    const [selectedCategory, setSelectedCategory] = useState<DishCategoryId>(DISH_CATEGORIES.DISCOUNT.id);
    const categories = Object.values(DISH_CATEGORIES);
    const dishes = menuData[selectedCategory];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

    const handleAddToCart = (dish: Dish) => {
      addToCart({ 
        name: dish.name, 
        price: dish.price,
        quantity: 1,
        options: {}
      });
    };

    const openModal = (dish: Dish) => {
        setSelectedDish(dish);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDish(null);
    };

    return (
        <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/4">
                <div className="flex flex-row flex-wrap md:flex-col md:overflow-visible space-x-2 md:space-x-0">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`py-2 px-3 rounded-lg text-left w-auto md:w-full ${selectedCategory === category.id ? 'bg-gray-100 font-bold text-gray-900' : 'bg-transparent text-gray-600'}`}
                        >
                            <span className="leading-tight">{category.name}</span>
                        </button>
                    ))}
                </div>
                <div className="bg-yellow-50 mt-2 overflow-hidden">
                    <div className="flex items-center justify-center py-1.5 px-2 relative w-full">
                        <div className="flex items-center gap-1 animate-scroll-x w-full justify-center">
                            <AlertCircle size={14} className="text-yellow-600 flex-shrink-0" />
                            <span className="text-yellow-700 text-xs whitespace-nowrap">
                                如需其他菜品可告知老板,支持带菜加工.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full md:w-3/4 bg-white p-4 md:ml-2 rounded-lg">
                <h3 className="text-lg font-bold mb-4">{getCategoryNameById(selectedCategory)}</h3>
                {dishes.map((dish: Dish) => (
                    <DishItem
                        key={dish.id}
                        image={`https://picsum.photos/seed/${dish.name}/200/300`}
                        name={dish.name}
                        tags={dish.tags}
                        price={dish.price}
                        originalPrice={dish.originalPrice}
                        discount={dish.discount}
                        isSelectable={dish.isSelectable}
                        onSelect={() => openModal(dish)}
                        addToCart={() => handleAddToCart(dish)}
                    />
                ))}
            </div>
            {isModalOpen && selectedDish && (
                <SpecificationModal 
                    dish={selectedDish} 
                    onClose={closeModal} 
                    addToCart={addToCart} 
                />
            )}
        </div>
    );
};

const SpecificationModal = ({ dish, onClose, addToCart }: { dish: any, onClose: () => void, addToCart: (item: any) => void }) => {
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
        const initialOptions: Record<string, string> = {};
        Object.keys(dish.specifications).forEach(specCategory => {
            initialOptions[specCategory] = dish.specifications[specCategory][0].name;
        });
        return initialOptions;
    });

    const totalPrice = useMemo(() => {
        let total = dish.price;
        Object.keys(selectedOptions).forEach(specCategory => {
            const selectedOptionName = selectedOptions[specCategory];
            const option = dish.specifications[specCategory].find((o: any) => o.name === selectedOptionName);
            if (option) {
                total += option.price;
            }
        });
        return total;
    }, [selectedOptions, dish]);

    const handleOptionClick = (specCategory: string, optionName: string) => {
        setSelectedOptions(prev => ({ ...prev, [specCategory]: optionName }));
    };

    const handleAddToCart = () => {
        addToCart({
            name: dish.name,
            price: totalPrice,
            options: selectedOptions,
        });
        onClose();
    };

    const selectedSpecs = Object.values(selectedOptions).join(', ');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{dish.name}</h3>
                    <button onClick={onClose} className="text-gray-500"><X size={24} /></button>
                </div>
                <div>
                    {Object.keys(dish.specifications).map(specCategory => (
                        <div key={specCategory} className="mb-4">
                            <h4 className="font-semibold text-sm mb-2">{specCategory}</h4>
                            <div className="flex flex-wrap gap-2">
                                {dish.specifications[specCategory].map((option: any) => (
                                    <button
                                        key={option.name}
                                        onClick={() => handleOptionClick(specCategory, option.name)}
                                        className={`px-3 py-1.5 text-sm rounded-full ${selectedOptions[specCategory] === option.name ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}
                                    >
                                        {option.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-between items-center mt-6">
                        <div className="flex-1">
                            <p className="text-xs text-gray-600 mb-1">已选规格: {selectedSpecs}</p>
                            <div className="flex items-baseline">
                                <span className="text-red-500 text-lg font-bold">¥{totalPrice.toFixed(2)}</span>
                                <span className="text-gray-400 line-through ml-2 text-sm">¥{dish.originalPrice.toFixed(2)}</span>
                                <span className="bg-red-100 text-red-500 text-xs font-bold px-2 py-1 rounded-md ml-2">{dish.discount}</span>
                            </div>
                        </div>
                        <button onClick={handleAddToCart} className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap">加入购物车</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CartFooter = ({ cart, toggleCart }: { cart: CartItem[], toggleCart: () => void }) => {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    const isEmpty = totalItems === 0;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-2 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] flex justify-between items-center z-20 max-w-7xl mx-auto">
            <div className="flex items-center">
                <button 
                    onClick={!isEmpty ? toggleCart : undefined} 
                    className={`p-3 rounded-full relative ${isEmpty ? 'bg-gray-300' : 'bg-yellow-400'}`}
                >
                    {!isEmpty && <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{totalItems}</div>}
                    <ShoppingCart className={`${isEmpty ? 'text-gray-500' : 'text-black'}`} />
                </button>
                <div className="ml-4">
                    {isEmpty ? (
                        <p className="text-gray-500">未选购商品</p>
                    ) : (
                        <>
                            <p className="text-xl font-bold text-black">¥{totalPrice.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">另需配送费 ¥3</p>
                        </>
                    )}
                </div>
            </div>
            <button 
                disabled={isEmpty}
                className={`px-8 py-3 rounded-full text-base md:text-lg font-bold ${isEmpty ? 'bg-gray-300 text-gray-500' : 'bg-yellow-400 text-black'}`}
            >
                {isEmpty ? '¥20起送' : '去结算'}
            </button>
        </div>
    );
};

const CartPopup = ({ 
  cart, 
  onClose, 
  updateQuantity, 
  clearCart 
}: { 
  cart: CartItem[];
  onClose: () => void;
  updateQuantity: (name: string, options: Record<string, string>, delta: number) => void;
  clearCart: () => void;
}) => {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const isEmpty = totalItems === 0;

    return (
        <div className="fixed inset-0 z-40 flex items-end bg-black/50" onClick={onClose}>
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg max-h-[50vh] flex flex-col max-w-7xl mx-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg">已选购商品</h3>
                    <button onClick={clearCart} className="text-sm text-gray-500 flex items-center"><Trash2 className="w-4 h-4 mr-1" />清空</button>
                </div>
                <div className="overflow-y-auto p-4 flex-grow">
                    {cart.map((item, index) => (
                        <div key={index} className="flex justify-between items-center mb-4">
                            <div className='flex items-center'>
                                <Image 
                                    src={`https://picsum.photos/seed/${item.name}/200/300`} 
                                    alt={item.name} 
                                    width={48}
                                    height={48}
                                    className="rounded-md mr-4 w-12 h-12 object-cover" 
                                />
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    {item.options && Object.keys(item.options).length > 0 && (
                                      <p className="text-xs text-gray-500">{Object.values(item.options).join(', ')}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold mr-4">¥{(item.price * item.quantity).toFixed(2)}</span>
                                <div className="flex items-center">
                                    <button onClick={() => updateQuantity(item.name, item.options || {}, -1)} className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center">-</button>
                                    <span className="mx-2">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.name, item.options || {}, 1)} className="bg-yellow-400 text-white rounded-full w-6 h-6 flex items-center justify-center">+</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {!isEmpty && (
                    <div className="px-4 py-2 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">商品合计</span>
                            <span className="font-medium">含{totalItems}件商品 ¥{totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                )}
                {!isEmpty && (
                    <div className="p-4 border-t flex justify-between items-center">
                        <div>
                            <p className="text-xl font-bold text-black">¥{totalPrice.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">另需配送费 ¥3</p>
                        </div>
                        <button className="bg-yellow-400 text-black px-8 py-3 rounded-full text-base md:text-lg font-bold">
                            去结算
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantPage;
