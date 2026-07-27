import React, { createContext, useContext, useState, useCallback } from "react";
import { CartItem, Product } from "@/types";
import { toast } from "sonner";
import { normalizeCurrency, DEFAULT_CURRENCY } from "@/lib/currency";

interface AppState {
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  cartCurrency: string;
}

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: Product, qty = 1) => {
    setCart((prev) => {
      const productCurrency = normalizeCurrency(product.currency);
      if (prev.length > 0 && normalizeCurrency(prev[0].product.currency) !== productCurrency) {
        toast.error("Your cart already has items in another currency", {
          description: "Please checkout or clear your cart before adding this item.",
        });
        return prev;
      }
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { product: { ...product, currency: productCurrency }, quantity: qty }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
    toast.success("Item removed from cart");
  }, []);

  const updateQuantity = useCallback((productId: string, qty: number) => {
    if (qty < 1) return;
    setCart((prev) => prev.map((i) => i.product.id === productId ? { ...i, quantity: qty } : i));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartCurrency = cart.length > 0 ? normalizeCurrency(cart[0].product.currency) : DEFAULT_CURRENCY;
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <AppContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, cartCurrency }}>
      {children}
    </AppContext.Provider>
  );
};
