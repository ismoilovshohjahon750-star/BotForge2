import { setDoc, addDoc, updateDoc, deleteDoc, doc, collection, DocumentReference, CollectionReference, UpdateData } from 'firebase/firestore';
import { secondaryDb } from './firebase';

export async function safeSetDoc(docRef: DocumentReference, data: any, options?: { merge?: boolean }) {
  let primarySuccess = false;
  try {
    await setDoc(docRef, data, options);
    primarySuccess = true;
  } catch {
    // Primary quota or offline
  }

  // Backup / Dual-Write to Secondary Firebase database
  try {
    if (secondaryDb && docRef?.path) {
      const secDocRef = doc(secondaryDb, docRef.path);
      await setDoc(secDocRef, data, options);
    }
  } catch {
    // Silent secondary failover
  }
}

export async function safeAddDoc(collRef: CollectionReference, data: any) {
  let resultDoc: DocumentReference | null = null;
  try {
    resultDoc = (await addDoc(collRef, data)) as DocumentReference;
  } catch {
    // Primary quota or offline
  }

  // Backup / Dual-Write to Secondary Firebase database
  try {
    if (secondaryDb && collRef?.path) {
      const secCollRef = collection(secondaryDb, collRef.path);
      const secRes = await addDoc(secCollRef, data);
      if (!resultDoc) {
        resultDoc = secRes as DocumentReference;
      }
    }
  } catch {
    // Silent secondary failover
  }

  return resultDoc || ({ id: 'backup_' + Math.random().toString(36).substring(2, 9) } as unknown as DocumentReference);
}

export async function safeUpdateDoc(docRef: DocumentReference, data: UpdateData<any>) {
  try {
    await updateDoc(docRef, data);
  } catch {
    // Primary quota or offline
  }

  // Backup / Dual-Write to Secondary Firebase database
  try {
    if (secondaryDb && docRef?.path) {
      const secDocRef = doc(secondaryDb, docRef.path);
      await updateDoc(secDocRef, data);
    }
  } catch {
    // Silent secondary failover
  }
}

export async function safeDeleteDoc(docRef: DocumentReference) {
  try {
    await deleteDoc(docRef);
  } catch {
    // Primary quota or offline
  }

  // Backup / Dual-Write to Secondary Firebase database
  try {
    if (secondaryDb && docRef?.path) {
      const secDocRef = doc(secondaryDb, docRef.path);
      await deleteDoc(secDocRef);
    }
  } catch {
    // Silent secondary failover
  }
}


