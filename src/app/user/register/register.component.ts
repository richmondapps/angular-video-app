import { Component } from '@angular/core';
import { Auth, OAuthProvider, createUserWithEmailAndPassword, sendSignInLinkToEmail, signInWithCredential, signInWithCustomToken, signInWithPopup } from '@angular/fire/auth';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { PhoneMaskDirective } from '../../shared/directives/phone-mask.directive';
import { FirebaseError } from '@angular/fire/app';
import { AuthService } from 'src/app/services/auth.service';
import IUser from 'src/app/models/user.model';
import { serverTimestamp } from '@angular/fire/firestore';
import { CreateService } from 'src/app/services/create.service';
import jwt_decode from 'jwt-decode';
import { ReadService } from 'src/app/services/read.service';
import { Router } from '@angular/router';


declare var google: any;

interface User {
  given_name: string;
  family_name: string;
  name: string;
  sub: string;
}

interface PersonForm {
  personFirstName: FormControl<any>;
  personLastName: FormControl<any>;
  personEmail: FormControl<any>;
  [key: string]: FormControl<string | null> | any;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [PhoneMaskDirective],
})
export class RegisterComponent {
  inSubmission = false;
  condition = true;
  showAlert = true;
  alertColor = 'blue';
  alertMsg = 'A sign in link will be sent to the email you submit.';
  personFirstName = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
  ]);
  personLastName = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
  ]);
  email = new FormControl('', [Validators.required, Validators.email]);
  // password = new FormControl('', [
  //   Validators.required,
  //   Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm),
  // ]);
  // confirmPassword = new FormControl('', Validators.required);
  // personPhoneNumber = new FormControl('', [
  //   Validators.required,
  //   Validators.minLength(14),
  //   Validators.maxLength(14),
  // ]);

  passwordlessForm!: FormGroup;
  passwordless: any;
  isShowForm!: boolean;
  emailSent!: boolean;
  errorMessage!: string;
  isEmailExists = false;
  emailAddressExists: any;
  isAlreadyRegistered!: boolean;
  isSignInLinkSent!: boolean;

  type!: string;

  registerForm = new FormGroup({
    personFirstName: this.personFirstName,
    personLastName: this.personLastName,
    email: this.email
  });
  signUpEmail: string | undefined;
  accessToken: any;

  constructor(
    private auth: Auth, 
    private authService: AuthService,
    private createService: CreateService,
    private readService: ReadService,
    private fb: FormBuilder,
    private router: Router
    
    ) {
    console.log(PhoneMaskDirective);
  }

  async registerUserFn() {
    this.inSubmission = true;
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'A sign in link will be sent to the email you submit.';

    const fName = (this.registerForm.get('personFirstName') as FormControl<any>)?.value;
    const lName = (this.registerForm.get('personLastName') as FormControl<any>)?.value;
    const email = (this.registerForm.get('email') as FormControl<any>)?.value;

    const e: any = email?.toLowerCase();


    const docRef = await this.readService.returnPromiseWhereFn(
      `users`,
      'personEmail',
      `${e}`
    );
 
    if (docRef?.length) {
      this.isEmailExists = true;
      this.inSubmission = false;
      this.emailAddressExists = email;
      this.isShowForm = false;
      this.alertMsg = 'This email address is already registered.'
      this.alertColor = 'red';
      setTimeout(() => {
        this.router.navigateByUrl('/');
      }, 2000);
    } else {
      this.isSignInLinkSent = true;


      const formData: PersonForm = {
        personFirstName: fName,
        personLastName: lName,
        personEmail: e
      }

      const queryString = Object.keys(formData)
  .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(formData[key])}`)
  .join('&');


  const s = `personFirstName=${fName}&personLastName=${lName}`
      const q = JSON.stringify(queryString)
      const actionCodeSettings = {
       //  url: `${this.subDomain}/employees/passwordless-register`,
          url: `http://localhost:5100/passwordless-register?${queryString}`,
        handleCodeInApp: true,
      };
 
      try {
      
      await sendSignInLinkToEmail(this.auth, e, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', e);

        this.alertMsg = 'Email link sent.'
        this.alertColor = 'green';
        // this.isShowForm = false;
        // this.emailSent = true;
        // setTimeout(() => {
        //   this.router.navigateByUrl('/');
        // }, 2000);
      } catch (err) {
        // console.log('SEND LINK ERROR', err);
        this.errorMessage = 'You must enter a valid email address';
      }
    

    //   try {
    //  this.authService.createUserFn(this.registerForm.value as IUser )
    //   } catch (error) {

    //     const firebaseError = error as FirebaseError;
    //     this.alertColor = 'red';

    //     console.log('Code', firebaseError.code);
    //     console.log('MSG', firebaseError.message);
    //     console.log('Name', firebaseError.name);
    //     console.log('Cause', firebaseError.cause);
    //     console.log('Custom Data', firebaseError.customData);
    //     console.log('Stack', firebaseError.stack);
    //     if(firebaseError.code === 'auth/email-already-in-use'){

    //       this.alertMsg = 'This email address is already registered.'
     
    //       return
    //     }

       
    //     this.alertMsg = 'There has been an error, please try again.'
    //     return
    //   }
      // this.alertMsg = 'Your account has been created';
      // this.alertColor = 'green';
      // this.inSubmission = false;
    }
  }


  ngAfterViewInit() {

    this.createPasswordlessForm();


    google.accounts.id.initialize({
      client_id: "888372631469-v9vridkgnaahagbfqrot3hr630k02fv3.apps.googleusercontent.com",
      callback: (response: any) => {
        //handle response in here
       // console.log('GIS Response', response)
        this.handleCredentialResponse(response)
      }
    });
    google.accounts.id.renderButton(
      document.getElementById("buttonDiv"),
      { theme: "outline", size: "large" }  
    );
  
  }

  async handleCredentialResponse(response: { credential: string; }) {




    // console.log("Encoded JWT ID token: " + response.credential);
//  const token = response.credential;
//    google.accounts.oauth2.initTokenClient({
//   client_id: "888372631469-v9vridkgnaahagbfqrot3hr630k02fv3.apps.googleusercontent.com",
//   scope: ["email","openid","https://www.googleapis.com/auth/cloudplatformprojects.readonly","https://www.googleapis.com/auth/firebase","https://www.googleapis.com/auth/cloud-platform"],
//   callback: (tokenResponse: any) => {
//     console.log('Token Response', tokenResponse)
//     if(tokenResponse){
//       this.accessToken = tokenResponse.access_token;
//     }

//     console.log('Access Token', this.accessToken)
//   }
// })

// tokenClient.callback = (response: any) => {
//   console.log('REsponse', response)
// }

// const accessToken = tokenClient.requestAccessToken()
// console.log('Access Token', accessToken)
  try {
    // const decodedToken = jwt_decode(token);
    // console.log(decodedToken);
    // Access the payload properties as needed, e.g., decodedToken.userId, decodedToken.exp, etc.
    // const userObject: User  = {
    //    given_name: '',
    //    family_name: '',
    //    name: '',
    //    sub: ''
    // };

  
    //   const personFirstName = userObject.given_name?.toString()
    //   const personLastName = userObject.given_name?.toString()
    //   const personFullName = userObject.name?.toString()
    //   const sub = userObject.sub?.toString()
   
    // const firebaseSignIn = await signInWithCustomToken(this.auth, this.accessToken)
    
    // const uid = firebaseSignIn.user.uid

    // const userEmail = firebaseSignIn.user.email;
    // const userEmailVerified = firebaseSignIn.user.emailVerified;
    // this.signUpEmail = userEmail?.toLowerCase();
    
    // const formData = {
    //   personeUid: uid,
    //   personEmail: this.signUpEmail,
    //   personFirstName,
    //   personLastName,
    //   personFullName,
    //   signUpDate: serverTimestamp(),
    //   personEmailVerified: userEmailVerified,
    //   signUpMethod: `Google`,
    //   sub
    // };
    // this.createService.createRecordFn(
    //   'users',
    //   uid,
    //   formData
    // );
  
  } catch (error) {
    console.error('Error decoding the JWT:', error);
  }

  
}

