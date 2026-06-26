import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "sincere-gist-scf5x",
  appId: "1:320132420925:web:931710a19717b682a76154",
  apiKey: "AIzaSyA2XSFNR-vUHDMOShtrexG1zZCW47h-HOA",
  authDomain: "sincere-gist-scf5x.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-acc63b0d-5d89-4ce2-84d8-9185a2d77884"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function clear() {
  const collectionsToPurge = ['sellers', 'products', 'banners', 'ad_bookings', 'drivers', 'admins'];
  for (const colName of collectionsToPurge) {
    try {
      const querySnapshot = await getDocs(collection(db, colName));
      for (const docSnap of querySnapshot.docs) {
        if (colName === 'admins' && docSnap.id === 'payment_settings') {
          continue; // Preserve system billing details configuration if set
        }
        await deleteDoc(doc(db, colName, docSnap.id));
        console.log(`Purged document ${docSnap.id} from collection ${colName}`);
      }
    } catch (e) {
      console.warn(`Error purging collection ${colName}:`, e);
    }
  }
  console.log('All done!');
  process.exit(0);
}

clear();
