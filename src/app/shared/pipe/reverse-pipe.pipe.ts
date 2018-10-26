import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reversePipe'
})
export class ReversePipePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    console.log(value)
    return value.slice().reverse();
  }

}
