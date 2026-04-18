import { initializeApp } from "firebase/app";
import {
    getFirestore, collection, addDoc, getDocs, updateDoc,
    doc, query, orderBy, where, deleteDoc,
    onSnapshot, initializeFirestore, persistentLocalCache,
    persistentMultipleTabManager, increment
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDNriYTjRXa4-BP90Lf3pk-vvKkj7awqNA",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "website-f139e.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "website-f139e",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "website-f139e.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "994669942921",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:994669942921:web:fb98b861a2a13abe3d8e58",
    // measurementId: "G-4JNG9ZH101"
};

// Initialize with manual persistence config to avoid "stuck loading" issues
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Helper to handle hanging Firestore calls (e.g. if offline/blocked)
const withTimeout = (promise, ms = 8000) => {
    const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Connection Timeout: Database is taking too long to respond. Please check your internet or Firebase setup.")), ms)
    );
    return Promise.race([promise, timeout]);
};

// Persistence can sometimes cause "stuck loading" on certain browsers/environments.
// Let's disable it for now or use the standard offline mode.
/*
enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn("Firestore persistence failed-precondition: multiple tabs open?");
    } else if (err.code === 'unimplemented') {
        console.warn("Firestore persistence is not supported by this browser.");
    }
});
*/

// Helper to warn if keys are missing
if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.warn("Firebase API Key is missing! Please update your .env file or db.js with your Firebase credentials.");
}

// --- PRODUCTS (SHARED) ---
export const getProducts = async () => {
    try {
        console.log("Fetching products from Firestore...");
        // Use a simpler query first to avoid potential index errors
        const q = query(collection(db, "products"));
        const snap = await withTimeout(getDocs(q), 5000); // 5s timeout for home page
        const data = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        
        // Manual sort in JS if indexing isn't set up yet
        data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        
        console.log(`Found ${data.length} products.`);
        return data;
    } catch (err) {
        console.error("Critical Error fetching products:", err);
        toast.error("Firestore error: " + err.message);
        return [];
    }
};


// Real-time products subscription
export const subscribeProducts = (callback) => {
    console.log("Subscribing to real-time products...");
    const q = query(collection(db, "products"));
    return onSnapshot(q, (snap) => {
        const prods = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        // Sort alphabetically or by date manually to avoid indexing requirements
        prods.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        console.log(`Update: ${prods.length} products received.`);
        callback(prods);
    }, (err) => {
        console.error("Products Subscription failed!", err);
        if (err.code === "permission-denied") {
            toast.error("Firebase Permission Denied! Check your Firestore Security Rules.");
        } else {
            toast.error("Database connection issue. Check console.");
        }
    });
};

// Helper to compress image before storing as base64 (for those without Firebase Storage)
export const compressImage = (file, maxWidth = 1600, maxHeight = 1600, quality = 0.9) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                // Enhance downscaling quality
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

// Helper to upload image to Firebase Storage
export const uploadImage = async (file) => {
    try {
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        // Add a timeout to the upload process
        const snapshot = await withTimeout(uploadBytes(storageRef, file), 10000); 
        const url = await getDownloadURL(snapshot.ref);
        return url;
    } catch (err) {
        console.warn("Storage upload failed (possibly not enabled). Falling back to compression...", err);
        throw err; // Re-throw to handle in addProduct
    }
};

export const getSellerProducts = async (sellerId) => {
    try {
        const q = query(collection(db, "products"), where("seller_id", "==", sellerId));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch (err) {
        console.error("Error fetching seller products:", err);
        return [];
    }
};

export const subscribeSellerProducts = (sellerId, callback) => {
    const q = query(collection(db, "products"), where("seller_id", "==", sellerId));
    return onSnapshot(q, (snap) => {
        const prods = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        prods.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        callback(prods);
    });
};

export const updateProduct = async (productId, data) => {
    try {
        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, data);
        toast.success("Product updated!");
    } catch (err) {
        console.error("Error updating product:", err);
        toast.error("Update failed: " + err.message);
    }
};

export const deleteProduct = async (productId) => {
    try {
        const productRef = doc(db, "products", productId);
        await deleteDoc(productRef);
        toast.success("Product removed from system.");
    } catch (err) {
        console.error("Error deleting product:", err);
        toast.error("Delete failed: " + err.message);
    }
};

