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
import { ActivatedRoute, Params } from '@angular/router';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import { ReadService } from '../services/read.service';
import { DatePipe } from '@angular/common';
import hljs from 'highlight.js';
import { HighlightAutoResult, HighlightLoader } from 'ngx-highlightjs';

import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('javascript', javascript);
// import typescript from 'highlight.js/lib/languages/typescript';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CreateService } from '../services/create.service';
import { UidGeneratorService } from '../services/uid-generator.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { serverTimestamp } from 'firebase/firestore';
// hljs.registerLanguage('typescript', typescript);
import * as prettier from 'prettier/standalone';
import * as beautify from 'js-beautify';
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
import { UpdateService } from '../services/update.service';
import { DeleteService } from '../services/delete.service';
import { Observable } from 'rxjs';
import { SafeUrlPipe } from '../pipes/safe-url.pipe';

const themeGithub: string = 'node_modules/highlight.js/styles/github.css';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe, SafeUrlPipe],
})
export class ClipComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer', { static: true }) target?: ElementRef;
  player?: Player;
  id = '';
  fileData!: any[];
  fileUrl: any;
  title: any;
  timestamp: any;

  code: any;
  codeSnippet: any;
  currentTheme: string = themeGithub;
  response!: HighlightAutoResult;
  codeSnip = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
  ]);
  codeSippetForm = new FormGroup({
    codeSnip: this.codeSnip,
  });
  placeholder = '<br>';
  formattedCode!: SafeHtml;
  formattedData: any;
  isDragOver = false;

  imageFile: any;
  alertMsg!: string;
  showAlert!: boolean;
  alertColor!: string;
  fileToUpload: any;
  uploadTask!: UploadTask;
  downloadUrl$!: string;
  iconList!: any[];
  fileName: any;
  toolsUsed: any;
  fetchVideoObs: any;
  constructor(
    public route: ActivatedRoute,
    private hljsLoader: HighlightLoader,
    private readService: ReadService,
    private renderer: Renderer2,
    private createService: CreateService,
    private updateService: UpdateService,
    private deleteService: DeleteService,
    private sanitizer: DomSanitizer,
    private domSanitizer: DomSanitizer,
    private ngZone: NgZone,
    private storage: Storage,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      console.log('FILE ID', this.id);
     this.fetchSelectedVideoFn(this.id);
      this.fetchSelectedVideoCodeSamplesFn(this.id);
      this.fetchAllIconsFn();
    });
  }

  ngOnDestroy(){
    this.fetchVideoObs.unsubscribe();
  }

  async fetchAllIconsFn() {
    const d = await this.readService.returnPromiseOrderByFn(
      'softwareImages',
      'fileTitle',
      'asc',
    );
    const i: any[] = [];
    d.map((e) => {
      i.push(e);
    });
    this.iconList = i;
  }

  addImageToProjectFn(data: any){
    const f = {
        ...data
    }
    this.updateService.updateRecordFn('memberFiles', this.id, f)
  }

  removeImageToProjectFn(data: any){
    const f = {
        ...data
    }
    this.deleteService.deleteArrayRecordFn('memberFiles', this.id, f)
  }

  onHighlight(e: HighlightAutoResult) {
    this.response = {
      language: e.language,
      relevance: e.relevance,
      secondBest: '{...}',
      value: '{...}',
    };
  }

  async fetchSelectedVideoCodeSamplesFn(docId: string) {
    const d = await this.readService.returnPromiseWhereFn(
      'codeSnippets',
      'videoFileId',
      docId,
    );
    console.log('CODE SNIPPETS ', d);

    const f: any[] = [];

    d.map((e) => {
      const formattedData = beautify(e.code, {
        indent_size: 2,
        preserve_newlines: true,
        // You can adjust the indentation as needed
        // Specify other options as needed for formatting (e.g., braces placement, etc.)
      });
      f.push({ ...e, formattedData });
    });

    console.log('F  ARR ', f);

    this.formattedData = f;
    // const [x] = [...d];
    // console.log('CODE SNIPPETS RES ', x);
    // this.code = x.code.replace(new RegExp(this.placeholder, 'g'), '\n');
  }

  fetchSelectedVideoFn(docId: string){
  this.fetchVideoObs = this.readService.returnObservableWhereFn( 'memberFiles',
  'docId',
  docId).subscribe((d: any) => {
    console.log('FORM DATA', d);
    const [x] = [...d];
    this.fileUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(x.fileUrl);
    this.title = x.fileTitle;
    this.timestamp = x.timestamp;
      this.toolsUsed = x.tools;
      console.log('VID', x.fileUrl)
    this.player = videojs(this.target?.nativeElement);
    this.player?.src({
      src: x.fileUrl,
      type: 'video/mp4',
    });
  })
}

 

  addCodeFn() {
    const s = this.codeSippetForm.get('codeSnip')?.value;
    // const modifiedData = s?.replace(/\n/g, this.placeholder);

    const d = {
      code: s,
      videoFileId: this.id,
      timestamp: serverTimestamp(),
    };

    console.log('FORM DATA', d);
    const docId = UidGeneratorService.newId();
    this.createService.createRecordFn('codeSnippets', docId, d);
  }

  ngAfterViewInit() {
    const videoRef = document.querySelector(
      '.videoDropRef',
    ) as HTMLVideoElement;
    videoRef?.addEventListener('loadedmetadata', () => {
      const videoDuration = videoRef.duration;
      const minutes = parseInt((videoDuration / 60).toString());
      const seconds =
        videoDuration % 60 < 10
          ? '0' + Math.ceil(videoDuration % 60).toString()
          : Math.ceil(videoDuration % 60).toString();
      const videoDurationTime = minutes + ':' + seconds;

      console.log('videoDurationTime :>> ', videoDurationTime);
    });

    this.fetchSelectedVideoFn(this.id);


  }

  // togglePlayPause(): void {
  //   // Check if the video is paused or playing
  //   if (this.player?.paused()) {
  //     // If paused, play the video
  //     this.player?.play();
  //   } else {
  //     // If playing, pause the video
  //     this.player?.pause();
  //   }
  // }
}
