import { Component, OnInit, Input } from '@angular/core';
import { GraphService } from '../graph.service';

@Component({
	selector: 'errors-dialog',
	templateUrl: './errors-dialog.component.html'
})
export class ErrorsDialogComponent {
  
	constructor(
    public graphService: GraphService)
  { }

}
