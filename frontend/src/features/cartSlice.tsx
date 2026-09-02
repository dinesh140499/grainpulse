import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import pulse from "../assets/images/products/pulse.png";

export interface CartItem {
  id: number | string;
  name: string;
  weight: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
}

interface CouponState {
  code: string;
  discount: number;
  applied: boolean;
}

interface CartState {
  items: CartItem[];
  coupon: CouponState;
}

const getInitialCartItems = (): CartItem[] => {
  try {
    const stored = localStorage.getItem("cart");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error reading cart from localStorage:", e);
  }
  return [];
};

const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem("cart", JSON.stringify(items));
  } catch (e) {
    console.error("Error saving cart to localStorage:", e);
  }
};

const initialState: CartState = {
  items: getInitialCartItems(),
  coupon: {
    code: "",
    discount: 0,
    applied: false,
  },
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      saveCartToStorage(state.items);
    },
    addToCart: (
      state,
      action: PayloadAction<{
        id: number | string;
        name: string;
        weight?: string;
        price: number;
        originalPrice?: number;
        quantity?: number;
        image?: string;
      }>
    ) => {
      const { id, name, price, originalPrice = price, weight = "1 Kg", quantity = 1, image = pulse } = action.payload;
      const existing = state.items.find((item) => String(item.id) === String(id));
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({
          id,
          name,
          weight,
          price,
          originalPrice,
          quantity,
          image,
        });
      }
      saveCartToStorage(state.items);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: number | string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((item) => String(item.id) === String(id));
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => String(i.id) !== String(id));
        } else {
          item.quantity = quantity;
        }
      }
      saveCartToStorage(state.items);
    },
    removeFromCart: (state, action: PayloadAction<number | string>) => {
      state.items = state.items.filter((item) => String(item.id) !== String(action.payload));
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.coupon = { code: "", discount: 0, applied: false };
      saveCartToStorage(state.items);
    },
    applyCoupon: (state, action: PayloadAction<string>) => {
      const code = action.payload.trim().toUpperCase();
      const subtotal = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

      if (code === "GRAINPULSE") {
        state.coupon = {
          code,
          discount: Math.round(subtotal * 0.1),
          applied: true,
        };
      } else if (code === "FARMDIRECT20") {
        state.coupon = {
          code,
          discount: 100,
          applied: true,
        };
      } else if (code === "FREESHIP") {
        state.coupon = {
          code,
          discount: 49,
          applied: true,
        };
      }
    },
    removeCoupon: (state) => {
      state.coupon = { code: "", discount: 0, applied: false };
    },
  },
});

export const {
  setCartItems,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} = cartSlice.actions;

export default cartSlice.reducer;

