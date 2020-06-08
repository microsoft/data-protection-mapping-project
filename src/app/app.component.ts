import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { DialogsService } from './dialogs.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'Data Protection Mapping Project';

	@ViewChild('sidenav') public sidenav: any;

	constructor(public dialogsService: DialogsService) {
	}

  ngAfterViewInit() {
    // We cannot immediately interact with the sidenav during init.
    setTimeout(() => {
      // If they've never dismissed the declaimer
      if (this.dialogsService.showDisclaimer) {
        // Show the menu first
			  this.sidenav.open();

			  // Then show the disclaimer on top
			  this.dialogsService.openDialog('disclaimer');
		  }
    }, 100);
	}

  closeSidenav() {
    this.sidenav.close();
  }
}
