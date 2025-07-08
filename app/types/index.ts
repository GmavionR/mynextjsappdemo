// 购物车项目类型
export interface CartItem {
  name: string;
  price: number;
  quantity: number;
  options?: Record<string, string>;
}

// 搜索相关类型
export interface SearchProps {
  onClose: () => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  searchResults: Dish[];
  searchHistory: string[];
  clearHistory: () => void;
  addToCart: (item: CartItem) => void;
}

// 规格选择相关类型
export interface SpecificationModalProps {
  dish: Dish;
  onClose: () => void;
  addToCart: (item: CartItem) => void;
}

// 菜单项组件属性类型
export interface MenuItemProps {
  image: string;
  name: string;
  tags?: Tag[];
  price: number;
  originalPrice: number;
  discount: string;
  promoPrice?: number | null;
  isSelectable?: boolean;
  isSignature?: boolean;
  onSelect?: () => void;
  addToCart: (item: CartItem) => void;
}

// 导航标签相关类型
export interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// 购物车相关类型
export interface CartFooterProps {
  cart: CartItem[];
  toggleCart: () => void;
}

export interface CartPopupProps {
  cart: CartItem[];
  onClose: () => void;
  updateQuantity: (name: string, options: Record<string, string>, delta: number) => void;
  clearCart: () => void;
} 