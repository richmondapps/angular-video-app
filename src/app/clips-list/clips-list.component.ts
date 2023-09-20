import { Component, HostListener, OnDestroy, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from '@angular/fire/firestore';
import { ReadService } from '../services/read.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-clips-list',
  templateUrl: './clips-list.component.html',
  styleUrls: ['./clips-list.component.css'],
  providers: [DatePipe]
})
export class ClipsListComponent implements OnInit, OnDestroy {
  items: any[] = [];
  targets!: NodeListOf<HTMLImageElement>;
@Input() scrollable = true;
@ViewChild('anchorLink', { static: true }) anchorLink!: ElementRef;

  constructor(private afs: Firestore,
    private readService: ReadService) {
     
    }

  ngOnInit(): void {
    this.items = []
  this.fetchInitialItems();
  }

  ngOnDestroy() {
    // Clear the addedItemIds set when the component is destroyed
    this.readService.clearAddedItemIds();
  }


  async fetchInitialItems() {
    this.items = await this.readService.getInitialItems('memberFiles');
    console.log('INITIAL ITEMS', this.items)
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    const scrollOffset = 200;
    const scrollPosition = window.scrollY + window.innerHeight;
    const totalHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= totalHeight - scrollOffset) {
      this.fetchMoreItems();
    }
  }

  async fetchMoreItems() {
    const moreItems = await this.readService.getMoreItems('memberFiles');
    console.log('MORE ITEMS', moreItems)
    if (moreItems.length > 0) {
      // this.readService.addNewItemIds(moreItems); 
      // Add new item IDs to the set first
      const uniqueItems = moreItems.filter(item => !this.readService.isItemAdded(item));
      console.log('uniqueItems ', uniqueItems)
      this.items.push(...uniqueItems);
      this.readService.addNewItemIds(moreItems); 
    }
  }

  // async loadItems() {
  //   const data = await this.readService.getPaginatedDocumentsOrderByFn('memberFiles', 'timestamp', 'desc');
  //   this.items.push(...data);
  // }

}
