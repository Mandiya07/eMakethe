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

async function purge() {
  const collectionsToPurge = ['sellers', 'products', 'banners', 'drivers', 'admins'];
  for (const colName of collectionsToPurge) {
    const snap = await getDocs(collection(db, colName));
    for (const d of snap.docs) {
      await deleteDoc(doc(db, colName, d.id));
      console.log(`Deleted ${d.id}`);
    }
  }
  process.exit(0);
}
purge();
