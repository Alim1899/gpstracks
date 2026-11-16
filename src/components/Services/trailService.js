import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

export async function fetchTrails(region) {
  const ref = collection(db, "trails");
  const q = region ? query(ref, where("region", "==", region)) : ref;
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}