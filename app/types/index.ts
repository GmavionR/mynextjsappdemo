// 导入其他文件中定义的类型
import { Dish, Tag } from '../stores/dishes';

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

// 菜品项组件属性类型
export interface DishItemProps {
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

export interface Coupon {
  id: string;
  user_id: string;
  template_id: string;
  status: 'UNUSED' | 'USED' | 'EXPIRED';
  acquired_at: string;
  expires_at: string;
  used_at: string | null;
  used_order_id: string | null;
  created_at: string;
  updated_at: string;
  coupon_templates: {
    id: string;
    name: string;
    type: 'CASH_VOUCHER' | 'PERCENTAGE_DISCOUNT' | 'FREE_ITEM';
    value: {
      amount?: number;
      percentage?: number;
      max_off?: number;
      item_id?: string;
      item_name?: string;
    };
    usage_rules: Array<{
      rule_type: 'MINIMUM_SPEND' | 'ITEM_ELIGIBILITY' | 'GIFT_CONDITION';
      params: {
        amount?: number;
        items?: Array<{ id: string; name: string }>;
        categories?: Array<{ id: string; name: string }>;
        required_items?: Array<{ id: string; name: string }>;
        required_categories?: Array<{ id: string; name: string }>;
        min_spend?: number;
      };
    }>;
    total_quantity: number;
    issued_quantity: number;
    per_user_limit: number;
    issue_start_time: string;
    issue_end_time: string;
    validity_type: string;
    valid_from: string | null;
    valid_until: string | null;
    valid_days_after_issue: number;
    status: string;
    target_user_group: {
      type: string;
      tags?: string[];
    } | null;
    remarks: string;
    created_at: string;
    updated_at: string;
  };
}

export interface CouponListProps {
  coupons: Coupon[];
}