import {
  collection, query, where, getDocs, writeBatch,
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { deleteUser, reauthenticateWithPopup, GoogleAuthProvider } from "firebase/auth";
import { db, auth } from "@/firebaseConfig";

function splitName(displayName = "") {
  const [firstName = "", ...rest] = displayName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

// პირველ შესვლაზე ქმნის პროფილს Google-ის სახელით
export async function getOrCreateUserProfile(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();

  const profile = {
    ...splitName(user.displayName ?? ""),
    email: user.email,
    photoURL: user.photoURL ?? "",
    likesReceived: 0,
    settings: {},
  };

  await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
  return profile;
}

export function updateUserProfile(uid, { firstName, lastName }) {
  return updateDoc(doc(db, "users", uid), { firstName, lastName });
}

export function updateSettings(uid, settings) {
  return updateDoc(doc(db, "users", uid), { settings });
}

export async function deleteAccount({ keepTrails }) {
  const user = auth.currentUser;
  if (!user) throw new Error("not-authenticated");

  await reauthenticateWithPopup(user, new GoogleAuthProvider());

  const [trailsSnap, notifSnap] = await Promise.all([
    getDocs(query(collection(db, "trails"), where("authorId", "==", user.uid))),
    getDocs(collection(db, "users", user.uid, "notifications")),
  ]);

  const batch = writeBatch(db);

  trailsSnap.forEach((d) => {
    if (keepTrails && d.data().status === "published") {
      batch.update(d.ref, { authorId: null, authorName: null, authorDeleted: true });
    } else {
      batch.delete(d.ref);
    }
  });

  notifSnap.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, "users", user.uid));

  await batch.commit();
  await deleteUser(user);
}