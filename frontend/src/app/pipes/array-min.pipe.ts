import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'min'
})
export class ArrayMinPipe implements PipeTransform {
  transform(array: any[], property?: string): any {
    if (!array || array.length === 0) {
      return 0;
    }

    if (property) {
      return Math.min(...array.map(item => item[property] || 0));
    } else {
      return Math.min(...array);
    }
  }
}
