import {
  Component,
  ElementRef,
  ViewEncapsulation,
  OnInit,
  ViewChild,
  Renderer2,
  NgZone,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { serverTimestamp } from 'firebase/firestore';

import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  updateMetadata,
  UploadTask,
  UploadTaskSnapshot,
} from '@angular/fire/storage';
import { FirebaseError } from '@angular/fire/app';
import { CreateService } from 'src/app/services/create.service';
import { UidGeneratorService } from 'src/app/services/uid-generator.service';
import { AuthService } from 'src/app/services/auth.service';



@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent implements OnDestroy {
  isDragOver = false;
  file: File | null = null;
  nextStep = false;
  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  uploadForm = new FormGroup({
    title: this.title,
  });
  fileName: any;
  downloadUrl$!: string;
  fileToUpload: any;
  progress$: number = 0;
  width: number = 0;
  showProgressBar: boolean = false;
  isProgressBar: boolean = false;
  showAlert: boolean = false;
  alertMsg = '';
  alertColor = 'blue';
  uploadTask!: UploadTask;
imageUploading = false;
imageSelected = false;

  metadata!: { contentType: string | undefined; customMetadata: { uploadedByEmail: any; uploadedByUid: string; uploadDate: string; imageType: string}; };



  constructor(
    private storage: Storage,
    private ngZone: NgZone,
    private authService: AuthService,
    private createService: CreateService,
    private router: Router
  ) {

  }

  ngOnDestroy(): void {
    this.uploadTask?.cancel();
  }

  async storeFileFn(event: Event) {
    this.imageSelected = true;
    this.isDragOver = false;
    this.showAlert = false;
    this.file = (event as DragEvent).dataTransfer
      ? (event as DragEvent).dataTransfer?.files.item(0) ?? null
      : (event.target as HTMLInputElement).files?.item(0) ?? null;

    const fileToCheck = this.file?.size;

    if (fileToCheck && fileToCheck > 52428800) {
      console.log('FILE TOO BIG');
      const isFileSize = (fileToCheck / 1048576).toFixed(1) + 'MB';
      this.alertColor = 'red';
      this.showAlert = true;
      this.alertMsg = `Your file is ${isFileSize}, the maximum permitted is 50MB`;
      return;
    }

    console.log(this.file);
    if (!this.file) {
      return;
    }

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));

    this.fileName = this.title.setValue(
      this.file.name.replace(/\.[^/.]+$/, '')
    );

    this.fileToUpload = this.file;
    this.nextStep = true;
    this.isProgressBar = true;
  }

  updateProgressBar(progressBar: any, value: any, uploadTitle: string) {
    console.log('FILE UPLOADED VALUE', value);
    value = Math.round(value);
    progressBar.querySelector('.progress__fill').style.width = `${value}%`;
    progressBar.querySelector(
      '.progress__text'
    ).textContent = `Uploading ${uploadTitle} ${value}%`;
  }

  async uploadFileFn() {
    this.uploadForm.disable();
    const uid = UidGeneratorService.newId();
    const storagePath = `images/${this.authService.loggedInUserUid}/${uid}`;
    console.log('storagePath', storagePath);

    const date = new Date();
    const dd = date.getDate();
    const mm = date.getMonth() + 1;
    const yy = date.getFullYear();
    const uploadDate = `${mm}-${dd}-${yy}`;

      this.metadata = {
        contentType: this.file?.type,
        customMetadata: {
          uploadedByEmail: this.authService.loggedInUserEmail,
          uploadedByUid: this.authService.loggedInUserUid,
          uploadDate,
          imageType: 'Image'
        },
    }
   

    const storageRef = ref(this.storage, storagePath);
  
    this.uploadTask = uploadBytesResumable(
      storageRef,
      this.fileToUpload,
      this.metadata
    );
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Upload started...';
    const myProgressBar = document.querySelector('.progress');

    console.log('this.uploadTask', this.uploadTask);
    this.uploadTask.on(
      'state_changed',
      (snapshot) => {
        this.ngZone.run(() => {
          this.progress$ =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        });

        console.log('Upload is ' + this.progress$.toFixed(3) + '% done');

        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            this.updateProgressBar(myProgressBar, this.progress$, 'Image');
            break;
        }
      },
      (error) => {
        // Handle unsuccessful uploads
        this.uploadForm.enable();
        const firebaseError = error as FirebaseError;
        if (firebaseError.code === 'storage/unauthorized') {
          this.alertColor = 'red';
          this.showAlert = false;
          this.isProgressBar = false;
          this.showAlert = true;
          this.alertMsg =
            'Opps! There was a problem with the upload, please try again.';
        }
        console.log('Code', firebaseError.code);
        console.log('MSG', firebaseError.message);
        console.log('File error', error.message);
        console.log('Error', firebaseError);
      },
      () => {
        getDownloadURL(this.uploadTask.snapshot.ref).then(
          async (downloadURL) => {
            this.downloadUrl$ = downloadURL;
            console.log('File available at', downloadURL);
            if (this.downloadUrl$) {
              console.log('PROG IS 100');
              this.isProgressBar = false;
              this.showAlert = true;
              this.alertColor = 'green';
              this.alertMsg = 'Your file has been uploaded';
              this.nextStep = true;
             
              const title =  this.uploadForm.get('title')?.value;

              const firestoreRecordPath = `softwareImages`;
              const formData = {
                docId: uid,
                fileId: uid,
                fileUrl: this.downloadUrl$,
                fileName: this.file?.name || '',
                fileTitle: title || '',
                personEmail: this.authService.loggedInUserEmail,
                personUid: this.authService.loggedInUserUid,
                storagePath,
                timestamp: serverTimestamp()
              };

              console.log('Outer try catch', formData);
              try {
                this.createService.createRecordFn(
                  `${firestoreRecordPath}`,
                  uid,
                  formData
                );

                setTimeout(() => {
                  this.router.navigate([
                    'images'
                  ])
                }, 2000);
              } catch (error) {
                console.log('FB REC', error);
              }
            }
          }
        );
      }
    );

  }

  
}
