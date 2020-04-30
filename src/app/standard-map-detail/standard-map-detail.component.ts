import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { FullDocNode }         from '../standard-map';
import { GraphService }  from '../graph.service';
import { GraphTab } from "../GraphTab";

@Component({
  selector: 'app-standard-map-detail',
  templateUrl: './standard-map-detail.component.html',
  styleUrls: [ './standard-map-detail.component.css' ]
})
export class StandardMapDetailComponent implements OnInit {
  @Input() standardMap: FullDocNode;
  public treeData: GraphTab;

  constructor(
    private route: ActivatedRoute,
    private graphService: GraphService,
    private location: Location
  ) {}

  ngOnInit(): void {
    if (this.treeData == null)
    {
      // if it's not already injected, then get it from the url query
      this.treeData = new GraphTab("test", this.graphService);

      this.route.params.subscribe(params => {
         this.graphService.getFullDocByType(params['id'])
          .subscribe(standardMap => {
            this.standardMap = standardMap;
            this.treeData.nodes = standardMap.children;
          });
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

 //save(): void {
 //   this.standardMapService.updateStandardMap(this.standardMap)
 //     .subscribe(() => this.goBack());
 // }
}
