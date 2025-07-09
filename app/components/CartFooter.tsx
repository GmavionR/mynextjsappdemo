"use client";
import { ShoppingCart } from "lucide-react";
import { CartItem } from "../types";

interface CartFooterProps {
  cart: CartItem[];
  toggleCart: () => void;
}

const CartFooter = ({ cart, toggleCart }: CartFooterProps) => {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const isEmpty = totalItems === 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-2 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] flex justify-between items-center z-20 max-w-7xl mx-auto">
      <div className="flex items-center">
        <button
          onClick={!isEmpty ? toggleCart : undefined}
          className={`p-3 rounded-full relative ${
            isEmpty ? "bg-gray-300" : "bg-yellow-400"
          }`}
        >
          {!isEmpty && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {totalItems}
            </div>
          )}
          <ShoppingCart
            className={`${isEmpty ? "text-gray-500" : "text-black"}`}
          />
        </button>
        <div className="ml-4">
          {isEmpty ? (
            <p className="text-gray-500">未选购商品</p>
          ) : (
            <>
              <p className="text-xl font-bold text-black">
                ¥{totalPrice.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">另需配送费 ¥3</p>
            </>
          )}
        </div>
      </div>
      <button
        disabled={isEmpty}
        className={`px-8 py-3 rounded-full text-base md:text-lg font-bold ${
          isEmpty ? "bg-gray-300 text-gray-500" : "bg-yellow-400 text-black"
        }`}
      >
        {isEmpty ? "¥20起送" : "去结算"}
      </button>
    </div>
  );
};

export default CartFooter;
