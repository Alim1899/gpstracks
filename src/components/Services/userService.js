import {
  collection, query, where, getDocs, writeBatch,
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { ref, remove } from "firebase/database";
import {
  deleteUser, reauthenticateWithPopup, reauthenticateWithCredential, EmailAuthProvider,
} from "firebase/auth";
import { db, rtdb, auth, googleProvider } from "@/firebaseConfig";

function splitName(fullName = "") {
  const [firstName = "", ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

// ძველი დოკუმენტები (name/photo) წაკითხვისას ახალ ფორმაში
function normalizeProfile(data, user) {
  const fromName = splitName(data.name ?? user.displayName ?? "");
  return {
    firstName: data.firstName ?? fromName.firstName,
    lastName: data.lastName ?? fromName.lastName,
    email: data.email ?? user.email,
    photoURL: data.photoURL ?? data.photo ?? user.photoURL ?? "",
    likesReceived: data.likesReceived ?? 0,
    settings: data.settings ?? {},
  };
}

// name: email-ით რეგისტრაციისას (displayName ჯერ შეიძლება არ იყოს განახლებული)
export async function getOrCreateUserProfile(user, name) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) return normalizeProfile(snap.data(), user);

  const profile = normalizeProfile({ name }, user);
  await setDoc(userRef, { ...profile, createdAt: serverTimestamp() });
  return profile;
}

export function updateUserProfile(uid, { firstName, lastName }) {
  return updateDoc(doc(db, "users", uid), { firstName, lastName });
}

export function updateSettings(uid, settings) {
  return updateDoc(doc(db, "users", uid), { settings });
}

// Google-ით შესულს popup, დანარჩენს პაროლი სჭირდება
export const needsPassword = (user) =>
  !user.providerData.some((p) => p.providerId === "google.com");

export async function deleteAccount({ keepTrails, password }) {
  const user = auth.currentUser;
  if (!user) throw new Error("not-authenticated");

  if (needsPassword(user)) {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
  } else {
    await reauthenticateWithPopup(user, googleProvider);
  }

  const [trailsSnap, notifSnap] = await Promise.all([
    getDocs(query(collection(db, "trails"), where("authorId", "==", user.uid))),
    getDocs(collection(db, "users", user.uid, "notifications")),
  ]);

  const batch = writeBatch(db);
  const deletedIds = [];

  trailsSnap.forEach((d) => {
    const trackRef = doc(db, "trailTracks", d.id);
    if (keepTrails && d.data().status === "published") {
      batch.update(d.ref, { authorId: null, authorName: null, authorDeleted: true });
      batch.update(trackRef, { authorId: null });
    } else {
      batch.delete(d.ref);
      batch.delete(trackRef);
      deletedIds.push(d.id);
    }
  });

  notifSnap.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, "users", user.uid));
  await batch.commit();

  await Promise.allSettled(deletedIds.map((id) => remove(ref(rtdb, `trackFiles/${id}`))));
  await deleteUser(user);
}