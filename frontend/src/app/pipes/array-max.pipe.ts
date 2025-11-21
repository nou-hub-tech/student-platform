import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'max'
})
export class ArrayMaxPipe implements PipeTransform {
  transform(array: any[], property?: string): any {
    if (!array || array.length === 0) {
      return 0;
    }

    if (property) {
      return Math.max(...array.map(item => item[property] || 0));
    } else {
      return Math.max(...array);
    }
  }
}
