import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, getDocs, setDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  sellers: any[];
  products: any[];
  banners: any[];
  promotions: any[];
  categories: any[];
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  sellers: [],
  products: [],
  banners: [],
  promotions: [],
  categories: [],
});

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      unsubAuth();
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const unsubSellers = onSnapshot(collection(db, 'sellers'), (snapshot) => {
      setSellers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'sellers');
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    const unsubBanners = onSnapshot(collection(db, 'banners'), (snapshot) => {
      setBanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'banners');
    });

    const unsubPromotions = onSnapshot(collection(db, 'promotions'), (snapshot) => {
      setPromotions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'promotions');
    });

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
    });

    return () => {
      unsubSellers();
      unsubProducts();
      unsubBanners();
      unsubPromotions();
      unsubCategories();
    };
  }, [loading]);

  return (
    <FirebaseContext.Provider value={{ user, loading, sellers, products, banners, promotions, categories }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
