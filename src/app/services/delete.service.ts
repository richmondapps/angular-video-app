import { Injectable } from '@angular/core';
import {
  Firestore,
  arrayRemove,
  deleteDoc,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { deleteObject, ref, Storage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class DeleteService {
  constructor(
    private afs: Firestore,
    private storage: Storage,
  ) {}

  deleteRecordFn(documentPath: any, docId: string) {
    const docRef = doc(this.afs, documentPath, docId);
    return deleteDoc(docRef);
  }

  async deleteArrayRecordFn(collectionPath: any, docId: any, formData: object) {
    const colRef = doc(this.afs, collectionPath, docId);

    await updateDoc(colRef, {
      tools: arrayRemove(formData),
    });
  }

  deleteStorageFileAndFirestoreRefFn(
    storagePath: any,
    firestorePath: any,
    docId: any,
  ) {
    const fileRef = ref(this.storage, storagePath);
    const docRef = doc(this.afs, firestorePath, docId);

    deleteDoc(docRef).then(() => {
      deleteObject(fileRef)
        .then(() => {})
        .catch((error) => {});
    });
  }

  async deleteStorageFilesAndFirestoreRefFn(
    storagePath1: any,
    storagePath2: any,
    firestorePath: any,
    docId: any,
  ) {
    const fileRef1 = ref(this.storage, storagePath1);
    const fileRef2 = ref(this.storage, storagePath2);
    const docRef = doc(this.afs, firestorePath, docId);

    const p1 = await deleteDoc(docRef);
    const p2 = await deleteObject(fileRef1);
    const p3 = await deleteObject(fileRef2);

    try {
      const all = await Promise.all([p1, p2, p3]);
    } catch (error) {}
  }

  deleteStorageFileFn(
    storagePath: any,
    docId: any,
    snackSuccessMessage: any,
    snackErrorMessage: any,
  ) {
    const fileRef = ref(this.storage, storagePath);

    return deleteObject(fileRef)
      .then(() => {
        console.log('File Deleted');
      })
      .catch((error) => {
        console.log('Error Data', error);
      });
  }
}
