import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDNriYTjRXa4-BP90Lf3pk-vvKkj7awqNA",
    projectId: "website-f139e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    const snap = await getDocs(collection(db, "products"));
    for (const d of snap.docs) {
        const data = d.data();
        console.log("Title:", data.title, "| Price:", data.price);
    }
    process.exit(0);
}
run().catch(console.error);
