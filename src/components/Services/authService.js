import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../../firebaseConfig";
import { getOrCreateUserProfile } from "./userService";

export async function loginWithGoogle() {
  const { user } = await signInWithPopup(auth, googleProvider);
  await getOrCreateUserProfile(user);
}

export async function registerWithEmail(name, email, password) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: name });
  await getOrCreateUserProfile(user, name);
  await sendEmailVerification(user);
}

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

export const logout = () => signOut(auth);
