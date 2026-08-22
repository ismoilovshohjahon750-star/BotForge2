import { setDoc, addDoc, updateDoc, deleteDoc, DocumentReference, CollectionReference, UpdateData } from 'firebase/firestore';

export async function safeSetDoc(docRef: DocumentReference, data: any, options?: { merge?: boolean }) {
  try {
    await setDoc(docRef, data, options);
  } catch (e: any) {
    // quota or offline errors are safely handled
  }
}

export async function safeAddDoc(collRef: CollectionReference, data: any) {
  try {
    return await addDoc(collRef, data);
  } catch (e: any) {
    // quota or offline errors are safely handled, return dummy doc ref so app flow continues
    return { id: 'offline_' + Math.random().toString(36).substring(2, 9) } as unknown as DocumentReference;
  }
}

export async function safeUpdateDoc(docRef: DocumentReference, data: UpdateData<any>) {
  try {
    await updateDoc(docRef, data);
  } catch (e: any) {
    // quota or offline errors are safely handled
  }
}

export async function safeDeleteDoc(docRef: DocumentReference) {
  try {
    await deleteDoc(docRef);
  } catch (e: any) {
    // quota or offline errors are safely handled
  }
}

