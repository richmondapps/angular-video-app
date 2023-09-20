import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  CollectionReference,
  Firestore,
  collection,
  collectionData,
  orderBy,
  query,
  where,
} from '@angular/fire/firestore';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DeleteService } from 'src/app/services/delete.service';
import { ModalService } from 'src/app/services/modal.service';
import { ReadService } from 'src/app/services/read.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css'],
})
export class ManageComponent {
  videoOrder = '1';
  videoList: any;
  authUid: any;
  loggedInUserUid: any;
  activeClip: any;
  deleteClip: any;

  items$!: Observable<any[]>;
  searchTerm!: string;
  itemsCollection: any;
  filteredItems: any[] = [];
  dropdownItems: any[] = [];
  showDropdown: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private readService: ReadService,
    private authService: AuthService,
    public deleteService: DeleteService,
    private modal: ModalService,
    private afs: Firestore,
    private router: Router,
    private auth: Auth,
  ) {
    const itemsCollectionRef = collection(this.afs, 'memberFiles');

    this.items$ = collectionData(itemsCollectionRef).pipe(
      map((snaps) =>
        snaps.map((snap) => ({
          id: snap['id'],
          ...snap,
        })),
      ),
    );

    const dropdownCollectionRef = collection(this.afs, 'softwareImages'); // Replace 'dropdown_items' with the name of the separate collection
    collectionData(dropdownCollectionRef).subscribe((dropdownSnaps) => {
      this.dropdownItems = dropdownSnaps.map((snap) => ({
        id: snap['id'],
        ...snap,
      }));

      console.log('DropdownItems', this.dropdownItems);
    });

    this.authUid = this.auth.currentUser?.uid;
    this.loggedInUserUid = JSON.parse(
      sessionStorage.getItem(`loggedInUserUid`) as any,
    );

    console.log('authUid', this.authUid);
  }
  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params: Params) => {
      this.videoOrder = params['sort'] === '2' ? params['sort'] : '1';
    });

    if (this.authUid) {
      this.fetchVideosFn();
    }
  }

  search(): void {
    if (this.searchTerm.trim() === '') {
      const itemsCollectionRef = collection(this.afs, 'memberFiles');

      const q = query(itemsCollectionRef, orderBy('fileTitle', 'asc'));

      const res = collectionData(q) as Observable<any[]>;
      console.log('RES DATA', res);
      res.pipe(
        map((data: any) => {
          data.map((e: any) => {
            console.log('CONVERTED DATA', e);
            return e;
          });
        }),
      );

      // this.items$ = collectionData(itemsCollectionRef).pipe(
      //     map((snaps) =>
      //       snaps.map((snap) => ({
      //         id: snap['id'],
      //         ...snap
      //       }))
      //     )
      //   );

      //  console.log('SEARCH', this.items$)
    } else {
      const itemsCollectionRef = collection(this.afs, 'memberFiles');
      const q = query(
        itemsCollectionRef,
        where('soft', 'array-contains', this.searchTerm.toLowerCase()),
      );

      console.log('KEYWORDS', this.searchTerm.trim());
      // const q = query(itemsCollectionRef, where('fileTitle', '==', this.searchTerm.trim() ));

      //   const res = collectionData(q) as Observable<any[]>;
      //   console.log('ELSE RES DATA', res)
      //  return  res.pipe(
      //     map((data: any) => {
      //       console.log('ELSE DATA', data)

      //       return data;
      //     })
      //   )

      this.items$ = collectionData(q).pipe(
        map((snaps) =>
          snaps.map((snap) => ({
            id: snap['id'],
            ...snap,
          })),
        ),
      );
      //  console.log('ELSE SEARCH', this.items$)
    }
  }

  searchFilter(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredItems = [];
    } else {
      this.items$
        .pipe(
          map((items) =>
            items.filter(
              (item) =>
                item.keywords?.some((keyword: string) =>
                  keyword.toLowerCase().includes(this.searchTerm.toLowerCase()),
                ),
            ),
          ),
        )
        .subscribe((filteredItems) => {
          this.filteredItems = filteredItems;
        });
    }
  }

  onFocus(): void {
    this.showDropdown = true;
  }

  onBlur(): void {
    this.showDropdown = false;
  }

  fetchVideosFn() {
    const uid = this.auth.currentUser?.uid;
    console.log('UID', this.loggedInUserUid);
    this.videoList = this.readService.returnObservableWhereFn(
      'memberFiles',
      'personUid',
      uid,
    );
    this.videoList.subscribe((d: any) => {
      console.log('VIDS', d);
    });
  }

  goToVideos(fileTitle: string){
    console.log('FileTitle', fileTitle);
  }

  sortFn(event: Event) {
    const { value } = event.target as HTMLSelectElement;

    this.router.navigateByUrl(`/manage?sort=${value}`);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sort: value,
      },
    });
  }

  openModalFn(event: Event, fileData: any) {
    event.preventDefault();
    console.log(event);
    console.log('fileData', fileData);

    this.activeClip = fileData;
    this.modal.toggleModal('editClip');
  }

  deleteFn(event: Event, fileData: any) {
    event.preventDefault();
    console.log(event);
    console.log('fileData', fileData);

    this.deleteClip = fileData;
    this.modal.toggleModal('deleteClip');
  }
}
