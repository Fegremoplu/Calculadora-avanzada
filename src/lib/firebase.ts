import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  deleteUser,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  limit,
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { HistoryItem, AngleUnit, NumberFormat } from '../types';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore (using custom databaseId if configured)
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Test initial connection as required by Firebase skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    // Attempt a light ping
    await getDocFromServer(doc(db, '_health', 'ping'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore is offline or unreachable.');
      return false;
    }
    // Any permission or other response means server was reached
    return true;
  }
}

// User state listener and auto anonymous authentication
export function initAuthListener(onUserUpdated: (user: User | null) => void): () => void {
  const unsubscribe = onAuthStateChanged(auth, async user => {
    if (user) {
      onUserUpdated(user);
    } else {
      try {
        const cred = await signInAnonymously(auth);
        onUserUpdated(cred.user);
      } catch (err) {
        console.warn('Auto anonymous sign in:', err);
        onUserUpdated(null);
      }
    }
  });

  return unsubscribe;
}

// Google Sign-In with privacy-first minimal scope
export async function signInWithGoogle(): Promise<{ user: User | null; error?: string }> {
  const provider = new GoogleAuthProvider();
  // Request strictly the default identity scopes (profile, email).
  // No secondary permissions (Gmail, Drive, Contacts) are requested.
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  try {
    const result = await signInWithPopup(auth, provider);
    return { user: result.user };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al conectar con Google';
    console.error('Google Sign In error:', err);
    return { user: null, error: message };
  }
}

// Sign Out
export async function logoutUser(): Promise<void> {
  await signOut(auth);
  // Re-sign in anonymously so user can still sync locally
  await signInAnonymously(auth);
}

// GDPR: Delete all user cloud data and account
export async function deleteUserAccountAndCloudData(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    // 1. Delete all history documents in user's subcollection
    const colRef = collection(db, 'users', user.uid, 'history');
    const snap = await getDocs(colRef);
    const batch = writeBatch(db);
    snap.forEach(docSnap => batch.delete(docSnap.ref));

    // 2. Delete user preference document
    const userDocRef = doc(db, 'users', user.uid);
    batch.delete(userDocRef);
    await batch.commit();

    // 3. Delete Firebase Auth account if authenticated with Google
    if (!user.isAnonymous) {
      await deleteUser(user);
    }
    // Re-sign in anonymously for continuous offline/local usage
    await signInAnonymously(auth);
    return true;
  } catch (err) {
    console.error('Error deleting account and data:', err);
    return false;
  }
}

// History Cloud Persistence
export async function saveHistoryItemToCloud(item: HistoryItem): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const ref = doc(db, 'users', user.uid, 'history', item.id);
    await setDoc(ref, {
      id: item.id,
      userId: user.uid,
      expression: item.expression,
      result: item.result,
      angleUnit: item.angleUnit || 'DEG',
      timestamp: item.timestamp,
    });
  } catch (err) {
    console.warn('Could not save history to Firestore:', err);
  }
}

export async function loadHistoryFromCloud(): Promise<HistoryItem[]> {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const colRef = collection(db, 'users', user.uid, 'history');
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(50));
    const snap = await getDocs(q);

    const items: HistoryItem[] = [];
    snap.forEach(d => {
      const data = d.data();
      items.push({
        id: data.id || d.id,
        expression: data.expression,
        result: data.result,
        angleUnit: data.angleUnit,
        timestamp: data.timestamp,
      });
    });

    return items;
  } catch (err) {
    console.warn('Could not load history from Firestore:', err);
    return [];
  }
}

export async function deleteHistoryItemFromCloud(id: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const ref = doc(db, 'users', user.uid, 'history', id);
    await deleteDoc(ref);
  } catch (err) {
    console.warn('Could not delete history item from Firestore:', err);
  }
}

export async function clearAllHistoryFromCloud(historyItems: HistoryItem[]): Promise<void> {
  const user = auth.currentUser;
  if (!user || historyItems.length === 0) return;

  try {
    const batch = writeBatch(db);
    historyItems.forEach(item => {
      const ref = doc(db, 'users', user.uid, 'history', item.id);
      batch.delete(ref);
    });
    await batch.commit();
  } catch (err) {
    console.warn('Could not clear history in Firestore:', err);
  }
}

// User Preferences Cloud Sync
export async function savePreferencesToCloud(prefs: {
  angleUnit: AngleUnit;
  numberFormat: NumberFormat;
  soundEnabled: boolean;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const ref = doc(db, 'users', user.uid);
    await setDoc(
      ref,
      {
        uid: user.uid,
        angleUnit: prefs.angleUnit,
        numberFormat: prefs.numberFormat,
        soundEnabled: prefs.soundEnabled,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not save preferences to Firestore:', err);
  }
}
