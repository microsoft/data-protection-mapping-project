import { Component, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import {
   debounceTime, distinctUntilChanged, switchMap
 } from 'rxjs/operators';


@Component({
  selector: 'app-standard-map-search',
  templateUrl: './standard-map-search.component.html',
  styleUrls: [ './standard-map-search.component.css' ]
})
export class StandardMapSearchComponent implements OnInit {
  standardMap$: Observable<any[]>;
  private searchTerms = new Subject<string>();

  constructor() {}

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    //this.standardMap$ = this.searchTerms.pipe(
    //  // wait 300ms after each keystroke before considering the term
    //  debounceTime(300),
    //
    //  // ignore new term if same as previous term
    //  distinctUntilChanged(),
    //
    //  // switch to new search observable each time the term changes
    //  //switchMap((term: string) => this.standardMapService.searchStandardMaps(term)),
    //);
  }
}
