export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MODERATOR'
  | 'FINANCE_ADMIN'
  | 'SUPPORT_AGENT'
  | 'CONTENT_MANAGER'
  | 'SELLER'
  | 'CUSTOMER'
  | 'DRIVER';

export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  phone?: string;
  role: UserRole;
  roles?: UserRole[];
  sellerId?: string;
  driverId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: string[];
};

export type Seller = {
  id: string;
  userId?: string;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  hours?: string;
  phone: string;
  whatsapp?: string;
  rating: number;
  reviews: number;
  completedOrders?: number;
  deliveryAvailable: boolean;
  pickupAvailable?: boolean;
  paymentMethods: string[];
  bannerUrl: string;
  logoUrl: string;
  description: string;
  verificationLevel?: "premium" | "verified" | "basic";
  category?: string;
  themeColor?: string;
  announcement?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Product = {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  unit: string;
  images: string[];
  stock: number;
  categoryId: string;
  subCategoryId?: string;
  deliveryAvailable?: boolean;
  pickupAvailable?: boolean;
  latitude?: number;
  longitude?: number;
  distance?: string;
  hasVideo?: boolean;
  status?: 'active' | 'out_of_stock' | 'draft' | 'archived';
  views?: number;
  favorites?: number;
  shares?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type PaymentMethod =
  | 'MTN_MOMO'
  | 'CARD'
  | 'COD'
  | 'PAY_ON_COLLECTION'
  | 'WHATSAPP_LINK';

export type PaymentStatus =
  | 'UNPAID'
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'READY_FOR_COLLECTION'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type DeliveryMethod = 'DELIVERY' | 'PICKUP';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  image?: string;
  unit?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  pickupLocation?: string;
  customerNotes?: string;
  paymentReference?: string;
  paymentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  customerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  provider: string;
  providerReference?: string;
  status: PaymentStatus;
  idempotencyKey: string;
  rawResponse?: any;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
}

export interface Review {
  id: string;
  sellerId: string;
  productId?: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail?: string;
  actorRole: UserRole;
  action: string;
  resourceType: string;
  resourceId: string;
  previousState?: any;
  newState?: any;
  timestamp: string;
}
