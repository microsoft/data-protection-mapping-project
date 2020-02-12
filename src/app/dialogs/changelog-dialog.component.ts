import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { GraphService } from '../graph.service';

@Component({
	selector: 'changelog-dialog',
  templateUrl: './changelog-dialog.component.html',
  styleUrls: ['./changelog-dialog.component.css']
})
export class ChangeLogDialogComponent {
  displayedColumns: string[] = ['date', 'author', 'change'];
  dataSource = null;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public graphService: GraphService) {
  }

  ngOnInit() {
    this.graphService.getChangeLog().subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.sort.active = 'date';
      this.sort.direction = 'desc';
      this.dataSource.sort = this.sort;
    });
  }
}
