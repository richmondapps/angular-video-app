import { Component } from '@angular/core';
import { Auth, signInWithEmailLink } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-passwordless-signin',
  templateUrl: './passwordless-signin.component.html',
  styleUrls: ['./passwordless-signin.component.css'],
})
export class PasswordlessSigninComponent {
  personEmail: string | undefined;


  constructor(private router: Router, private auth: Auth) {}

  ngOnInit(): void {
    const url = this.router.url;
    this.confirmSignIn(url);
  }

  async confirmSignIn(url: any) {
    try {
      if (url) {
        let incomingLinkEmail = window.localStorage.getItem('emailForSignIn');

        if (!incomingLinkEmail) {
          incomingLinkEmail = window.prompt(
            'Please provide your email for confirmation'
          );
        }

        this.personEmail = incomingLinkEmail?.toLowerCase();

        if (this.personEmail) {
          sessionStorage.setItem(
            'LoggedInUserEmail',
            JSON.stringify(this.personEmail)
          );

          await signInWithEmailLink(this.auth, this.personEmail, url);

          setTimeout(() => {
            this.router.navigateByUrl('/manage');
          }, 2000);

         
        } else {
          // this.personLegalNameFirst = JSON.parse(sessionStorage.getItem('PersonLegalNameFirst') as string);
          // this.isAlreadyRegistered = true;
          // this.authService.logout();
          setTimeout(() => {
            this.router.navigateByUrl('/');
          }, 2000);
        }

        //  console.log('DocRef Length', docRef?.length);
      }
    } catch (e) {
      console.log('ERROR', e);
    }
  }
}
