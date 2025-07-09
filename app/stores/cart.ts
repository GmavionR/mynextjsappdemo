import { create } from 'zustand';
import { produce } from 'immer';
import { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (itemId: string, options: Record<string, string>, delta: number) => void;
  removeFromCart: (itemId: string, options?: Record<string, string>) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  
  addToCart: (item) =>
    set(
      produce((draft) => {
        const existingItemIndex = draft.items.findIndex(
          (i: CartItem) => 
            i.id === item.id && 
            JSON.stringify(i.options) === JSON.stringify(item.options)
        );
        
        if (existingItemIndex !== -1) {
          // 如果商品已存在，增加数量
          draft.items[existingItemIndex].quantity += item.quantity || 1;
        } else {
          // 如果是新商品，添加到购物车
          draft.items.push({ ...item, quantity: item.quantity || 1 });
        }
      })
    ),
    
  updateQuantity: (itemId, options, delta) =>
    set(
      produce((draft) => {
        const itemIndex = draft.items.findIndex(
          (item: CartItem) =>
            item.id === itemId &&
            JSON.stringify(item.options) === JSON.stringify(options)
        );
        
        if (itemIndex !== -1) {
          const newQuantity = draft.items[itemIndex].quantity + delta;
          if (newQuantity > 0) {
            draft.items[itemIndex].quantity = newQuantity;
          } else {
            // 如果数量为0或负数，移除商品
            draft.items.splice(itemIndex, 1);
          }
        }
      })
    ),
    
  removeFromCart: (itemId, options) =>
    set(
      produce((draft) => {
        if (options) {
          // 移除特定规格的商品
          const itemIndex = draft.items.findIndex(
            (item: CartItem) =>
              item.id === itemId &&
              JSON.stringify(item.options) === JSON.stringify(options)
          );
          if (itemIndex !== -1) {
            draft.items.splice(itemIndex, 1);
          }
        } else {
          // 移除所有该商品ID的商品
          draft.items = draft.items.filter((item: CartItem) => item.id !== itemId);
        }
      })
    ),
    
  clearCart: () =>
    set(
      produce((draft) => {
        draft.items = [];
      })
    ),
    
  getTotalItems: () => {
    const state = get();
    return state.items.reduce((total, item) => total + item.quantity, 0);
  },
  
  getTotalPrice: () => {
    const state = get();
    return state.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  },
}));
