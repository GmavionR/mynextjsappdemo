import Image from "next/image";
import { Plus } from "lucide-react";
import { DishItemProps, Coupon, DishForCoupon } from "../types";
import { useState, useEffect } from "react";

/**
 * 检查优惠券是否可用于指定菜品（与购物车校验逻辑保持一致）
 */
function checkCouponEligibility(
  coupon: Coupon,
  dish: DishForCoupon
): {
  isEligible: boolean;
  reason?: string;
  dishInfo: {
    id: string;
    name: string;
  };
  couponInfo: {
    id: string;
    name: string;
    couponText: string;
  };
} {
  const getCouponValue = () => {
    const template = coupon.coupon_templates;
    switch (template.type) {
      case "CASH_VOUCHER":
        return `¥${template.value.amount}`;
      case "PERCENTAGE_DISCOUNT":
        const discount = template.value.percentage
          ? 10 - template.value.percentage / 10
          : 0;
        return `${discount}折`;
      case "FREE_ITEM":
        return `赠品「${template.value.dish_name || "指定赠品"}」`;
      default:
        return "";
    }
  };

  const baseResult = {
    dishInfo: {
      id: dish.id,
      name: dish.name,
    },
    couponInfo: {
      id: coupon.id,
      name: coupon.coupon_templates.name,
      couponText: getCouponValue(),
    },
  };

  // 1. 检查优惠券基本状态（快速失败）
  const now = new Date();
  
  if (coupon.status !== "UNUSED") {
    return { ...baseResult, isEligible: false, reason: "优惠券已使用" };
  }

  if (new Date(coupon.expires_at) < now) {
    return { ...baseResult, isEligible: false, reason: "优惠券已过期" };
  }

  // 检查优惠券发放时间范围
  const template = coupon.coupon_templates;
  if (template.issue_start_time && template.issue_end_time) {
    const startTime = new Date(template.issue_start_time);
    const endTime = new Date(template.issue_end_time);
    if (now < startTime || now > endTime) {
      return {
        ...baseResult,
        isEligible: false,
        reason: "优惠券不在可用时间范围内",
      };
    }
  }

  // 获取菜品实际价格
  const dishPrice = dish.price ?? dish.originalPrice ?? 0;

  // 2. 规则逐一校验（与购物车版本保持一致）
  for (const rule of template.usage_rules) {
    const ruleResult = checkSingleRuleForDish(rule, dish, dishPrice);
    if (!ruleResult.isValid) {
      return { ...baseResult, isEligible: false, reason: ruleResult.reason };
    }
  }

  // 3. 所有规则都通过，返回可用
  return { ...baseResult, isEligible: true };
}

/**
 * 检查单个规则是否适用于指定菜品（与购物车版本保持一致的逻辑）
 */
