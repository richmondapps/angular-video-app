import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatLineBreaks'
})
export class FormatLineBreaksPipe implements PipeTransform {

  transform(value: string): string {
    return value.replace(/\\n/g, '\n');
  }

}
