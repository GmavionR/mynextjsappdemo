"use client";
import { useState, useMemo, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import Image from "next/image";
import { CartItem, Coupon, CouponEligibilityResult, VirtualGiftItem, type Dish } from "../types";

interface CartPopupProps {
  cart: CartItem[];
  onClose: () => void;
  updateQuantity: (
    name: string,
    options: Record<string, string>,
    delta: number
  ) => void;
  clearCart: () => void;
  findDishById: (dishId: string) => Dish | null;
  checkCouponEligibilityForCart: (
    coupon: Coupon,
    cart: CartItem[]
  ) => CouponEligibilityResult;
}

const CartPopup = ({
  cart,
  onClose,
  updateQuantity,
  clearCart,
  findDishById,
  checkCouponEligibilityForCart,
}: CartPopupProps) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showUnavailableCoupons, setShowUnavailableCoupons] = useState(false);
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(true);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const isEmpty = totalItems === 0;

  // 获取优惠券列表
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await fetch("/api/coupon");
        const data = await response.json();
        if (data.coupons) {
          setCoupons(data.coupons);
        }
      } catch (error) {
        console.error("Error fetching coupons:", error);
      }
    };

    if (!isEmpty) {
      fetchCoupons();
    }
  }, [isEmpty]);

  // 计算每个优惠券的可用性
  const couponEligibility = useMemo(() => {
    return coupons.map((coupon) => ({
      coupon,
      ...checkCouponEligibilityForCart(coupon, cart),
    }));
  }, [coupons, cart, checkCouponEligibilityForCart]);

  // 分离可用和不可用的优惠券
  const availableCoupons = couponEligibility.filter((item) => item.isEligible);
  const unavailableCoupons = couponEligibility.filter(
    (item) => !item.isEligible
  );

  // 计算优惠后的总价
  const finalPrice = useMemo(() => {
    if (!selectedCoupon) return totalPrice;

    const eligibility = checkCouponEligibilityForCart(selectedCoupon, cart);
    return Math.max(0, totalPrice - eligibility.savings);
  }, [selectedCoupon, totalPrice, cart, checkCouponEligibilityForCart]);

  // 获取虚拟赠品信息
  const virtualGiftItem = useMemo((): VirtualGiftItem | null => {
    if (!selectedCoupon || selectedCoupon.coupon_templates.type !== "FREE_ITEM") {
      return null;
    }

    const dishId = selectedCoupon.coupon_templates.value.dish_id;
    if (!dishId) {
      return null;
    }

    const dish = findDishById(dishId);
    if (!dish) {
      return null;
    }

    return {
      id: dish.id,
      name: dish.name,
      price: selectedCoupon.coupon_templates.value.dish_price || 0,
      image: dish.image,
      category: dish.category,
      quantity: 1,
      isVirtualGift: true,
      couponId: selectedCoupon.id,
    };
  }, [selectedCoupon, findDishById]);

  // 获取优惠券显示信息
  const getCouponDisplayInfo = (coupon: Coupon) => {
    const template = coupon.coupon_templates;

    switch (template.type) {
      case "CASH_VOUCHER":
        return `¥${template.value.amount}代金券`;
      case "PERCENTAGE_DISCOUNT":
        const maxOff = template.value.max_off
          ? `最高减¥${template.value.max_off}`
          : "";
        return `${template.value.percentage}%折扣券 ${maxOff}`.trim();
      case "FREE_ITEM":
        return `赠品「${template.value.dish_name || "指定赠品"}」`;
      default:
        return template.name;
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end bg-black/50"
      onClick={onClose}
    >
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg max-h-[80vh] flex flex-col max-w-7xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-lg">已选购商品</h3>
          <button
            onClick={() => {
              clearCart();
              setSelectedCoupon(null);
            }}
            className="text-sm text-gray-500 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            清空
          </button>
        </div>

        <div className="overflow-y-auto flex-grow">
          {/* 商品列表 */}
          <div className="p-4">
            {cart.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center mb-4"
              >
                <div className="flex items-center">
                  <Image
                    src={
                      item.image ||
                      `https://picsum.photos/seed/${item.name}/200/300`
                    }
                    alt={item.name}
                    width={48}
                    height={48}
                    className="rounded-md mr-4 w-12 h-12 object-cover"
                  />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    {item.options && Object.keys(item.options).length > 0 && (
                      <p className="text-xs text-gray-500">
                        {Object.values(item.options).join(", ")}
                      </p>
                    )}
                    {/* 只在多份商品时显示"一份享立减"提示 */}
                    {selectedCoupon &&
                      (() => {
                        const eligibility = checkCouponEligibilityForCart(
                          selectedCoupon,
                          cart
                        );
                        const template = selectedCoupon.coupon_templates;
                        
                        // PERCENTAGE_DISCOUNT 且有多份商品时显示"一份享立减"
                        if (template.type === "PERCENTAGE_DISCOUNT" && 
                            eligibility.associatedCartItemIndex === index &&
                            item.quantity > 1) {
                          const savings = eligibility.savings;
                          return (
                            <div className="text-xs mt-1">
                              <span className="text-red-500 font-semibold">
                                一份享立减¥{savings.toFixed(2)}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                  </div>
                </div>
                <div className="flex items-center">
                  {/* 计算实际显示的价格 */}
                  {(() => {
                    if (selectedCoupon) {
                      const eligibility = checkCouponEligibilityForCart(
                        selectedCoupon,
                        cart
                      );
                      const template = selectedCoupon.coupon_templates;
                      
                      // 只有PERCENTAGE_DISCOUNT且指定了特定商品时才调整单个商品价格显示
                      if (template.type === "PERCENTAGE_DISCOUNT" && 
                          eligibility.associatedCartItemIndex === index) {
                        const savings = eligibility.savings;
                        const discountedPrice = Math.max(0, item.price - savings);
                        
                        if (item.quantity === 1) {
                          // 只有一份时，右侧显示划线原价和红色折扣价
                          return (
                            <div className="text-right mr-4">
                              <div className="text-xs text-gray-400 line-through">
                                ¥{item.price.toFixed(2)}
                              </div>
                              <div className="font-semibold text-red-500">
                                ¥{discountedPrice.toFixed(2)}
                              </div>
                            </div>
                          );
                        } else {
                          // 多份时，一份享受折扣，其余按原价计算
                          const totalPrice = discountedPrice + item.price * (item.quantity - 1);
                          return (
                            <span className="font-semibold mr-4">
                              ¥{totalPrice.toFixed(2)}
                            </span>
                          );
                        }
                      }
                    }
                    // 默认显示原价
                    return (
                      <span className="font-semibold mr-4">
                        ¥{(item.price * item.quantity).toFixed(2)}
                      </span>
                    );
                  })()}
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.options || {}, -1)
                      }
                      className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.options || {}, 1)
                      }
                      className="bg-yellow-400 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* 虚拟赠品显示 */}
            {virtualGiftItem && (
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="relative">
                    <Image
                      src={
                        virtualGiftItem.image ||
                        `https://picsum.photos/seed/${virtualGiftItem.name}/200/300`
                      }
                      alt={virtualGiftItem.name}
                      width={48}
                      height={48}
                      className="rounded-md mr-4 w-12 h-12 object-cover"
                    />
                    {/* 赠品水印 - 左上角 */}
                    <div className="absolute -top-1 -left-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded text-center leading-none">
                      赠品
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">{virtualGiftItem.name}</p>
                    <p className="text-xs text-red-500">优惠券赠品</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {/* 赠品价格显示：原价划线，赠品价格为0 */}
                  <div className="text-right mr-4">
                    {(() => {
                      // 查找原始菜品获取原价
                      const originalDish = findDishById(virtualGiftItem.id);
                      const originalPrice = originalDish?.price || virtualGiftItem.price;
                      
                      return (
                        <>
                          <div className="text-xs text-gray-400 line-through">
                            ¥{originalPrice.toFixed(2)}
                          </div>
                          <div className="font-semibold text-red-500">
                            ¥0.00
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex items-center">
                    {/* 不可点击的减号按钮 */}
                    <button
                      disabled
                      className="bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center cursor-not-allowed opacity-50"
                    >
                      -
                    </button>
                    <span className="mx-2">1</span>
                    {/* 不可点击的加号按钮 */}
                    <button
                      disabled
                      className="bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center cursor-not-allowed opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 优惠券部分 */}
          {!isEmpty && (
            <div className="border-t px-4 py-3">
              <h4 className="font-semibold mb-3 text-gray-800">选择优惠券</h4>

              {/* 可用优惠券 */}
              {availableCoupons.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
                    className="flex justify-between items-center w-full text-sm text-gray-600 mb-2 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium">可使用的优惠券 ({availableCoupons.length})</span>
                    <div className="flex items-center">
                      <span className="text-xs text-red-500 mr-2">
                        {availableCoupons.length}张可用
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          showAvailableCoupons ? "rotate-180" : "rotate-0"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>
                  
                  {showAvailableCoupons && (
                    <div className="space-y-2">
                      {availableCoupons.map(({ coupon, savings }) => (
                        <div
                          key={coupon.id}
                          onClick={() =>
                            setSelectedCoupon(
                              selectedCoupon?.id === coupon.id ? null : coupon
                            )
                          }
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedCoupon?.id === coupon.id
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {coupon.coupon_templates.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {getCouponDisplayInfo(coupon)}
                              </p>
                            </div>
                            <div className="text-right ml-3">
                              <p className="text-red-500 font-semibold">
                                节省¥{savings.toFixed(2)}
                              </p>
                              {selectedCoupon?.id === coupon.id && (
                                <p className="text-xs text-red-500">已选择</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 不可用优惠券 */}
              {unavailableCoupons.length > 0 && (
                <div>
                  <button
                    onClick={() =>
                      setShowUnavailableCoupons(!showUnavailableCoupons)
                    }
                    className="flex justify-between items-center w-full text-sm text-gray-600 mb-2 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium">不可使用的优惠券 ({unavailableCoupons.length})</span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400 mr-2">
                        查看详情
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          showUnavailableCoupons ? "rotate-180" : "rotate-0"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {showUnavailableCoupons && (
                    <div className="space-y-2">
                      {unavailableCoupons.map(({ coupon, reason }) => (
                        <div
                          key={coupon.id}
                          className="p-3 border border-gray-200 rounded-lg bg-gray-50 opacity-60"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-500">
                                {coupon.coupon_templates.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {getCouponDisplayInfo(coupon)}
                              </p>
                              <p className="text-xs text-red-400 mt-1">
                                {reason}
                              </p>
                            </div>
                            <div className="text-gray-400 ml-3">
                              <p className="text-sm">不可用</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {availableCoupons.length === 0 &&
                unavailableCoupons.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    暂无可用优惠券
                  </p>
                )}
            </div>
          )}
        </div>

        {!isEmpty && (
          <div className="p-4 border-t bg-white">
            {/* 优惠明细 */}
            {selectedCoupon && (
              <div className="mb-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">商品合计</span>
                  <span>¥{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-500">优惠券优惠</span>
                  <span className="text-red-500">
                    节省¥
                    {checkCouponEligibilityForCart(
                      selectedCoupon,
                      cart
                    ).savings.toFixed(2)}
                  </span>
                </div>
                <div className="border-t pt-1"></div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xl font-bold text-black">
                  优惠后合计 ¥{finalPrice.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">另需配送费 ¥3</p>
              </div>
              <button className="bg-yellow-400 text-black px-8 py-3 rounded-full text-base md:text-lg font-bold">
                去结算
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPopup;
