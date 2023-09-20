import { Component } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { Auth, sendSignInLinkToEmail, signInWithEmailAndPassword } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth.service';
import { ReadService } from 'src/app/services/read.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  showAlert = true;
alertMsg = 'A sign in link will be sent to the email you submit.';
  inSubmission = false;
  alertColor = 'blue';

  constructor(private auth: Auth, private authService: AuthService,  private readService: ReadService, ) {}
  credentials = {
    email: ''
  };
  
  async loginFn() {
    this.inSubmission = true;
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'A sign in link will be sent to the email you submit.';

const email = this.credentials.email.toLowerCase()
    const docRef = await this.readService.returnPromiseWhereFn(
      `users`,
      'personEmail',
      `${email}`
    );

    if (!docRef?.length) {
      this.alertMsg = 'This email address has not been found.'
      this.alertColor = 'red';
      this.inSubmission = false;
    } else {
        try {

      const actionCodeSettings = {
           url: `http://localhost:5100/passwordless-signin`,
         handleCodeInApp: true,
       };


      await sendSignInLinkToEmail(this.auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);

      this.alertMsg = 'Email link sent.'
      this.alertColor = 'green';
     
      // console.log('CREDENTIALS', this.credentials);
      // console.log('EMAIL', this.credentials.email);
      // await signInWithEmailAndPassword(
      //   this.auth,
      //   this.credentials.email,
      // );
   
    } catch (error) {
      const firebaseError = error as FirebaseError;
      this.alertColor = 'red';

      console.log('Code', firebaseError.code);
      console.log('MSG', firebaseError.message);

      this.alertMsg = 'Oops! something went wrong, please try again';
      this.inSubmission = false;

      return;
    }
    }

  
  }

  // get isLoggedIn(): boolean {
  //   const loggedInUser = localStorage.getItem('LoggedInUser');
  //   if (loggedInUser) {
  //     JSON.parse(loggedInUser);
  //     return loggedInUser !== null ? true : false;
  //   } else {
  //     return false;
  //   }
  // }
}
