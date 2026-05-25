import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "@/lib/firebase/client";

import { AppUser } from "@/types/user";

export const createUserProfile = async (user: AppUser) => {
  await setDoc(doc(db, "users", user.uid), user);
};

export const getUserProfile = async (uid: string) => {
  const snapshot = await getDoc(doc(db, "users", uid));

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as AppUser;
};
