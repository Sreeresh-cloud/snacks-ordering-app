import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { Order, Banner } from "../types";

export async function createOrder(
  orderData: Omit<Order, "id" | "createdAt" | "status">
): Promise<string> {
  const ordersRef = collection(db, "orders");
  const docRef = await addDoc(ordersRef, {
    ...orderData,
    status: "placed",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export function getOrders(callback: (orders: Order[]) => void): () => void {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const orders: Order[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Order[];
      callback(orders);
    },
    (error) => {
      console.error("Error fetching orders:", error);
      callback([]);
    }
  );

  return unsubscribe;
}

export function getUserOrders(
  userId: string,
  callback: (orders: Order[]) => void
): () => void {
  const q = query(
    collection(db, "orders"),
    where("userId", "==", userId)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const orders: Order[] = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Order[];
      
      // Sort client-side to avoid needing a composite index
      orders.sort((a, b) => {
        const getTime = (date: Date | unknown) => {
          if (date instanceof Date) return date.getTime();
          const t = date as { seconds?: number; toDate?: () => Date };
          if (t?.seconds) return t.seconds * 1000;
          if (t?.toDate) return t.toDate().getTime();
          return 0;
        };
        return getTime(b.createdAt) - getTime(a.createdAt);
      });
      
      callback(orders);
    },
    (error) => {
      console.error("Error fetching user orders:", error);
      console.log("If you see an index error, go to Firebase Console > Firestore Database > Indexes and create a composite index for 'orders' collection: field 'userId' (Ascending), field 'createdAt' (Descending)");
      callback([]);
    }
  );

  return unsubscribe;
}

export async function updateOrderStatus(
  orderId: string,
  status: "placed" | "preparing" | "out_for_delivery" | "delivered"
): Promise<void> {
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, { status });
}

// Banner/Food Item Management
export async function createBanner(bannerData: Omit<Banner, "id" | "createdAt">): Promise<string> {
  const bannersRef = collection(db, "banners");
  const docRef = await addDoc(bannersRef, {
    ...bannerData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export function getBanners(callback: (banners: Banner[]) => void): () => void {
  const q = query(collection(db, "banners"), orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const banners: Banner[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Banner[];
      callback(banners);
    },
    (error) => {
      console.error("Error fetching banners:", error);
      callback([]);
    }
  );

  return unsubscribe;
}

export async function deleteBanner(bannerId: string): Promise<void> {
  const bannerRef = doc(db, "banners", bannerId);
  await deleteDoc(bannerRef);
}
