import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

import { auth } from "../firebase/client";

export const loginAdmin = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerAdmin = async (email: string, password: string, fullName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (fullName) {
    await updateProfile(userCredential.user, { displayName: fullName });
  }
  return userCredential;
};

export const logoutUser = async () => {
  return signOut(auth);
};
