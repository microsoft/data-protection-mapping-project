import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';


@Pipe({ name: 'formatDate' })
export class formatDatePipe implements PipeTransform {
    constructor() {
    }

    transform(value: string): string {
      var date = new Date(value);
      var format = "MMM D, YYYY";

      /* this code removes the year from showing for a date if it is the same as the current year */    
      // if (date.getFullYear() == new Date().getFullYear()) {
      //     format = "MMM D";
      // }

      // set this true to show the time also
      //if (includeTime)
      //    format += ", h:mm A";

      var dt = moment(date);

      // set this true to ignore local time zone.
      //if (showUtc)
      //  dt = dt.utc();

      return dt.format(format);
    }
}
