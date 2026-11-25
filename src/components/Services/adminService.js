import {
  collection,
  deleteField,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { ref, remove } from "firebase/database";
import { db, rtdb } from "@/firebaseConfig";

export const MODERATION_STATUSES = ["pending", "published", "rejected"];
export const MAX_REJECT_REASON = 500;

// ადმინი = admins/{uid} დოკუმენტი არსებობს (Firebase Console-დან იქმნება ხელით)
export async function checkIsAdmin(uid) {
  try {
    return (await getDoc(doc(db, "admins", uid))).exists();
  } catch (err) {
    if (err.code === "permission-denied") return false;
    throw err;
  }
}

// სტატუსის მიხედვით, ახლები წინ (დალაგება აქ: orderBy-ს ცალკე ინდექსი დასჭირდებოდა)
export async function fetchTrailsByStatus(status) {
  const snap = await getDocs(query(collection(db, "trails"), where("status", "==", status)));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

// რაოდენობები ტაბებისთვის (count ერთ წაკითხვად ითვლება ყოველ 1000 დოკუმენტზე)
export async function fetchStatusCounts() {
  const counts = await Promise.all(
    MODERATION_STATUSES.map((status) =>
      getCountFromServer(query(collection(db, "trails"), where("status", "==", status))),
    ),
  );
  return Object.fromEntries(MODERATION_STATUSES.map((s, i) => [s, counts[i].data().count]));
}

/**
 * სტატუსის შეცვლა: published | rejected | pending
 * rejected-ს მიზეზი სჭირდება (ავტორი ხედავს), სხვა სტატუსზე მიზეზი იშლება
 */
export async function moderateTrail(id, { status, reason, adminId }) {
  await updateDoc(doc(db, "trails", id), {
    status,
    rejectReason: status === "rejected" ? reason.trim().slice(0, MAX_REJECT_REASON) : deleteField(),
    ...(status === "published" && { publishedAt: serverTimestamp() }),
    moderatedBy: adminId,
    moderatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// სრული წაშლა: ბილიკი + ტრეკი (ერთად), შემდეგ ორიგინალი ფაილი RTDB-დან
export async function deleteTrail(id) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "trails", id));
  batch.delete(doc(db, "trailTracks", id));
  await batch.commit();
  try {
    await remove(ref(rtdb, `trackFiles/${id}`));
  } catch (err) {
    console.error("Original file not deleted:", err); // ბილიკი უკვე წაშლილია — ვაგრძელებთ
  }
}