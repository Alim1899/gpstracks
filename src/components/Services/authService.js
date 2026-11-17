import {
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../../firebaseConfig";
export async function loginWithGoogle() {
  const { user } = await signInWithPopup(auth, googleProvider);
  const ref = doc(db, "users", user.uid);
  if (!(await getDoc(ref)).exists()) {
    await setDoc(ref, {
      name: user.displayName,
      photo: user.photoURL,
      createdAt: serverTimestamp(),
    });
  }
}

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

export const logout = () => signOut(auth);
