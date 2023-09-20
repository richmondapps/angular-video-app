import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { FieldValue, Timestamp } from '@angular/fire/firestore';

@Pipe({
  name: 'firebaseTimestamp'
})
export class FirebaseTimestampPipe implements PipeTransform {

  constructor(private datePipe: DatePipe){}

  transform(value: FieldValue | undefined) {

    if(!value){
      return ''
    }

    const date = (value as Timestamp).toDate();
    return this.datePipe.transform(date, 'mediumDate');
  }
}
