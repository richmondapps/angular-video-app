import {
  Component,
  ElementRef,
  NgZone,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  updateMetadata,
  UploadTask,
  UploadTaskSnapshot,
} from '@angular/fire/storage';
import { UidGeneratorService } from 'src/app/services/uid-generator.service';
import { FfmpegService } from 'src/app/services/ffmpeg.service';
import { Observable, forkJoin } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreError } from 'firebase/firestore';
import { serverTimestamp } from '@angular/fire/firestore';
import { CreateService } from 'src/app/services/create.service';
import { FirebaseError } from '@angular/fire/app';
import { Router } from '@angular/router';
import { ReadService } from 'src/app/services/read.service';
import { SafeUrlPipe } from 'src/app/pipes/safe-url.pipe';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
  providers: [SafeUrlPipe]
})
export class UploadComponent implements OnDestroy {
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
  screenshots: any[] = [];
  selectedScreenshot: any;
  screenshotTask!: UploadTask;
  metadata!: { contentType: string | undefined; customMetadata: { uploadedByEmail: any; uploadedByUid: string; uploadDate: string; imageType: string}; };

  private readFileAsUint8Array(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        resolve(uint8Array);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  constructor(
    private storage: Storage,
    private ngZone: NgZone,
    private authService: AuthService,
    private createService: CreateService,
    private readService: ReadService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    this.ffmpegService.init();
  }

  ngOnDestroy(): void {
    this.uploadTask?.cancel();
  }

  async storeFileFn(event: Event) {
    if(this.ffmpegService.isRunning){
      return
    }

    this.isDragOver = false;
    this.showAlert = false;
    this.file = (event as DragEvent).dataTransfer
      ? (event as DragEvent).dataTransfer?.files.item(0) ?? null
      : (event.target as HTMLInputElement).files?.item(0) ?? null;

    const fileToCheck = this.file?.size;

    if (fileToCheck && fileToCheck > 524288000) {
      console.log('FILE TOO BIG');
      const isFileSize = (fileToCheck / 1048576).toFixed(1) + 'MB';
      this.alertColor = 'red';
      this.showAlert = true;
      this.alertMsg = `Your file is ${isFileSize}, the maximum permitted is 50MB`;
      return;
    }

    console.log(this.file);
    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.screenshots = await this.ffmpegService.getScreenshotsFn(this.file)

    console.log('FFMPEG Screenshots', this.screenshots);

    this.selectedScreenshot = this.screenshots[0];

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
    const storagePath = `video/${this.authService.loggedInUserUid}/${uid}.mp4`;
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
          imageType: 'Video'
        },
   
   
    };

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
            this.updateProgressBar(myProgressBar, this.progress$, 'Video');
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

              const firestoreRecordPath = `memberFiles`;
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

              await this.uploadSelectedScreenshotFn(uid);

                setTimeout(() => {
                  this.router.navigate([
                    'clip', uid
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

  


    //   setTimeout(() => {
    //     this.uploadSuccessful.emit('success');
    //   }, 2000);

    // console.log('CSC Upload Progress', this.uploadProgress$);
  }
  async uploadSelectedScreenshotFn(uid: any){

    this.isProgressBar = true;
    const date = new Date();
    const dd = date.getDate();
    const mm = date.getMonth() + 1;
    const yy = date.getFullYear();
    const uploadDate = `${mm}-${dd}-${yy}`;

    const screenshotBlob = await this.ffmpegService.blobFromUrl(
      this.selectedScreenshot
    )

    
    this.metadata = {
      contentType: 'png',
      customMetadata: {
        uploadedByEmail: this.authService.loggedInUserEmail,
        uploadedByUid: this.authService.loggedInUserUid,
        uploadDate,
        imageType: 'Video Thumbnail'
      },
    }
    const screenshotUid = UidGeneratorService.newId();
    const screenshotStoragePath = `screenshots/${this.authService.loggedInUserUid}/${screenshotUid}.png`;
    
    const screenshotRef = ref(this.storage, screenshotStoragePath);
    this.screenshotTask =  uploadBytesResumable(
      screenshotRef,
      screenshotBlob,
      this.metadata
    );
    
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Screenshot upload started...';
    const myProgressBar = document.querySelector('.progress');

    this.screenshotTask.on(
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
            this.updateProgressBar(myProgressBar, this.progress$, 'Screenshot');
            break;
        }
     
      },
      (error) => {
        // Handle unsuccessful uploads

        const firebaseError = error as FirebaseError;
        if (firebaseError.code === 'storage/unauthorized') {
          this.alertColor = 'red';
          this.showAlert = false;
          this.isProgressBar = false;
          this.showAlert = true;
          this.alertMsg =
            'Oops! There was a problem with the thumbnail upload, you can choose aonther later.';
        }
        console.log('Code', firebaseError.code);
        console.log('MSG', firebaseError.message);
        console.log('File error', error.message);
        console.log('Error', firebaseError);
      },
      () => {
        getDownloadURL(this.screenshotTask.snapshot.ref).then(
          async (downloadURL) => {
            this.downloadUrl$ = downloadURL;
            console.log('SS available at', downloadURL);
            if (this.downloadUrl$) {
              console.log('SS IS 100');

              const firestoreRecordPath = `memberFiles`;
              const formData = {
                thumbnailUrl: this.downloadUrl$,
                screenshotStoragePath,
                screenshotUid
              };

              console.log('Outer try catch', formData);
              try {
                this.createService.createRecordFn(
                  `${firestoreRecordPath}`,
                  uid,
                  formData
                );
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
