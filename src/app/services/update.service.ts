import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { arrayUnion } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  constructor(private afs: Firestore) {}

  async updateRecordFn(collectionPath: any, docId: any, formData: object) {
    const colRef = doc(this.afs, collectionPath, docId);
    await updateDoc(colRef, {
      tools: arrayUnion(formData),
    });
  }
}
