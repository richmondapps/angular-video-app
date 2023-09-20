import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatLineBreaks'
})
export class FormatLineBreaksPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
