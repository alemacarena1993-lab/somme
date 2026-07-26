import { UserWineEntry } from '../types';
import { 
  db, 
  handleFirestoreError, 
  OperationType 
} from '../lib/firebase';
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';

const STORAGE_KEY = 'sommelier_digital_cellar';

export const storageService = {
  saveWine: async (entry: UserWineEntry, userId?: string): Promise<UserWineEntry[]> => {
    const entryWithUser = {
      ...entry,
      userId: userId || 'anonymous',
    };

    // Save to Firestore if user is authenticated
    if (userId) {
      try {
        const wineRef = doc(db, 'wines', entry.id);
        await setDoc(wineRef, entryWithUser);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `wines/${entry.id}`);
      }
    }

    // Always update local cache
    const existing = storageService.getCellar();
    const index = existing.findIndex(w => w.id === entry.id);
    let updated: UserWineEntry[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = entryWithUser;
    } else {
      updated = [entryWithUser, ...existing];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  deleteWine: async (id: string, userId?: string): Promise<UserWineEntry[]> => {
    if (userId) {
      try {
        const wineRef = doc(db, 'wines', id);
        await deleteDoc(wineRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `wines/${id}`);
      }
    }

    const existing = storageService.getCellar();
    const updated = existing.filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  getCellar: (): UserWineEntry[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  subscribeToCellar: (userId: string, callback: (wines: UserWineEntry[]) => void) => {
    if (!userId) return () => {};

    const q = query(collection(db, 'wines'), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const wines: UserWineEntry[] = [];
      snapshot.forEach((docSnap) => {
        wines.push(docSnap.data() as UserWineEntry);
      });
      // Sort by createdAt desc
      wines.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wines));
      callback(wines);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'wines');
    });
  }
};
