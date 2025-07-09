// =============================================
// 基础类型定义
// =============================================

// 通用ID和名称类型
export interface IdName {
  id: string;
  name: string;
}

// 时间戳类型
export interface Timestamps {
  created_at: string;
  updated_at: string;
}

// 通用状态类型
export type Status = 'UNUSED' | 'USED' | 'EXPIRED';

// =============================================
// 菜品相关类型
// =============================================

// 标签类型枚举
export type TagCategory =
  | "REPEAT_CUSTOMER" // 回头客/复购类
  | "SALES_RANK" // 销量排名类
  | "PORTION_FEEDBACK" // 分量反馈
  | "TASTE_FEEDBACK"; // 味道反馈

// 菜品标签接口
export interface Tag {
  text: string;
  category: TagCategory;
  name?: string;
  color?: string;
}

// 基础菜品信息
export interface DishBase extends IdName {
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
}

// 规格选项接口
export interface SpecificationOption {
  name: string;
  price: number;
  isDefault?: boolean;
}

// 规格类别接口
export interface Specifications {
  [key: string]: SpecificationOption[];
}

// 完整菜品信息
export interface Dish extends DishBase {
  isSignature?: boolean;
  promoPrice?: number;
  discount: string;
  monthSales: number;
  rating: number;
  specifications?: Specifications;
  isSelectable?: boolean;
  tags?: Tag[];
  description?: string;
}

// 优惠券检查用的菜品类型（简化版）
export interface DishForCoupon extends IdName {
  price?: number;
  originalPrice?: number;
  category_id?: string;
}

// =============================================
// 购物车相关类型
// =============================================

// 购物车项目
export interface CartItem extends DishBase {
  quantity: number;
  options?: Record<string, string>;
}

// 虚拟赠品项目（用于显示但不实际添加到购物车）
export interface VirtualGiftItem extends DishBase {
  quantity: number;
  isVirtualGift: true; // 标记为虚拟赠品
  couponId: string; // 关联的优惠券ID
}

// 购物车操作类型
export type CartOperation = (item: CartItem) => void;
export type QuantityUpdateOperation = (id: string, options: Record<string, string>, delta: number) => void;

// =============================================
// 优惠券相关类型
// =============================================

// 优惠券类型枚举
export type CouponType = 'CASH_VOUCHER' | 'PERCENTAGE_DISCOUNT' | 'FREE_ITEM';

// 规则类型枚举
export type RuleType = 'MINIMUM_SPEND' | 'ITEM_ELIGIBILITY' | 'GIFT_CONDITION';

// 优惠券模板值
export interface CouponTemplateValue {
  amount?: number;
  percentage?: number;
  max_off?: number;
  dish_id?: string;
  dish_name?: string;
  dish_price?: number;
}

// 使用规则参数
export interface UsageRuleParams {
  min_spend?: number;
  required_items?: IdName[];
  required_categories?: IdName[];
}

// 使用规则
export interface UsageRule {
  rule_type: RuleType;
  params: UsageRuleParams;
}

// 目标用户组
export interface TargetUserGroup {
  type: string;
  tags?: string[];
}

// 优惠券模板
export interface CouponTemplate extends IdName, Timestamps {
  type: CouponType;
  value: CouponTemplateValue;
  usage_rules: UsageRule[];
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
  target_user_group: TargetUserGroup | null;
  remarks: string;
}

// 优惠券
export interface Coupon extends IdName, Timestamps {
  user_id: string;
  template_id: string;
  status: Status;
  acquired_at: string;
  expires_at: string;
  used_at: string | null;
  used_order_id: string | null;
  coupon_templates: CouponTemplate;
}

// 优惠券可用性检查结果
export interface CouponEligibilityResult {
  isEligible: boolean;
  reason?: string;
  savings: number;
  associatedCartItemIndex?: number;
  associatedDishId?: string;
  associatedDishName?: string;
}

// 优惠券显示信息
export interface CouponDisplayInfo {
  mainTitle: string;
  subTitle: string;
  rules: Array<{
    type: string;
    text: string;
  }>;
}

// =============================================
// 组件Props类型
// =============================================

// 通用Modal Props
export interface BaseModalProps {
  onClose: () => void;
}

// 菜品项组件Props
export interface DishItemProps extends DishBase {
  tags?: Tag[];
  discount: string;
  promoPrice?: number | null;
  isSelectable?: boolean;
  isSignature?: boolean;
  onSelect?: () => void;
  addToCart: CartOperation;
}

// 搜索相关Props
export interface SearchProps extends BaseModalProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  searchResults: any[]; // 保持any[]以避免循环依赖
  searchHistory: string[];
  clearHistory: () => void;
  addToCart: CartOperation;
}

// 规格选择Modal Props
export interface SpecificationModalProps extends BaseModalProps {
  dish: Dish;
  addToCart: CartOperation;
}

// 导航标签Props
export interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// 购物车Footer Props
export interface CartFooterProps {
  cart: CartItem[];
  toggleCart: () => void;
}

// 购物车弹窗Props
export interface CartPopupProps extends BaseModalProps {
  cart: CartItem[];
  updateQuantity: QuantityUpdateOperation;
  clearCart: () => void;
}

// 优惠券列表Props
export interface CouponListProps {
  coupons: Coupon[];
}

// =============================================
// 导出说明
// =============================================

/*
重构说明：
1. 基础类型：IdName, Timestamps, Status - 提供通用的基础类型
2. 菜品类型：DishBase -> Dish -> CartItem - 渐进式扩展
3. 优惠券类型：CouponTemplate -> Coupon - 清晰的模板和实例关系
4. 组件Props：统一继承 BaseModalProps，减少重复代码
5. 操作类型：CartOperation, QuantityUpdateOperation - 统一函数签名
*/