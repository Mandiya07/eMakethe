import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, getDocs, setDoc, doc } from 'firebase/firestore';

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
    const checkAndSeed = async () => {
      try {
        let querySnapshot;
        try {
          querySnapshot = await getDocs(collection(db, 'sellers'));
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, 'sellers');
          return;
        }
        if (querySnapshot.empty) {
          console.log('Seeding initial sellers and products...');
          // Seed sellers
          const initialSellers = [
            {
              id: 's1',
              name: "Sipho's Organic Harvest",
              location: 'Manzini Market, Stall 4',
              hours: '08:00 - 17:30',
              phone: '+268 7604 1234',
              rating: 4.9,
              reviews: 18,
              deliveryAvailable: true,
              paymentMethods: ['MTN MoMo', 'Cash'],
              bannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
              logoUrl: '🥬',
              description: 'Fresh organic spinach, tomatoes, cabbages and sweet potatoes direct from our farm in Malkerns. Same-day delivery with MTN MoMo secure payment.',
              verificationLevel: 'premium',
              category: 'Agriculture'
            },
            {
              id: 's2',
              name: "Kasi Flame Grill",
              location: 'Mbabane Plaza, Shop 12',
              hours: '10:00 - 21:00',
              phone: '+268 7123 5678',
              rating: 4.8,
              reviews: 42,
              deliveryAvailable: true,
              paymentMethods: ['MTN MoMo', 'Cash'],
              bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
              logoUrl: '🍲',
              description: 'Mouth-watering street food, quarter chickens, flame grilled Boerwors, and traditional pap. Fast delivery across Mbabane.',
              verificationLevel: 'verified',
              category: 'Food'
            },
            {
              id: 's3',
              name: "Swazi Beaded Pride",
              location: 'Ezulwini Cultural Village',
              hours: '09:00 - 17:00',
              phone: '+268 7891 2345',
              rating: 5.0,
              reviews: 9,
              deliveryAvailable: true,
              paymentMethods: ['MTN MoMo', 'Cash'],
              bannerUrl: 'https://images.unsplash.com/photo-1596422846543-74c6fc0e2811?auto=format&fit=crop&q=80&w=800',
              logoUrl: '🧵',
              description: 'Handcrafted traditional Eswatini beaded necklaces, bracelets, and custom wedding attire. Made with generational pride and absolute quality.',
              verificationLevel: 'basic',
              category: 'Clothing'
            }
          ];

          try {
            for (const s of initialSellers) {
              await setDoc(doc(db, 'sellers', s.id), s);
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, 'sellers');
            return;
          }

          // Seed products
          const initialProducts = [
            {
              id: 'p1',
              sellerId: 's1',
              name: 'Fresh Malkerns Spinach (Large Bunch)',
              description: 'Crisp, iron-rich spinach freshly harvested this morning from Malkerns valley. Free from chemical pesticides.',
              price: 15.00,
              currency: 'E',
              unit: 'bunch',
              images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=600'],
              stock: 45,
              categoryId: 'agri',
              subCategoryId: 'Vegetables',
              distance: '0.4km'
            },
            {
              id: 'p2',
              sellerId: 's1',
              name: 'Organic Vine Tomatoes (1kg)',
              description: 'Sweet and juicy red tomatoes ideal for salads, stews, and traditional sauces.',
              price: 22.00,
              currency: 'E',
              unit: 'kg',
              images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600'],
              stock: 30,
              categoryId: 'agri',
              subCategoryId: 'Vegetables',
              distance: '0.4km'
            },
            {
              id: 'p3',
              sellerId: 's2',
              name: 'Flame-Grilled Quarter Chicken & Pap',
              description: 'Our signature quarter chicken, marinated in indigenous herbs and flame grilled to perfection. Served with classic warm pap and chakalaka.',
              price: 45.00,
              currency: 'E',
              unit: 'plate',
              images: ['https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600'],
              stock: 100,
              categoryId: 'food',
              subCategoryId: 'Street food',
              distance: '1.2km'
            },
            {
              id: 'p4',
              sellerId: 's3',
              name: 'Premium Swazi Beaded Necklace',
              description: 'Gorgeously beaded ceremonial necklace representing high-cultural authenticity. Fits securely, great for events and everyday statements.',
              price: 130.00,
              currency: 'E',
              unit: 'piece',
              images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600'],
              stock: 10,
              categoryId: 'clothing',
              subCategoryId: 'Fashion',
              distance: '4.8km'
            }
          ];

          try {
            for (const p of initialProducts) {
              await setDoc(doc(db, 'products', p.id), p);
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, 'products');
            return;
          }
          console.log('Successfully seeded database!');
        }
      } catch (err) {
        console.error('Seeding database error: ', err);
      }
    };

    checkAndSeed();

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
