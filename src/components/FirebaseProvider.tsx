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
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
    });

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
