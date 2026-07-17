export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: string[];
};

export type Seller = {
  id: string;
  name: string;
  location: string;
  hours: string;
  phone: string;
  rating: number;
  reviews: number;
  deliveryAvailable: boolean;
  paymentMethods: string[];
  bannerUrl: string;
  logoUrl: string;
  description: string;
  verificationLevel?: "premium" | "verified" | "basic";
  category?: string;
  createdAt?: string;
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
  distance: string;
  hasVideo?: boolean;
};
