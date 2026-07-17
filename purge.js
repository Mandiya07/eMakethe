import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function purge() {
  const collections = ['promotions', 'sellers', 'traders', 'products', 'local-sponsors', 'wallet', 'banners', 'drivers', 'admins', 'categories'];
  for (const col of collections) {
    const snapshot = await getDocs(collection(db, col));
    for (const d of snapshot.docs) {
      if (col === 'admins' && d.id === 'payment_settings') continue;
      await deleteDoc(doc(db, col, d.id));
    }
    console.log(`Deleted all documents in ${col}`);
  }
  process.exit(0);
}
purge().catch(console.error);
