// Types for the Champa Private Enterprise application

export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
  specs: Record<string, string>;
  inStock: boolean;
  rating: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customer: CustomerInfo;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  createdAt: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  preferredContactTime: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: "user" | "sales";
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  assignedRep?: string;
  status: "active" | "closed";
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
}

export interface Notification {
  id: string;
  type: "chat" | "contact_form" | "order_placed" | "order_processing" | "order_shipped" | "order_delivered" | "order_pickup" | "contact_sales";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  referenceId: string;
}

export interface SalesRep {
  id: string;
  name: string;
  email: string;
  status: "online" | "offline";
}
