"use client";
import { useState, useEffect } from "react";
import { type Dish } from "../types/index";
import { useClientDishesState } from "../stores/clientSafeDishesStore";
import {
  CartItem,
  Coupon,
  CouponEligibilityResult,
  CouponTemplate,
  UsageRule,
} from "../types";
import { useSearch } from "../hooks/useSearch";
import SearchModal from "./SearchModal";
import Toast from "./Toast";
import CouponList from "./CouponList";
import {
  type DishCategoryId,
} from "../types/constants";
import BannerAndHeader from "./BannerAndHeader";
import RestaurantInfoCard from "./RestaurantInfoCard";
import Tabs from "./Tabs";
import Menu from "./Menu";
import CartFooter from "./CartFooter";
import CartPopup from "./CartPopup";

// 检查优惠券是否可用于当前购物车
const checkCouponEligibilityForCart = (
  coupon: Coupon,
  cart: CartItem[]
): CouponEligibilityResult => {
  // 1. 状态校验 (快速失败)
  const now = new Date();
  const expiresAt = new Date(coupon.expires_at);

  if (coupon.status !== "UNUSED") {
    return { isEligible: false, reason: "优惠券已使用", savings: 0 };
  }

  if (now > expiresAt) {
    return { isEligible: false, reason: "优惠券已过期", savings: 0 };
  }

  const template = coupon.coupon_templates;
  const rules = template.usage_rules;
  
  // 验证上下文，用于记录受影响的商品信息
  let validationContext: { 
    associatedCartItemIndex?: number;
    associatedDishId?: string;
    associatedDishName?: string;
  } = {};

  // 2. 规则逐一校验
  for (const rule of rules) {
    const ruleResult = checkSingleRule(rule, cart, template, validationContext);
    if (!ruleResult.isValid) {
      return { isEligible: false, reason: ruleResult.reason, savings: 0 };
    }
  }

  // 3. 所有规则都通过，计算优惠
  const { 
    savings, 
    associatedCartItemIndex, 
    associatedDishId, 
    associatedDishName 
  } = calculateDiscountAmount(
    template,
    cart,
    validationContext
  );

  return {
    isEligible: true,
    savings,
    associatedCartItemIndex,
    associatedDishId,
    associatedDishName
  };
};

