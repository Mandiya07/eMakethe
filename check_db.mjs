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

async function check() {
  const collectionsToPurge = ['sellers', 'products', 'banners', 'drivers', 'admins', 'promotions', 'categories', 'local-sponsors', 'wallet', 'ad_bookings'];
  for (const colName of collectionsToPurge) {
    const snap = await getDocs(collection(db, colName));
    console.log(`Collection ${colName} has ${snap.size} documents.`);
    for (const d of snap.docs) {
      console.log(` - ${d.id}: `, d.data().name || d.data().title || "no name");
    }
  }
  process.exit(0);
}
check();
