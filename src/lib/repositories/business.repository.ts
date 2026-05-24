import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/client";
import { COLLECTIONS } from "../constants/collections";

export const createBusiness = async (data: any) => {
  return addDoc(
    collection(db, COLLECTIONS.BUSINESSES),
    data
  );
};

export const getBusinesses = async () => {
  const snapshot = await getDocs(
    collection(db, COLLECTIONS.BUSINESSES)
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};