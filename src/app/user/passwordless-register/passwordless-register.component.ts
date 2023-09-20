/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { Auth, getAuth, signInWithEmailLink } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { serverTimestamp } from 'firebase/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { CreateService } from 'src/app/services/create.service';
import { ReadService } from 'src/app/services/read.service';
import { UidGeneratorService } from 'src/app/services/uid-generator.service';


interface QueryObject {
  [key: string]: any;
}


@Component({
  selector: 'csc-branches-nx-workspace-passwordless-register',
  templateUrl: './passwordless-register.component.html',
  styleUrls: ['./passwordless-register.component.css'],
})
export class PasswordlessRegisterComponent implements OnInit {
  email!: string;
  errorMessage!: string;
  isAlreadyRegistered!: boolean;
  isVerifiedEmployee!: boolean;
  personLegalNameFirst: any;
isEmailVerified = false;
  rootCollectionAndBranchDoc: any;
  rootEmployeeCollection: any;
  branchDocId: any;
  personEmail: string | unknown | any;
  registerData: any;
  personFirstName: any;
  personLastName: any;
  
  constructor(
              private authService: AuthService,
              private readService: ReadService,
              private createService: CreateService,
              private router: Router,
              private route: ActivatedRoute,
              private auth: Auth, 
  ) { }

  ngOnInit(): void {

    // this.personFirstName = this.route.snapshot.queryParams['personFirstName']
    // this.personLastName = this.route.snapshot.queryParams['personLastName']
 

    const url = this.router.url;
    this.confirmSignIn(url);
  }

  getQueryParams() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
     const queryParams: QueryObject = {};
  
    for (const [key, value] of urlParams) {
      queryParams[key] = value;
    }
    return queryParams;
  }

  getQueryParamValue(paramName: string) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const paramValue = urlParams.get(paramName);
  
    if (paramValue !== null) {
      try {
        // Attempt to parse the value as JSON if it's an object
        console.log('Params Val',  paramValue)
        const decodedValue = JSON.parse(decodeURIComponent(paramValue));
        console.log('Decoded Param Val',  decodedValue)
        return decodedValue;
      } catch (error) {
        // If it's not a valid JSON object, return the decoded string as is
        return decodeURIComponent(paramValue);
      }
    }
  
    return null;
  }
  
  async confirmSignIn(url: any) {
    try {
      if (url) {

      //   this.personFirstName  = this.getQueryParamValue('personFirstName');
      //  this.personLastName  = this.getQueryParamValue('personLastName');


       const params = this.getQueryParams()

       this.personFirstName = params['personFirstName']
       this.personLastName = params['personLastName']

       console.log('Query Params',  params)
      // console.log('Query Params FN',  this.personLastName)

        let incomingLinkEmail = window.localStorage.getItem('emailForSignIn');

        if (!incomingLinkEmail) {
          incomingLinkEmail = window.prompt('Please provide your email for confirmation');
        }

        this.personEmail = incomingLinkEmail?.toLowerCase();

        if(incomingLinkEmail){
          sessionStorage.setItem('LoggedInUserEmail', JSON.stringify(this.personEmail));
        }
      
         if(this.personEmail){
          sessionStorage.setItem('LoggedInUserEmail', JSON.stringify(this.personEmail));

        const userCredential = await signInWithEmailLink(this.auth, this.personEmail, url);

        const uid = userCredential.user.uid;

            const formData = {
              emailVerified: true,
              personFirstName: this.personFirstName,
              personLastName: this.personLastName,
              personEmail:  this.personEmail,
              personUid: uid,
              signUpMethod: 'passwordless email link',
              signUpDate: serverTimestamp()
            }

            this.createService.createRecordFn(
              `users`,
             uid,
              formData
            )
       
            this.router.navigateByUrl('/manage');
    
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
