import { Component, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { DialogsService } from './dialogs.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  title = 'Data Protection Mapping Project';
  static globalApp;

	@ViewChild('sidenav') public sidenav: any;

  constructor(public dialogsService: DialogsService) {
    AppComponent.globalApp = this;
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

    document.addEventListener('keydown', this.keyDown);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.keyDown);
  }

  closeSidenav() {
    this.sidenav.close();
  }

  public keyDown(event) {
    if (event.code == 'Escape') {
      AppComponent.globalApp.closeSidenav();
    }
  }

}
