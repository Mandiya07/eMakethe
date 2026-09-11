import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, User, signInAnonymously } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';
import { Seller, Product, Category, Order, UserProfile, UserRole } from '../types';

interface FirebaseContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  sellers: Seller[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  banners: any[];
  promotions: any[];
  refreshProfile: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  userProfile: null,
  loading: true,
  sellers: [],
  products: [],
  categories: [],
  orders: [],
  banners: [],
  promotions: [],
  refreshProfile: async () => {}
});

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);

  // 1. Auth state listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubAuth();
  }, []);

  const loadUserProfile = async (currentUser: User) => {
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        setUserProfile({ id: currentUser.uid, ...userSnap.data() } as UserProfile);
      } else {
        // Create initial customer profile
        const isSuperAdmin = currentUser.email === 'siphom.yati@gmail.com';
        const defaultRole: UserRole = isSuperAdmin ? 'SUPER_ADMIN' : 'CUSTOMER';
        const newProfile: UserProfile = {
          id: currentUser.uid,
          email: currentUser.email || null,
          displayName: currentUser.displayName || 'Marketplace User',
          role: defaultRole,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.warn('Could not load user profile from Firestore:', err);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user);
    }
  };

  // 2. Real-time Collections listeners
  useEffect(() => {
    if (loading) return;

    const unsubSellers = onSnapshot(collection(db, 'sellers'), (snapshot) => {
      setSellers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Seller)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'sellers');
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const fetchedCats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(fetchedCats);

      // Auto-seed baseline categories, traders, and products if empty
      if (fetchedCats.length === 0) {
        seedInitialMarketplaceData();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
    });

    const seedInitialMarketplaceData = async () => {
      console.log('Seeding initial Swazi marketplace baseline data...');
      try {
        const defaultCategories = [
          { id: 'cat-fresh', name: 'Fresh Produce', icon: 'Leaf', color: 'bg-emerald-50 text-emerald-600', subcategories: ['Spinach', 'Cabbage', 'Sweet Potatoes', 'Maize', 'Tomatoes', 'Onions'] },
          { id: 'cat-streetfood', name: 'Stall Food', icon: 'Pizza', color: 'bg-amber-50 text-amber-600', subcategories: ['Ligwinya/Fat Cakes', 'Flame-Grilled', 'Meals', 'Traditional'] },
          { id: 'cat-apparel', name: 'Apparel & Fabrics', icon: 'Shirt', color: 'bg-indigo-50 text-indigo-600', subcategories: ['Shweshwe Dresses', 'Knitwear', 'Traditional Wear', 'Sandals'] },
          { id: 'cat-handcrafts', name: 'Swazi Handcrafts', icon: 'Palette', color: 'bg-pink-50 text-pink-600', subcategories: ['Sisal Baskets', 'Beaded Jewelry', 'Soapstone Carvings', 'Clay Pots'] },
          { id: 'cat-repairs', name: 'Tech Repairs', icon: 'Smartphone', color: 'bg-blue-50 text-blue-600', subcategories: ['Screen Repairs', 'Airtime', 'Accessories', 'Battery Replacement'] },
          { id: 'cat-hardware', name: 'Hardware & Utilities', icon: 'HomeIcon', color: 'bg-purple-50 text-purple-600', subcategories: ['Handmade Brooms', 'Cooking Pots', 'Charcoal', 'Wood Crafts'] }
        ];

        const defaultSellers = [
          {
            id: 's1',
            name: 'Mbabane Fresh Produce Market',
            logoUrl: '🥬',
            rating: 4.8,
            reviews: 148,
            phone: '+268 7600 1234',
            category: 'Fresh Produce',
            subcategory: 'Vegetables',
            location: 'Mbabane Public Market, Stall 42',
            description: 'We source organic vegetables and fruits directly from local smallholders in Siphofaneni and Ezulwini. Fresh daily!',
            verificationLevel: 'premium',
            createdAt: new Date().toISOString()
          },
          {
            id: 's2',
            name: 'Lindiwe Woven Art & Sisal',
            logoUrl: '🧺',
            rating: 4.9,
            reviews: 82,
            phone: '+268 7611 9988',
            category: 'Swazi Handcrafts',
            subcategory: 'Sisal Baskets',
            location: 'Manzini Market, Stall 15',
            description: 'Authentic handmade Swazi sisal baskets, table mats, and beaded jewelry woven with local love.',
            verificationLevel: 'verified',
            createdAt: new Date().toISOString()
          }
        ];

        const defaultProducts = [
          { id: 'p1', sellerId: 's1', sellerName: 'Mbabane Fresh Produce Market', categoryId: 'cat-fresh', subCategoryId: 'cabbage', name: 'Fresh Organic Cabbage (Heads)', price: 15.00, currency: 'SZL', images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400'], unit: 'head', description: 'Crisp and large green cabbages harvested fresh from our Siphofaneni plots.', stock: 50, createdAt: new Date().toISOString() },
          { id: 'p2', sellerId: 's1', sellerName: 'Mbabane Fresh Produce Market', categoryId: 'cat-fresh', subCategoryId: 'tomatoes', name: 'Plum Tomatoes (1kg bundle)', price: 20.00, currency: 'SZL', images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400'], unit: 'bundle', description: 'Sun-ripened local sweet tomatoes, perfect for traditional chakalaka.', stock: 35, createdAt: new Date().toISOString() },
          { id: 'p3', sellerId: 's2', sellerName: 'Lindiwe Woven Art & Sisal', categoryId: 'cat-handcrafts', subCategoryId: 'sisal baskets', name: 'Woven Sisal Basket (Medium)', price: 120.00, currency: 'SZL', images: ['https://images.unsplash.com/photo-1531835551805-16d864c8d311?auto=format&fit=crop&q=80&w=400'], unit: 'item', description: 'Exquisite, colorful handwoven sisal basket using traditional Swazi patterns.', stock: 12, createdAt: new Date().toISOString() }
        ];

        // Write categories
        for (const cat of defaultCategories) {
          await setDoc(doc(db, 'categories', cat.id), cat);
        }
        // Write sellers
        for (const sel of defaultSellers) {
          await setDoc(doc(db, 'sellers', sel.id), sel);
        }
        // Write products
        for (const prod of defaultProducts) {
          await setDoc(doc(db, 'products', prod.id), prod);
        }
        console.log('Seeding baseline completed successfully!');
      } catch (err) {
        console.warn('Could not seed initial data:', err);
      }
    };

    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    }, (error) => {
      console.warn('Firestore orders sync:', error);
    });

    const unsubBanners = onSnapshot(collection(db, 'banners'), (snapshot) => {
      setBanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.warn('Firestore banners sync:', error);
    });

    const unsubPromotions = onSnapshot(collection(db, 'promotions'), (snapshot) => {
      setPromotions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.warn('Firestore promotions sync:', error);
    });

    return () => {
      unsubSellers();
      unsubProducts();
      unsubCategories();
      unsubOrders();
      unsubBanners();
      unsubPromotions();
    };
  }, [loading]);

  return (
    <FirebaseContext.Provider
      value={{
        user,
        userProfile,
        loading,
        sellers,
        products,
        categories,
        orders,
        banners,
        promotions,
        refreshProfile
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
