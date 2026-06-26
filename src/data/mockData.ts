export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: string[];
};

export const CATEGORIES: Category[] = [
  { 
    id: 'agri', 
    name: 'Agriculture', 
    icon: 'Leaf', 
    color: 'bg-green-100 text-green-700',
    subcategories: ['Vegetables', 'Fruits', 'Livestock', 'Poultry', 'Crops']
  },
  { 
    id: 'food', 
    name: 'Food', 
    icon: 'Pizza', 
    color: 'bg-orange-100 text-orange-700',
    subcategories: ['Street food', 'Catering', 'Restaurants', 'Snacks']
  },
  { 
    id: 'clothing', 
    name: 'Clothing', 
    icon: 'Shirt', 
    color: 'bg-pink-100 text-pink-700',
    subcategories: ['Fashion', 'Tailoring', 'Shoes', 'Accessories']
  },
  { 
    id: 'home', 
    name: 'Home & Living', 
    icon: 'HomeIcon', 
    color: 'bg-teal-100 text-teal-700',
    subcategories: ['Furniture', 'Décor', 'Appliances']
  },
  { 
    id: 'construction', 
    name: 'Construction', 
    icon: 'Hammer', 
    color: 'bg-stone-100 text-stone-700',
    subcategories: ['Builders', 'Plumbers', 'Electricians']
  },
  { 
    id: 'automotive', 
    name: 'Automotive', 
    icon: 'Car', 
    color: 'bg-red-100 text-red-700',
    subcategories: ['Mechanics', 'Car parts', 'Car wash']
  },
  { 
    id: 'beauty', 
    name: 'Beauty', 
    icon: 'Scissors', 
    color: 'bg-purple-100 text-purple-700',
    subcategories: ['Hair salons', 'Barbers', 'Makeup artists']
  },
  { 
    id: 'services', 
    name: 'Services', 
    icon: 'Wrench', 
    color: 'bg-blue-100 text-blue-700',
    subcategories: ['Cleaning', 'Tutoring', 'Repairs', 'Freelancing']
  },
  { 
    id: 'electronics', 
    name: 'Electronics', 
    icon: 'Smartphone', 
    color: 'bg-indigo-100 text-indigo-700',
    subcategories: ['Phones', 'Accessories', 'Computers']
  },
  { 
    id: 'more', 
    name: 'More', 
    icon: 'MoreHorizontal', 
    color: 'bg-gray-100 text-gray-700',
    subcategories: ['Other Goods', 'Trade Events', 'Logistics Prep']
  },
];

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
};

const BASE_SELLERS: Record<string, Seller> = {};

const isClient = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const getInitialSellers = (): Record<string, Seller> => {
  return BASE_SELLERS;
};

export const SELLERS: Record<string, Seller> = getInitialSellers();

export const addSellerToStorage = (s: Seller) => {
  // Deprecated - moved to firebase
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

const getInitialProducts = (): Product[] => {
  return [];
};

export const PRODUCTS: Product[] = getInitialProducts();

export const addProductToStorage = (p: Product) => {
  // Deprecated - moved to firebase
};

export const updateProductInStorage = (p: Product) => {
  // Deprecated - moved to firebase
};

export const deleteProductFromStorage = (id: string) => {
  // Deprecated - moved to firebase
};
