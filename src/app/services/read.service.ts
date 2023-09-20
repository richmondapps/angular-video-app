import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReadService {
  private pageSize = 3;
  private batchSize = 2;
  private lastDocument: any | null = null;
  private fetchedDocumentIds = new Set();
  private lastVisibleItem: any = null;
  private addedItemIds: Set<string> = new Set(); // Keeps track of added item IDs

  constructor(private afs: Firestore) {}

  returnObservableWhereFn(
    collectionPath: any,
    whereProperty: string,
    whereValue: any,
  ): Observable<any[]> {
    const colRef = collection(this.afs, collectionPath);
    const q = query(colRef, where(whereProperty, '==', whereValue));
    const res = collectionData(q) as Observable<any[]>;
    return res.pipe(
      map((data: any) => {
        return data;
      }),
    );
  }

  async returnPromiseOrderByFn(
    collectionPath: any,
    orderProperty: string,
    orderValue: any,
  ) {
    const colRef = await getDocs(
      query(
        collection(this.afs, collectionPath),
        orderBy(orderProperty, orderValue),
      ),
    );
    const resultsArray: any[] = [];
    colRef.forEach(async (doc) => {
      const data = doc.data();
      const id = doc.id;
      resultsArray.push({ id, ...data });
    });
    return resultsArray;
  }

  async returnPromiseWhereFn(
    collectionPath: any,
    whereProperty: string,
    whereValue: any,
  ) {
    const resultsArray: any[] = [];
    const colRef = await getDocs(
      query(
        collection(this.afs, collectionPath),
        where(whereProperty, '==', whereValue),
      ),
    );
    colRef.docs.map((f) => {
      const data = f.data();
      const id = f.id;
      resultsArray.push({ id, ...data });
    });
    return resultsArray;
  }

  async returnPrettierDataPromiseWhereFn(
    collectionPath: any,
    whereProperty: string,
    whereValue: any,
  ) {
    const resultsArray: any[] = [];
    const colRef = await getDocs(
      query(
        collection(this.afs, collectionPath),
        where(whereProperty, '==', whereValue),
      ),
    );
    colRef.docs.map((f) => {
      const data = f.data();
      const id = f.id;
      resultsArray.push({ id, ...data });
    });
    return resultsArray;
  }

  async getPaginatedDocumentsOrderByFn(
    collectionPath: string,
    orderProperty: string,
    orderValue: any,
  ): Promise<any[]> {
    const q = query(
      collection(this.afs, collectionPath),
      orderBy(orderProperty, orderValue),
    );

    if (this.lastDocument) {
      const nextQ = query(
        q,
        startAfter(this.lastDocument),
        limit(this.pageSize),
      );
      const querySnapshot = await getDocs(nextQ);
      const newItems = querySnapshot.docs
        .filter((doc) => !this.fetchedDocumentIds.has(doc.id))
        .map((doc) => ({ id: doc.id, ...doc.data() }));

      this.lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];
      newItems.forEach((item) => this.fetchedDocumentIds.add(item.id));

      return newItems;
    } else {
      const querySnapshot = await getDocs(q);
      const newItems = querySnapshot.docs
        .filter((doc) => !this.fetchedDocumentIds.has(doc.id))
        .map((doc) => ({ id: doc.id, ...doc.data() }));

      this.lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];
      newItems.forEach((item) => this.fetchedDocumentIds.add(item.id));

      return newItems;
    }
  }

  async getInitialItems(collectionName: string) {
    const q = query(
      collection(this.afs, collectionName),
      orderBy('timestamp', 'desc'),
      limit(this.batchSize),
    );
    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map((doc) => doc.data());
    if (items.length > 0) {
      this.setLastVisibleItem(
        querySnapshot.docs[querySnapshot.docs.length - 1],
      );
    }
    return items;
  }

  async getMoreItems(collectionName: string) {
    if (!this.lastVisibleItem) return [];
    const q = query(
      collection(this.afs, collectionName),
      orderBy('timestamp', 'desc'),
      startAfter(this.lastVisibleItem),
      limit(this.batchSize),
    );
    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map((doc) => doc.data());
    if (items.length > 0) {
      this.setLastVisibleItem(
        querySnapshot.docs[querySnapshot.docs.length - 1],
      );
    }
    return items;
  }

  setLastVisibleItem(item: any) {
    this.lastVisibleItem = item;
  }

  addNewItemIds(items: any[]) {
    items.forEach((item) => {
      if (!this.addedItemIds.has(item.docId)) {
        // Check for duplicates before adding to the set
        this.addedItemIds.add(item.docId); // Replace 'id' with the actual unique identifier field of your items
      }
    });
  }

  isItemAdded(item: any): boolean {
    return this.addedItemIds.has(item.docId); // Replace 'id' with the actual unique identifier field of your items
  }

  clearAddedItemIds() {
    this.addedItemIds.clear();
  }
}
