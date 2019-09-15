import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterobject'
})
export class FilterObjectPipe implements PipeTransform {

    transform(items: any[], filter: Record<any, any>): any {

        if (!items || !filter) {
            return items;
        }
        const keys = Object.keys(filter)
        const keyFilter = keys[0];

        if (keyFilter =='All') {
            const x = [];
            items.forEach(element => {
                // console.log(element);
                const data = Object.keys(element).filter(item => -1 < String(element[item]).toLowerCase().indexOf(filter[keyFilter].toLowerCase()));
                // console.log('data---> ', data);
                if (data && data.length > 0) {
                    x.push(element);
                }
            });

            // console.log(x);
            return x;
        } else {

            return items.filter(item => item[keyFilter].toLowerCase().indexOf(filter[keyFilter].toLowerCase()) !== -1);
        }
        // filter items array, items which match and return true will be
        // kept, false will be filtered out

    }
}