// 检查单个规则
const checkSingleRule = (
  rule: UsageRule,
  cart: CartItem[],
  template: any,
  context: { 
    associatedCartItemIndex?: number;
    associatedDishId?: string;
    associatedDishName?: string;
  }
): { isValid: boolean; reason?: string } => {
  switch (rule.rule_type) {
    case "MINIMUM_SPEND":
      const totalPrice = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      if (typeof rule.params.min_spend === "number") {
        if (totalPrice < rule.params.min_spend) {
          return {
            isValid: false,
            reason: `需消费满${
              rule.params.min_spend
            }元，当前仅${totalPrice.toFixed(2)}元`,
          };
        }
      }
      return { isValid: true };

    case "ITEM_ELIGIBILITY":
      // 找出所有符合条件的商品项
      const eligibleItemIndices: number[] = [];

      cart.forEach((item, index) => {
        let isItemEligible = false;

        // 检查商品ID限制
        if (
          rule.params.required_items &&
          rule.params.required_items.length > 0
        ) {
          const eligibleItemIds = rule.params.required_items.map(
            (i: any) => i.id
          );
          isItemEligible = isItemEligible || eligibleItemIds.includes(item.id);
        }

        // 检查分类限制
        if (
          rule.params.required_categories &&
          rule.params.required_categories.length > 0
        ) {
          const eligibleCategoryIds = rule.params.required_categories.map(
            (cat: any) => cat.id
          );
          isItemEligible =
            isItemEligible ||
            (item.category
              ? eligibleCategoryIds.includes(String(item.category))
              : false);
        }

        if (isItemEligible) {
          eligibleItemIndices.push(index);
        }
      });

      if (eligibleItemIndices.length === 0) {
        const itemNames =
          rule.params.required_items?.map((i: any) => i.name).join("、") || "";
        const categoryNames =
          rule.params.required_categories
            ?.map((cat: any) => cat.name)
            .join("、") || "";
        const restriction = [itemNames, categoryNames]
          .filter(Boolean)
          .join("或");
        return {
          isValid: false,
          reason: `需购买${restriction}商品`,
        };
      }

      // 如果是PERCENTAGE_DISCOUNT折扣券且有商品限制，选择最贵的商品进行折扣
      if (template.type === "PERCENTAGE_DISCOUNT" && 
          ((rule.params.required_items && rule.params.required_items.length > 0) ||
           (rule.params.required_categories && rule.params.required_categories.length > 0))) {
        const eligibleItems = eligibleItemIndices.map((index) => ({
          item: cart[index],
          index,
        }));
        const mostExpensive = eligibleItems.reduce((max, current) =>
          current.item.price > max.item.price ? current : max
        );
        context.associatedCartItemIndex = mostExpensive.index;
        context.associatedDishId = mostExpensive.item.id;
        context.associatedDishName = mostExpensive.item.name;
      }

      return { isValid: true };

    case "GIFT_CONDITION":
      let requiredItemIndices: number[] = [];

      // 筛选出必须购买的商品
      if (rule.params.required_items || rule.params.required_categories) {
        cart.forEach((item, index) => {
          let isRequiredItem = false;

          // 检查必需商品ID
          if (
            rule.params.required_items &&
            rule.params.required_items.length > 0
          ) {
            const requiredItemIds = rule.params.required_items.map(
              (i: any) => i.id
            );
            isRequiredItem =
              isRequiredItem || requiredItemIds.includes(item.id);
          }

          // 检查必需分类
          if (
            rule.params.required_categories &&
            rule.params.required_categories.length > 0
          ) {
            const requiredCategoryIds = rule.params.required_categories.map(
              (cat: any) => cat.id
            );
            isRequiredItem =
              isRequiredItem ||
              (item.category
                ? requiredCategoryIds.includes(String(item.category))
                : false);
          }

          if (isRequiredItem) {
            requiredItemIndices.push(index);
          }
        });

        if (requiredItemIndices.length === 0) {
          const itemNames =
            rule.params.required_items?.map((i: any) => i.name).join("、") ||
            "";
          const categoryNames =
            rule.params.required_categories
              ?.map((cat: any) => cat.name)
              .join("、") || "";
          const requirement = [itemNames, categoryNames]
            .filter(Boolean)
            .join("或");
          return {
            isValid: false,
            reason: `需购买${requirement}商品`,
          };
        }
      }

      // 检查范围内的最低消费
      if (rule.params.min_spend && rule.params.min_spend > 0) {
        let priceToCheck = 0;

        if (requiredItemIndices.length > 0) {
          // 计算指定商品的总价
          priceToCheck = requiredItemIndices.reduce((sum, index) => {
            const item = cart[index];
            return sum + item.price * item.quantity;
          }, 0);
        } else {
          // 没有商品限制，使用总价
          priceToCheck = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
        }

        if (priceToCheck < rule.params.min_spend) {
          return {
            isValid: false,
            reason: `需消费满${
              rule.params.min_spend
            }元，当前仅${priceToCheck.toFixed(2)}元`,
          };
        }
      }

      return { isValid: true };

    default:
      return { isValid: true };
  }
};

// 计算优惠金额
const calculateDiscountAmount = (
  template: CouponTemplate,
  cart: CartItem[],
  context: { 
    associatedCartItemIndex?: number;
    associatedDishId?: string;
    associatedDishName?: string;
  }
): { 
  savings: number; 
  associatedCartItemIndex?: number;
  associatedDishId?: string;
  associatedDishName?: string;
} => {
  let savings = 0;
  let associatedCartItemIndex = context.associatedCartItemIndex;

  switch (template.type) {
    case "CASH_VOUCHER":
      // 代金券直接减免总价
      savings = template.value.amount || 0;
      break;

    case "PERCENTAGE_DISCOUNT":
      // 检查是否有商品限制
      const hasItemRestrictions = template.usage_rules.some(rule => 
        rule.rule_type === "ITEM_ELIGIBILITY" && 
        ((rule.params.required_items && rule.params.required_items.length > 0) ||
         (rule.params.required_categories && rule.params.required_categories.length > 0))
      );

      if (hasItemRestrictions && typeof associatedCartItemIndex === "number") {
        // 有商品限制，只对特定商品的一份打折
        const item = cart[associatedCartItemIndex];
        const percentage =
          typeof template.value.percentage === "number"
            ? template.value.percentage
            : 0;
        const discountAmount = item.price * (percentage / 100);
        savings = discountAmount;
      } else {
        // 无商品限制，全场折扣
        const totalPrice = cart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const percentage =
          typeof template.value.percentage === "number"
            ? template.value.percentage
            : 0;
        savings = totalPrice * (percentage / 100);
      }

      // 处理最高优惠上限
      if (template.value.max_off) {
        savings = Math.min(savings, template.value.max_off);
      }
      break;

    case "FREE_ITEM":
      // 赠品优惠金额，使用 dish_price 字段
      if (template.value.dish_price) {
        savings = template.value.dish_price;
      } else if (template.value.amount) {
        // 备选方案：使用 amount 字段
        savings = template.value.amount;
      } else {
        // 如果都没有，则没有优惠
        savings = 0;
      }
      break;
  }

  return { 
    savings, 
    associatedCartItemIndex,
    associatedDishId: context.associatedDishId,
    associatedDishName: context.associatedDishName
  };
};

