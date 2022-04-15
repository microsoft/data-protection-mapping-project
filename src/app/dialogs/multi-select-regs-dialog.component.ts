import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatList, MatSelectionList } from '@angular/material/list';
import { CategoryList, GraphService } from '../graph.service';

@Component({
  selector: 'multi-select-regs-dialog',
  templateUrl: './multi-select-regs-dialog.component.html',
  styleUrls: ['./multi-select-regs-dialog.component.css']
})
export class MultiSelectRegsDialogComponent {
  dataSource: CategoryList = null;
  @ViewChild(MatSelectionList) regs: MatSelectionList;

  constructor(public graphService: GraphService) {
  }

  ngOnInit() {
    this.graphService.getDocTypes().subscribe(data => {
      let excludeIds = [
        'ISO',
        'All',
        'Multi'
      ];

      this.dataSource = data.filter(f => {
        return !excludeIds.includes(f.id);
      });
    });
  }

  addRegulations() {
    var selection = this.regs.selectedOptions.selected;

    // Add the All tab with a filter and override the title to "Multi"
    this.graphService.addTab('All', selection.map(s => {
      return s.value;
    }), 'Multi');
  }
}
