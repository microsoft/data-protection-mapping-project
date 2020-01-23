import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AboutDialogComponent } from './dialogs/about-dialog.component';
import { ChangeLogDialogComponent } from './dialogs/changelog-dialog.component';
import { ContributeDialogComponent } from './dialogs/contribute-dialog.component';
import { CreditsDialogComponent } from './dialogs/credits-dialog.component';
import { DisclaimerDialogComponent } from './dialogs/disclaimer-dialog.component';
import { DownloadDialogComponent } from './dialogs/download-dialog.component';
import { HowToDialogComponent } from './dialogs/howto-dialog.component';
import { PurchaseDialogComponent } from './dialogs/purchase-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	title = 'Standard Maps';

	constructor(public dialog: MatDialog) { }

	ngOnInit() {
        // show disclaimer by default
		this.openDialog(null, 'disclaimer');
	}

	openDialog(sideNav: any, dialog: string) {
		//sideNav.close();

		var dialogType = null;
		switch (dialog) {
			case 'about': dialogType = AboutDialogComponent; break;
			case 'changelog': dialogType = ChangeLogDialogComponent; break;
			case 'contribute': dialogType = ContributeDialogComponent; break;
			case 'credits': dialogType = CreditsDialogComponent; break;
			case 'disclaimer': dialogType = DisclaimerDialogComponent; break;
			case 'download': dialogType = DownloadDialogComponent; break;
			case 'howto': dialogType = HowToDialogComponent; break;
			case 'purchase': dialogType = PurchaseDialogComponent; break;
		}

		if (dialogType) {
			const dialogRef = this.dialog.open(dialogType);

			dialogRef.afterClosed().subscribe(result => {
				console.log(`Dialog result: ${result}`);
			});
		}
	}
}
