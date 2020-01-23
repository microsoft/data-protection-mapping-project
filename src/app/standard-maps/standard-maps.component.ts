import { Component, OnInit } from '@angular/core';

//import { StandardMap } from '../standard-map';

@Component({
  selector: 'app-standard-maps',
  templateUrl: './standard-maps.component.html',
  styleUrls: ['./standard-maps.component.css']
})
export class StandardMapsComponent implements OnInit {
  //standardMaps: StandardMap[];

  constructor() { }

  ngOnInit() {
    //this.getStandardMaps();
  }

  //getStandardMaps(): void {
  //}
  //
  //add(name: string): void {
  //  //name = name.trim();
  //  //if (!name) { return; }
  //  //this.standardMapService.addStandardMap({ name } as StandardMap)
  //  //  .subscribe(standardMap => {
  //  //    this.standardMaps.push(standardMap);
  //  //  });
  //}
  //
  //delete(standardMap: StandardMap): void {
  //}

}