const RestaurantClient = () => {
  const [activeTab, setActiveTab] = useState("点菜");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // 从 clientSafeDishesStore 获取数据
  const { dishes, loading: dishesLoading, error: dishesError, fetchDishes } = useClientDishesState();

  // 根据菜品ID查找菜品信息
  const findDishById = (dishId: string): Dish | null => {
    for (const categoryDishes of Object.values(dishes)) {
      const dish = (categoryDishes as Dish[]).find((dish: Dish) => dish.id === dishId);
      if (dish) {
        return dish;
      }
    }
    return null;
  };

  const {
    searchQuery,
    searchResults,
    searchHistory,
    handleSearch,
    handleSearchSubmit,
    clearHistory,
  } = useSearch(dishes);

  // 备用获取方法：直接从API获取数据
  const fetchDishesFromAPI = async () => {
    try {
      const response = await fetch('/api/dishes');
      const result = await response.json();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || '获取菜品数据失败');
    } catch (error) {
      console.error('从API获取菜品数据失败:', error);
      throw error;
    }
  };

  // 获取菜品数据
  useEffect(() => {
    const loadDishes = async () => {
      if (Object.keys(dishes).length === 0) {
        try {
          await fetchDishes();
        } catch (error) {
          console.warn('从store获取数据失败，尝试直接从API获取:', error);
          try {
            const apiData = await fetchDishesFromAPI();
            // 这里可以选择手动更新store或者显示API数据
            console.log('从API获取的数据:', apiData);
          } catch (apiError) {
            console.error('从API获取数据也失败了:', apiError);
          }
        }
      }
    };
    
    loadDishes();
  }, [dishes, fetchDishes]);

  useEffect(() => {
    if (isCartOpen || isSearchOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isCartOpen, isSearchOpen]);

  useEffect(() => {
    if (activeTab === "超优惠") {
      fetchCoupons();
    }
  }, [activeTab]);

  const showSuccessToast = (dishName: string) => {
    setToastMessage(`已添加 ${dishName}`);
    setShowToast(true);
  };

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (cartItem) =>
          cartItem.id === item.id &&
          JSON.stringify(cartItem.options) === JSON.stringify(item.options)
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += item.quantity || 1;
        return newCart;
      } else {
        return [...prevCart, { ...item, quantity: item.quantity || 1 }];
      }
    });
    showSuccessToast(item.name);
  };

  const updateQuantity = (
    id: string,
    options: Record<string, string>,
    delta: number
  ) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (
            item.id === id &&
            JSON.stringify(item.options) === JSON.stringify(options)
          ) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const clearCart = () => {
    setCart([]);
    setIsCartOpen(false); // 清空购物车时关闭弹窗
  };

  const fetchCoupons = async () => {
    try {
      const response = await fetch("/api/coupon");
      const data = await response.json();
      if (data.coupons) {
        console.log("Fetched coupons:", data.coupons);
        setCoupons(data.coupons);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
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
          {activeTab === "点菜" && (
            <Menu 
              addToCart={addToCart} 
              dishes={dishes}
              dishesLoading={dishesLoading}
              dishesError={dishesError}
              findDishById={findDishById}
            />
          )}
          {activeTab === "超优惠" && <CouponList coupons={coupons} />}
          {activeTab === "评价" && (
            <div className="text-center p-8">评价 Content</div>
          )}
          {activeTab === "商家" && (
            <div className="text-center p-8">商家 Content</div>
          )}
        </div>
        <CartFooter cart={cart} toggleCart={() => setIsCartOpen(!isCartOpen)} />
        {isCartOpen && cart.length > 0 && (
          <CartPopup
            cart={cart}
            onClose={() => setIsCartOpen(false)}
            updateQuantity={updateQuantity}
            clearCart={clearCart}
            findDishById={findDishById}
            checkCouponEligibilityForCart={checkCouponEligibilityForCart}
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
          <Toast message={toastMessage} onClose={() => setShowToast(false)} />
        )}
      </div>
    </div>
  );
};

export default RestaurantClient;
