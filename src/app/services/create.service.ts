import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class CreateService {
  constructor(private afs: Firestore) {}

  createRecordFn(collectionPath: any, docId: any, formData: object) {
    const colRef = doc(this.afs, collectionPath, docId);
    return setDoc(colRef, formData, { merge: true });
  }
}
