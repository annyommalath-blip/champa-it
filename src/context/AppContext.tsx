import React, { createContext, useContext, useState, useCallback } from "react";
import { CartItem, Product, Notification, Conversation, ChatMessage } from "@/types";
import { demoNotifications, demoConversations, demoMessages } from "@/data/mock";
import { toast } from "sonner";

interface AppState {
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  // Auth
  isLoggedIn: boolean;
  repName: string;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  addNotification: (n: Omit<Notification, "id" | "timestamp" | "read">) => void;
  // Conversations
  conversations: Conversation[];
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  addConversation: (conv: Conversation) => void;
  // Guest
  guestId: string;
}

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
};

const getGuestId = () => {
  let id = localStorage.getItem("champa_guest_id");
  if (!id) {
    id = "guest-" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("champa_guest_id", id);
  }
  return id;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [repName, setRepName] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications);
  const [conversations, setConversations] = useState<Conversation[]>(demoConversations);
  const [messages, setMessages] = useState<ChatMessage[]>(demoMessages);
  const [guestId] = useState(getGuestId);

  const addToCart = useCallback((product: Product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { product, quantity: qty }];
    });
    toast.success(`${product.name} added to cart`);
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
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const login = useCallback((email: string, password: string) => {
    if (email === "admin@champa.com" && password === "champa123") {
      setIsLoggedIn(true);
      setRepName("Alex Johnson");
      toast.success("Welcome back, Alex!");
      return true;
    }
    toast.error("Invalid credentials");
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setRepName("");
    toast.success("Logged out");
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const addNotification = useCallback((n: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newN: Notification = { ...n, id: "n-" + Date.now(), timestamp: new Date().toISOString(), read: false };
    setNotifications((prev) => [newN, ...prev]);
  }, []);

  const addMessage = useCallback((msg: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMsg: ChatMessage = { ...msg, id: "m-" + Date.now(), timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, newMsg]);
    setConversations((prev) =>
      prev.map((c) => c.id === msg.conversationId ? { ...c, lastMessage: msg.content, lastMessageTime: newMsg.timestamp, unread: msg.senderType === "user" ? c.unread + 1 : c.unread } : c)
    );
  }, []);

  const addConversation = useCallback((conv: Conversation) => {
    setConversations((prev) => [conv, ...prev]);
  }, []);

  return (
    <AppContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, isLoggedIn, repName, login, logout, notifications, markNotificationRead, addNotification, conversations, messages, addMessage, addConversation, guestId }}>
      {children}
    </AppContext.Provider>
  );
};
