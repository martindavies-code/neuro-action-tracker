import { db, doc, setDoc, getDoc } from './firebase';
import type { Badge, SensorySettings, TaskItem, UserStats } from '../types';

export interface CloudUserData {
  tasks: TaskItem[];
  stats: UserStats;
  badges: Badge[];
  settings: SensorySettings;
  updatedAt: string;
}

export async function syncUserDataToFirestore(
  uid: string,
  data: {
    tasks: TaskItem[];
    stats: UserStats;
    badges: Badge[];
    settings: SensorySettings;
  }
): Promise<boolean> {
  if (!db) return false;

  try {
    const userDocRef = doc(db, 'users', uid);
    const rawPayload: CloudUserData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    // Strip any undefined fields to ensure 100% compliance with Firestore data types
    const cleanPayload = JSON.parse(JSON.stringify(rawPayload));
    await setDoc(userDocRef, cleanPayload, { merge: true });
    return true;
  } catch (error) {
    console.error('Failed to sync to Firestore:', error);
    return false;
  }
}

export async function fetchUserDataFromFirestore(
  uid: string
): Promise<CloudUserData | null> {
  if (!db) return null;

  try {
    const userDocRef = doc(db, 'users', uid);
    const snapshot = await getDoc(userDocRef);
    if (snapshot.exists()) {
      return snapshot.data() as CloudUserData;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch from Firestore:', error);
    return null;
  }
}
