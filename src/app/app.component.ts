import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { GraphService } from './graph.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'Data Protection Mapping Project';

	@ViewChild('sidenav') public sidenav: any;

	constructor(public graphService: GraphService) {
	}

	ngAfterViewInit() {
    // If they've never dismissed the declaimer
    if (this.graphService.showDisclaimer) {
      // Show the menu first
			this.sidenav.open();

			// Then show the disclaimer on top
			this.graphService.openDialog(null, 'disclaimer');
		}
	}

  closeSidenav() {
    this.sidenav.close();
  }
}