export const addProduct = async (product, imageFile = null) => {
    try {
        let imageUrl = product.image;

        // Priority 1: Try Firebase Storage
        if (imageFile) {
            try {
                console.log("Attempting Firebase Storage upload...");
                imageUrl = await uploadImage(imageFile);
            } catch (storageErr) {
                // Priority 2: Fallback to Compression + Firestore Base64
                console.log("Firebase Storage failed/not enabled. Using local compression...");
                imageUrl = await compressImage(imageFile);
                toast("Using compressed local storage instead of Firebase Storage.", { icon: 'ℹ️' });
            }
        }

        const newProduct = {
            ...product,
            image: imageUrl,
            stock: parseInt(product.stock) || 10,
            createdAt: new Date().toISOString()
        };
        
        console.log("Adding product to Firestore...");
        const docRef = await withTimeout(addDoc(collection(db, "products"), newProduct), 15000);
        toast.success("Product successfully stored!");
        return { ...newProduct, id: docRef.id };
    } catch (err) {
        console.error("Error adding product:", err);
        toast.error("Save failed: " + err.message);
        throw err;
    }
};

export const updateProductStock = async (productId, newStock) => {
    try {
        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, { stock: newStock });
    } catch (err) {
        console.error("Error updating stock:", err);
    }
};

// --- ORDERS (SHARED) ---
export const getAllOrders = async () => {
    try {
        const snap = await getDocs(collection(db, "orders"));
        return snap.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch (err) {
        console.error("Error fetching orders:", err);
        return [];
    }
};

export const getOrders = async (userId) => {
    try {
        const q = query(collection(db, "orders"), where("buyer_id", "==", userId));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch (err) {
        console.error("Error fetching user orders:", err);
        return [];
    }
};

// Real-time orders subscription
export const subscribeOrders = (userId, callback) => {
    const q = query(collection(db, "orders"), where("buyer_id", "==", userId));
    return onSnapshot(q, (snap) => {
        const orders = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        callback(orders);
    });
};

// Real-time all orders subscription (for Admin)
export const subscribeAllOrders = (callback) => {
    // Simplified: get all and sort manually to avoid index issues
    const q = query(collection(db, "orders"));
    return onSnapshot(q, (snap) => {
        const orders = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        orders.sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));
        callback(orders);
    });
};

export const getSales = async (userId) => {
    try {
        const q = query(collection(db, "orders"), where("seller_id", "==", userId));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch (err) {
        console.error("Error fetching sales:", err);
        return [];
    }
};

// Real-time sales subscription
export const subscribeSales = (userId, callback) => {
    const q = query(collection(db, "orders"), where("seller_id", "==", userId));
    return onSnapshot(q, (snap) => {
        const sales = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        callback(sales);
    });
};

export const createOrder = async (orderData) => {
    try {
        const newOrder = {
            ...orderData,
            status: 'Placed',
            date: new Date().toISOString(),
            quantity: orderData.quantity || 1
        };
        const docRef = await addDoc(collection(db, "orders"), newOrder);
        
        if (orderData.product_id) {
            try {
                const productRef = doc(db, "products", orderData.product_id);
                await updateDoc(productRef, { stock: increment(-(orderData.quantity || 1)) });
            } catch (err) {
                console.error("Failed to decrement stock:", err);
            }
        }
        
        if (orderData.seller_id) {
            const detailMsg = orderData.buyer_name 
                ? `\nBuyer Details: \nName: ${orderData.buyer_name} \nEmail: ${orderData.buyer_email} \nPhone: ${orderData.buyer_phone}` 
                : '';
            await notify(orderData.seller_id, `You have a new order for ${orderData.title}! ${detailMsg}`, 'success');
        }

        return { ...newOrder, id: docRef.id };
    } catch (err) {
        console.error("Error creating order:", err);
        throw err;
    }
};

export const updateOrderStatus = async (orderId, status) => {
    try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, { status });
    } catch (err) {
        console.error("Error updating order status:", err);
    }
};

export const cancelOrder = async (orderId, productId, quantity) => {
    try {
        const orderRef = doc(db, "orders", orderId);
        await deleteDoc(orderRef);
        
        if (productId) {
            try {
                const productRef = doc(db, "products", productId);
                await updateDoc(productRef, { stock: increment(quantity || 1) });
            } catch (err) {
                console.error("Failed to restock product:", err);
            }
        }
    } catch (err) {
        console.error("Error canceling order:", err);
    }
};

// --- IMAGE HELPER ---
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

