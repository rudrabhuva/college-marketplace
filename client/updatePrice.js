import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDNriYTjRXa4-BP90Lf3pk-vvKkj7awqNA",
    projectId: "website-f139e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const snap = await getDocs(collection(db, "products"));
    let count = 0;
    for (const d of snap.docs) {
        const data = d.data();
        if (data.price === 800) {
            console.log("Changing product from 800 to 799.98:", data.title);
            await updateDoc(doc(db, "products", d.id), { price: 799.98 });
            count++;
        }
        else if (data.price === 799.98) {
            console.log("Found product already at 799.98:", data.title);
        }
    }
    console.log(`Updated ${count} products.`);
    process.exit(0);
}
run().catch(console.error);