function checkSingleRuleForDish(
  rule: any, 
  dish: DishForCoupon, 
  dishPrice: number
): { isValid: boolean; reason?: string } {
  switch (rule.rule_type) {
    case 'MINIMUM_SPEND':
      // 全局最低消费，对于单个菜品就是菜品价格
      if (rule.params.min_spend && dishPrice < rule.params.min_spend) {
        return {
          isValid: false,
          reason: `需消费满${rule.params.min_spend}元，当前菜品仅${dishPrice.toFixed(2)}元`
        };
      }
      return { isValid: true };

    case 'ITEM_ELIGIBILITY':
      // 检查商品和分类限制 (required_items OR required_categories)
      let isEligible = false;
      
      // 检查指定商品 - 只要满足其中一个条件即可
      if (rule.params.required_items && rule.params.required_items.length > 0) {
        const eligibleItemIds = rule.params.required_items.map((item: any) => item.id);
        isEligible = isEligible || eligibleItemIds.includes(dish.id);
      }
      
      // 检查分类限制 - 只要满足其中一个条件即可
      if (rule.params.required_categories && rule.params.required_categories.length > 0) {
        const eligibleCategoryIds = rule.params.required_categories.map((cat: any) => cat.id);
        isEligible = isEligible || (dish.category_id ? eligibleCategoryIds.includes(dish.category_id) : false);
      }
      
      // 如果有限制条件但都不满足
      if (((rule.params.required_items && rule.params.required_items.length > 0) || 
           (rule.params.required_categories && rule.params.required_categories.length > 0)) && !isEligible) {
        const itemNames = rule.params.required_items?.map((i: any) => i.name).join('、') || '';
        const categoryNames = rule.params.required_categories?.map((cat: any) => cat.name).join('、') || '';
        const restriction = [itemNames, categoryNames].filter(Boolean).join('或');
        return {
          isValid: false,
          reason: `仅限${restriction}商品可用`
        };
      }
      
      // 检查范围内的最小消费（与购物车版本一致）
      if (rule.params.min_spend && rule.params.min_spend > 0) {
        // 对于单个菜品，如果满足商品/分类条件，则以该菜品价格为判断标准
        if (dishPrice < rule.params.min_spend) {
          return {
            isValid: false,
            reason: `需消费满${rule.params.min_spend}元，当前菜品仅${dishPrice.toFixed(2)}元`
          };
        }
      }
      
      return { isValid: true };

    case 'GIFT_CONDITION':
      // 检查赠品条件
      let isRequiredItem = false;
      
      // 检查必需商品ID（OR逻辑）
      if (rule.params.required_items && rule.params.required_items.length > 0) {
        const requiredItemIds = rule.params.required_items.map((item: any) => item.id);
        isRequiredItem = isRequiredItem || requiredItemIds.includes(dish.id);
      }
      
      // 检查必需分类（OR逻辑）
      if (rule.params.required_categories && rule.params.required_categories.length > 0) {
        const requiredCategoryIds = rule.params.required_categories.map((cat: any) => cat.id);
        isRequiredItem = isRequiredItem || (dish.category_id ? requiredCategoryIds.includes(dish.category_id) : false);
      }
      
      // 如果指定了条件但不满足
      if ((rule.params.required_items?.length > 0 || rule.params.required_categories?.length > 0) && !isRequiredItem) {
        const itemNames = rule.params.required_items?.map((i: any) => i.name).join('、') || '';
        const categoryNames = rule.params.required_categories?.map((cat: any) => cat.name).join('、') || '';
        const requirement = [itemNames, categoryNames].filter(Boolean).join('或');
        return {
          isValid: false,
          reason: `需购买${requirement}商品`
        };
      }
      
      // 检查范围内的最低消费
      if (rule.params.min_spend && rule.params.min_spend > 0) {
        // 对于单个菜品，如果满足赠品条件，则以该菜品价格为判断标准
        if (dishPrice < rule.params.min_spend) {
          return {
            isValid: false,
            reason: `需消费满${rule.params.min_spend}元，当前菜品仅${dishPrice.toFixed(2)}元`
          };
        }
      }
      
      return { isValid: true };

    default:
      return { isValid: true };
  }
}

