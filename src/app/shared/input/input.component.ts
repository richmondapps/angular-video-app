import { Component, ContentChild, Directive, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AsYouType } from 'libphonenumber-js'
import { PhoneMaskDirective} from '../../shared/directives/phone-mask.directive';



@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent {
@Input() control: FormControl = new FormControl();

@Input() type = 'text';
@Input() controlName = '';
@Input() placeholder = '';
@Input() customDirective!: Directive;
@ContentChild(PhoneMaskDirective, {static: true}) child!: PhoneMaskDirective;
@Input() checkDir = false;



ngOnInit(): void {


  console.log(this.customDirective);
  if(this.type === 'customDirective'){
    console.log('Directive Added');

    this.customDirective;
  }
}

}
