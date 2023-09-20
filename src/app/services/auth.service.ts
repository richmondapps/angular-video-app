import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import IUser from '../models/user.model';
import { onAuthStateChanged } from 'firebase/auth';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private collectionPath: string = 'users';
  isAuthenticated: boolean = false;
  public redirect = false;
  loggedInUserEmail: any;
  loggedInUserUid!: string;

  constructor(
    private auth: Auth,
    private router: Router,
    private afs: Firestore,
    private route: ActivatedRoute,
  ) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        const uid = user.uid;
        localStorage.setItem('loggedInUserUid', JSON.stringify(uid));
        localStorage.setItem('loggedInUserEmail', JSON.stringify(user.email));
        this.isAuthenticated = true;
        (this.loggedInUserEmail = user.email), (this.loggedInUserUid = uid);
      } else {
        // User is signed out
        this.isAuthenticated = false;
      }
    });

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        map((e) => this.route.firstChild),
        switchMap((route) => route?.data ?? of({ authOnly: false })),
      )
      .subscribe((data) => {
        this.redirect = data.authOnly ?? false;
      });
  }

  public async createUserFn(userData: IUser) {
    const userCred = await createUserWithEmailAndPassword(
      this.auth,
      userData.email as string,
      userData.password as string,
    );

    const formData = {
      personEmail: userData.email.toLowerCase(),
      personFirstName: userData.personFirstName,
      personLastName: userData.personLastName,
      personFullName: `${userData.personFirstName} ${userData.personLastName}`,
      personPhoneNumber: userData.personPhoneNumber,
      personUid: userCred.user.uid,
    };

    const colRef = doc(this.afs, this.collectionPath, userCred.user.uid);
    return setDoc(colRef, formData, { merge: true });
  }

  public async signOutFn(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    await signOut(this.auth);
    if (this.redirect) {
      await this.router.navigateByUrl('/');
    }
  }
}
