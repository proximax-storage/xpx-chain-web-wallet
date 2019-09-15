import { Pipe } from "@angular/core";

/**
 * A simple string filter, since Angular does not yet have a filter pipe built in.
 */
@Pipe({
  name: 'stringFilter'
})
export class StringFilterPipe {

  transform(value: [], q: string) {
    console.log(value);
    if (!q || q === '') {
      return value;
    }

    
    // console.log(q);
    const x = [];
    value.forEach(element => {
      // console.log(element);
      const data = Object.keys(element).filter(item => -1 < String(element[item]).toLowerCase().indexOf(q.toLowerCase()));
      // console.log('data---> ', data);
      if (data && data.length > 0) {
        x.push(element);
      }
    });

    // console.log(x);
    return x;
  }
}