export default function DishItem({
  id,
  image,
  name,
  category,
  tags = [],
  price,
  originalPrice,
  discount,
  promoPrice = null,
  isSelectable = false,
  isSignature = false,
  onSelect,
  addToCart,
}: DishItemProps) {
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [allCoupons, setAllCoupons] = useState<Coupon[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<
    Array<{
      id: string;
      name: string;
      type: "CASH_VOUCHER" | "PERCENTAGE_DISCOUNT" | "FREE_ITEM";
      amount?: number;
      percentage?: number;
      dish_name?: string;
      couponText: string;
    }>
  >([]);
  const [loading, setLoading] = useState(false);

  // 控制页面滚动
  useEffect(() => {
    if (showCouponModal) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    // 清理函数，确保组件卸载时移除类
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showCouponModal]);

  // 获取优惠券数据
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/coupon");
        if (response.ok) {
          const data = await response.json();
          setAllCoupons(data.coupons || []);
        }
      } catch (error) {
        console.error("获取优惠券失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  // 检查当前菜品可用的优惠券
  useEffect(() => {
    if (allCoupons.length > 0) {
      const dish: DishForCoupon = {
        id, // 使用真实的菜品 ID
        name,
        price,
        originalPrice,
        category_id: category, // 使用真实的分类ID
      };

      const eligible = allCoupons
        .map((coupon) => checkCouponEligibility(coupon, dish))
        .filter((result) => result.isEligible)
        .map((result) => {
          const coupon = allCoupons.find((c) => c.id === result.couponInfo.id);
          if (!coupon) return null;

          const template = coupon.coupon_templates;
          const getCouponValue = () => {
            const template = coupon.coupon_templates;
            switch (template.type) {
              case "CASH_VOUCHER":
                return `¥${template.value.amount}`;
              case "PERCENTAGE_DISCOUNT":
                const discount = template.value.percentage
                  ? 10 - template.value.percentage / 10
                  : 0;
                return `${discount}折`;
              case "FREE_ITEM":
                return `赠品「${template.value.dish_name || "指定赠品"}」`;
              default:
                return "";
            }
          };
          return {
            id: coupon.id,
            name: template.name,
            type: template.type,
            amount: template.value.amount,
            percentage: template.value.percentage,
            dish_name: template.value.dish_name,
            couponText: getCouponValue(),
          };
        })
        .filter(Boolean) as Array<{
        id: string;
        name: string;
        type: "CASH_VOUCHER" | "PERCENTAGE_DISCOUNT" | "FREE_ITEM";
        amount?: number;
        percentage?: number;
        dish_name?: string;
        couponText: string;
      }>;

      setAvailableCoupons(eligible);
    }
  }, [allCoupons, name, price, originalPrice]);

  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      price,
      quantity: 1,
      category,
      image,
      options: {},
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start mt-8">
      <div className="relative w-full sm:w-28 h-48 sm:h-28 rounded-lg flex-shrink-0 bg-gray-200">
        <Image
          src={image}
          alt={name}
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
        {isSignature && (
          <span className="absolute top-0 left-0 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-br-lg rounded-tl-lg">
            招牌
          </span>
        )}
      </div>
      <div className="ml-0 sm:ml-4 mt-2 sm:mt-0 flex-grow w-full">
        <h4 className="text-lg font-bold">{name}</h4>
        <div className="flex flex-wrap items-center text-xs text-orange-500 mt-1">
          {tags.map((tag, index) => (
            <span
              key={index}
              className={`mr-2 mb-1 px-2 py-1 rounded ${
                tag.category === "REPEAT_CUSTOMER" ||
                tag.category === "SALES_RANK"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-orange-100"
              }`}
            >
              {tag.text}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="border border-red-500 text-red-500 text-xs px-2 py-0.5 rounded inline-block">
            {discount}
          </span>
          {availableCoupons.length > 0 && (
            <button
              onClick={() => setShowCouponModal(true)}
              className="text-orange-500 text-xs hover:text-orange-600 transition-colors"
            >
              {availableCoupons.length}张券可用
            </button>
          )}
        </div>
        <div className="flex justify-between items-end mt-2">
          <div>
            <div className="flex items-baseline">
              <span className="text-red-500 text-xl font-bold">
                ¥{price.toFixed(2)}
              </span>
              {originalPrice && (
                <span className="text-gray-400 line-through ml-2">
                  ¥{originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {promoPrice && (
              <span className="text-red-500 text-sm">
                ¥{promoPrice.toFixed(2)} 神券价
              </span>
            )}
          </div>
          <div className="self-end">
            {isSelectable ? (
              <button
                onClick={onSelect}
                className="bg-yellow-400 text-gray-800 px-4 py-1 rounded-full font-bold"
              >
                选规格
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="bg-yellow-400 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 优惠券浮层 */}
      {showCouponModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowCouponModal(false)}
        >
          <div
            className="bg-white rounded-lg p-4 max-w-sm w-full mx-4 shadow-lg border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">可用优惠券</h3>
              <button
                onClick={() => setShowCouponModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {availableCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="border rounded-lg p-3 bg-red-50 border-red-200"
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-gray-800">
                      {coupon.name}
                    </div>
                    <div className="text-red-500 font-bold">
                      {coupon.couponText}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