// --- NOTIFICATIONS (SHARED) ---
export const notify = async (userId, message, type = 'info') => {
    try {
        const newNotif = {
            userId: String(userId),
            message,
            type,
            read: false,
            date: new Date().toISOString()
        };
        await addDoc(collection(db, "notifications"), newNotif);
    } catch (err) {
        console.error("Error sending notification:", err);
    }
};

export const subscribeNotifications = (userId, callback) => {
    // Simplified: query by userId only, sort in memory to avoid composite index 
    const q = query(collection(db, "notifications"), where("userId", "==", String(userId)));
    return onSnapshot(q, (snap) => {
        const notifs = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        notifs.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        callback(notifs);
    }, (err) => {
        console.error("Notifications Subscription failed!", err);
        toast.error("Can't load notifications.");
    });
};

export const markNotificationRead = async (notifId) => {
    try {
        const notifRef = doc(db, "notifications", notifId);
        await updateDoc(notifRef, { read: true });
    } catch (err) {
        console.error("Error marking notification read:", err);
    }
};

// --- USERS (SHARED) ---
export const registerUser = async (userData) => {
    try {
        if (firebaseConfig.apiKey === "YOUR_API_KEY") {
            throw new Error("Firebase NOT configured. Please update db.js with your keys.");
        }
        // Simple check if user exists
        const q = query(collection(db, "users"), where("email", "==", userData.email));
        const snap = await withTimeout(getDocs(q), 10000);
        if (!snap.empty) throw new Error("Email already exists");

        console.log("Registering new user...");
        const docRef = await withTimeout(addDoc(collection(db, "users"), {
            ...userData,
            createdAt: new Date().toISOString()
        }), 10000);
        return { ...userData, id: docRef.id };
    } catch (err) {
        console.error("Registration Error:", err);
        throw err;
    }
};

export const loginUser = async (email, password) => {
    try {
        if (firebaseConfig.apiKey === "YOUR_API_KEY") {
            throw new Error("Firebase NOT configured. Please update db.js with your keys.");
        }
        console.log("Attempting login for:", email);
        
        // Find by email only first, much faster and more reliable
        const q = query(collection(db, "users"), where("email", "==", email));
        
        // Use timeout to prevent hanging UI
        const snap = await withTimeout(getDocs(q), 10000);

        if (snap.empty) throw new Error("Invalid email or password");

        const userDoc = snap.docs[0];
        const userData = userDoc.data();

        // Manual password verification for speed & to avoid index requirements
        if (userData.password !== password) throw new Error("Invalid email or password");

        console.log("Logged in:", userData.email);
        return { ...userData, id: userDoc.id };
    } catch (err) {
        console.error("Login Error:", err);
        throw err;
    }
};

export const getUsers = async () => {
    try {
        if (firebaseConfig.apiKey === "YOUR_API_KEY") return [];
        const snap = await getDocs(collection(db, "users"));
        return snap.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch (err) {
        console.error("Error fetching users:", err);
        return [];
    }
};

export const createTradeOffer = async (tradeData) => {
    try {
        const newTrade = {
            ...tradeData,
            status: 'Pending',
            date: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, "trades"), newTrade);
        
        if (tradeData.seller_id) {
            await notify(tradeData.seller_id, `${tradeData.buyer_name || 'Someone'} wants to trade ${tradeData.offer_item} for your ${tradeData.item_title}.`, 'info');
        }
        return { ...newTrade, id: docRef.id };
    } catch (err) {
        console.error("Error creating trade offer:", err);
        throw err;
    }
};

export const subscribeTradeOffers = (userId, callback) => {
    const qSeller = query(collection(db, "trades"), where("seller_id", "==", userId));
    return onSnapshot(qSeller, (snap) => {
        const trades = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        callback(trades);
    });
};

export const updateTradeStatus = async (tradeId, status, tradeData) => {
    try {
        const tradeRef = doc(db, "trades", tradeId);
        await updateDoc(tradeRef, { status });
        
        if (status === 'Accepted') {
            await notify(tradeData.buyer_id, `Your trade offer for ${tradeData.item_title} was accepted! Contact the seller at ${tradeData.seller_email} to arrange the swap.`, 'success');
        } else if (status === 'Declined') {
            await notify(tradeData.buyer_id, `Your trade offer for ${tradeData.item_title} was declined. Please try a different offer.`, 'error');
        }
    } catch (err) {
        console.error("Error updating trade status:", err);
    }
};

