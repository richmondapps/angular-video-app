import { AfterViewInit, Directive, ElementRef } from '@angular/core';
import  hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript'; // Change this based on the language you want to highlight
import typescript from 'highlight.js/lib/languages/typescript';
import { HighlightJS } from 'ngx-highlightjs';

// hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);


@Directive({
  selector: '[appHighlightJs]'
})
export class HighlightJsDirective {

  constructor(private elRef: ElementRef, private highlightJs: HighlightJS) {}

  ngAfterViewInit() {
    hljs.highlightElement(this.elRef.nativeElement);
  }

}
