// 定义标签类型的枚举或联合类型，方便管理和约束
export type TagCategory =
  | "REPEAT_CUSTOMER" // 回头客/复购类
  | "SALES_RANK" // 销量排名类
  | "PORTION_FEEDBACK" // 分量反馈
  | "TASTE_FEEDBACK"; // 味道反馈

// 基础类型定义
export interface Tag {
  text: string;
  category: TagCategory;
  name?: string;
  color?: string;
}

export interface Dish {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  tags?: Tag[];
  description?: string;
}

// 购物车项目类型
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  options?: Record<string, string>;
  category?: string;
  image?: string;
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
  id: string;
  image: string;
  name: string;
  category: string;
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
      dish_name?: string;
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

// 优惠券专用菜品类型
export interface DishForCoupon {
  id: string;
  name: string;
  dish_name: string;
  price?: number;
  originalPrice?: number;
  category_id?: string;
  category_name?: string;
} 