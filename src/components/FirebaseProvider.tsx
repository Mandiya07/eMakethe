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
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  sellers: [],
  products: [],
  banners: [],
});

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    const checkAndCleanDemoData = async () => {
      try {
        const isClient = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
        if (isClient && !localStorage.getItem('emakethe_fully_purged_v17_force_refresh')) {
          console.log('System purge triggered: clearing local storage and all Firestore collections...');
          localStorage.clear();
          localStorage.setItem('emakethe_fully_purged_v17_force_refresh', 'true');
          localStorage.setItem('emakethe_wallet_balance', '0.00');
          
          // Complete clean sweep: delete all dynamic or seeded documents in active collections
          const collectionsToPurge = ['sellers', 'products', 'banners', 'drivers', 'admins'];
          for (const colName of collectionsToPurge) {
            try {
              const querySnapshot = await getDocs(collection(db, colName));
              for (const docSnap of querySnapshot.docs) {
                if (colName === 'admins' && docSnap.id === 'payment_settings') continue;
                await deleteDoc(doc(db, colName, docSnap.id));
              }
            } catch (e) {
              console.warn(`Error purging collection ${colName}:`, e);
            }
          }
          
          // Hard reload the window so React state doesn't write stale data back to localStorage
          window.location.reload();
          return;
        }
      } catch (err) {
        console.warn('Database cleanup exception:', err);
      }
    };

    checkAndCleanDemoData();

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    const unsubSellers = onSnapshot(collection(db, 'sellers'), (snapshot) => {
      setSellers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'sellers');
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      console.log('Firebase products snapshot size:', snapshot.size);
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    const unsubBanners = onSnapshot(collection(db, 'banners'), (snapshot) => {
      setBanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'banners');
    });

    return () => {
      unsubAuth();
      unsubSellers();
      unsubProducts();
      unsubBanners();
    };
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, loading, sellers, products, banners }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
