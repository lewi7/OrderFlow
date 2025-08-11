// User and Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'OWNER' | 'STAFF' | 'KITCHEN';
  restaurantId: number;
  restaurantName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface RestaurantRegistrationRequest {
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone?: string;
  restaurantEmail?: string;
  username: string;
  password: string;
  fullName: string;
  email: string;
}

// Restaurant Types
export interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  simulatedOrderIntervalMinutes: number;
  createdAt: string;
  updatedAt: string;
}

// Menu Types
export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  isAvailable: boolean;
  modifiers: MenuModifier[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuModifier {
  id: number;
  name: string;
  description?: string;
  isRequired: boolean;
  maxSelections?: number;
  options: ModifierOption[];
  createdAt: string;
  updatedAt: string;
}

export interface ModifierOption {
  id: number;
  name: string;
  description?: string;
  extraCost?: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface Order {
  id: number;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  source: 'MANUAL' | 'UberEats' | 'SkipTheDishes' | 'DoorDash';
  status: 'NEW' | 'PREPARING' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface OrderItem {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  selectedModifiers: OrderItemModifier[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemModifier {
  id: number;
  modifierName: string;
  optionName: string;
  extraCost?: number;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Analytics Types
export interface DailyAnalytics {
  date: string;
  orderCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  revenue: number; // Backend returns this field
}

export interface TopSellingItem {
  menuItemId: number;
  menuItemName: string;
  quantitySold: number;
  totalRevenue: number;
  category: string; // Backend returns this field
}

export interface RevenueAnalytics {
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  period: string;
  busiestDay: string | null; // Backend returns this field
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'ORDER_CREATED' | 'ORDER_UPDATED' | 'ORDER_STATUS_CHANGED';
  data: Order | OrderItem | { orderId: number; status: string };
}

// Form Types
export interface CreateOrderRequest {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  source?: 'MANUAL' | 'UberEats' | 'SkipTheDishes' | 'DoorDash';
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  menuItemId: number;
  quantity: number;
  notes?: string;
  selectedModifierIds?: number[];
}

export interface UpdateOrderStatusRequest {
  status: Order['status'];
} 