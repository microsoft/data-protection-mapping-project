import { Injectable } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { AboutDialogComponent } from './dialogs/about-dialog.component';
import { ChangeLogDialogComponent } from './dialogs/changelog-dialog.component';
import { ContributeDialogComponent } from './dialogs/contribute-dialog.component';
import { CreditsDialogComponent } from './dialogs/credits-dialog.component';
import { DisclaimerDialogComponent } from './dialogs/disclaimer-dialog.component';
import { DownloadDialogComponent } from './dialogs/download-dialog.component';
import { HowToDialogComponent } from './dialogs/howto-dialog.component';
import { ErrorsDialogComponent } from './dialogs/errors-dialog.component';
import { PurchaseDialogComponent } from './dialogs/purchase-dialog.component';
import { FeedbackDialogComponent } from './dialogs/feedback-dialog.component';

import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class DialogsService {
  private enableCookies = false;

  constructor(
		public dialog: MatDialog,
	  public cookies: CookieService) { }

	public openDialog(dialogId: string) {
		//sideNav.close();

		var dialogType = null;
    switch (dialogId) {
			case 'about': dialogType = AboutDialogComponent; break;
			case 'changelog': dialogType = ChangeLogDialogComponent; break;
			case 'contribute': dialogType = ContributeDialogComponent; break;
			case 'credits': dialogType = CreditsDialogComponent; break;
			case 'disclaimer': dialogType = DisclaimerDialogComponent; break;
			case 'download': dialogType = DownloadDialogComponent; break;
			case 'howto': dialogType = HowToDialogComponent; break;
            case 'purchase': dialogType = PurchaseDialogComponent; break;
            case 'errors': dialogType = ErrorsDialogComponent; break;
            case 'feedback': dialogType = FeedbackDialogComponent; break;
		}

		if (dialogType) {
			const dialogRef = this.dialog.open(dialogType);

			dialogRef.afterClosed().subscribe(result => {
				console.log(`Dialog result: ${result}`);
        if (this.enableCookies && dialogId == 'disclaimer')
					this.cookies.set('dismisseddisclaimer', 'y');
			});
		}
  }

  public get showDisclaimer(): boolean {
    return !this.enableCookies || !this.cookies.get('dismisseddisclaimer');
  }
}
