import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Injectable } from '@angular/core';
//import { mapDb } from './mock-standard-maps'

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    return {'standard-map':null};
  }

  //// Overrides the genId method to ensure that a standard-map always has an id.
  //// If the standardMaps array is empty,
  //// the method below returns the initial number (11).
  //// if the standardMaps array is not empty, the method below returns the highest
  //// standard-map id + 1.
  //genId(standardMaps: StandardMap[]): number {
  //  return standardMaps.length > 0 ? Math.max(...standardMaps.map(standardMap => standardMap.id)) + 1 : 11;
  //}
}