createPasswordlessForm() {
  this.passwordlessForm = this.fb.group({
    passwordlessEmail: ['', [Validators.required]],
  });
}

showFormFn() {
  this.isShowForm = true;
  return this.type === 'signup';
}

async sendEmailLink() {

  const email = this.passwordlessForm.get('passwordlessEmail')?.value;

  const e = email.toLowerCase();

  // console.log(`Emial LINK: ${email}`);
   const docRef = await this.readService.returnPromiseWhereFn(
     `users`,
     'personEmail',
     `${e}`
   );

   // console.log(`DocRef: ${docRef}`);
   if (docRef?.length) {
     this.isEmailExists = true;
     this.emailAddressExists = email;
     this.isShowForm = false;

     setTimeout(() => {
       this.router.navigateByUrl('/access/signin');
     }, 2000);
   } else {
     this.isSignInLinkSent = true;
     const actionCodeSettings = {
      //  url: `${this.subDomain}/employees/passwordless-register`,
         url: 'http://localhost:5100/passwordless-register',
       handleCodeInApp: true,
     };

     try {
     
     await sendSignInLinkToEmail(this.auth, email, actionCodeSettings);
       window.localStorage.setItem('emailForSignIn', email);
       let staffClassification;
       let emailVerified;
   
       const formData = {
  
         signUpDate: serverTimestamp(),
         emailVerified,
       };
       this.createService.createRecordFn(
         `users`,
         e,
         formData
       );

       this.isShowForm = false;
       this.emailSent = true;
       // setTimeout(() => {
       //   this.router.navigateByUrl('/');
       // }, 2000);
     } catch (err) {
       // console.log('SEND LINK ERROR', err);
       this.errorMessage = 'You must enter a valid email address';
     }
   }
 }

  async SSOFN(authProvider: string){
    const provider = new OAuthProvider(authProvider);
    // setPersistence(auth, browserSessionPersistence)
    // .then(async () => {
 try {
      const user = await signInWithPopup(this.auth, provider);

        const userEmail = user.user.email;
        const userEmailVerified = user.user.emailVerified;
        const userUid = user.user.uid;

        this.signUpEmail = userEmail?.toLowerCase();

        sessionStorage.setItem('LoggedInUserEmail', JSON.stringify(userEmail));
        sessionStorage.setItem(
          'EmailVerified',
          JSON.stringify(userEmailVerified)
        );

          const formData = {
            personeUid: userUid,
            personEmail: this.signUpEmail,
            signUpDate: serverTimestamp(),
            personEmailVerified: userEmailVerified,
            signUpMethod: `${authProvider} - SSO`
          };
          this.createService.createRecordFn(
            'users',
            userUid,
            formData
          );
      } catch (e) {
      console.log('SSO ERROR', e);
    
      }
    // })
  }
}
