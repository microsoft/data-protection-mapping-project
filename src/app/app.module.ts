import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';

import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService }  from './in-memory-data.service';
import { CookieService } from 'ngx-cookie-service';

import { AppRoutingModule }     from './app-routing.module';

import { AppComponent }         from './app.component';
import { DashboardComponent }   from './dashboard/dashboard.component';
import { StandardMapDetailComponent }  from './standard-map-detail/standard-map-detail.component';
import { StandardMapsComponent }      from './standard-maps/standard-maps.component';
import { StandardMapSearchComponent }  from './standard-map-search/standard-map-search.component';
import { AboutDialogComponent }    from './dialogs/about-dialog.component';
import { ChangeLogDialogComponent }    from './dialogs/changelog-dialog.component';
import { ContributeDialogComponent }    from './dialogs/contribute-dialog.component';
import { CreditsDialogComponent }    from './dialogs/credits-dialog.component';
import { DisclaimerDialogComponent }    from './dialogs/disclaimer-dialog.component';
import { DownloadDialogComponent }    from './dialogs/download-dialog.component';
import { HowToDialogComponent }    from './dialogs/howto-dialog.component';
import { PurchaseDialogComponent }    from './dialogs/purchase-dialog.component';
import { CharterContentComponent }    from './dialogs/charter-content.component';
import { MessagesComponent }    from './messages/messages.component';
import { D3TestComponent }      from './d3-test/d3-test.component';
import { TreeModule } from 'angular-tree-component';

import {
  MatAutocompleteModule,
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTreeModule,
} from '@angular/material';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,

    //// The HttpClientInMemoryWebApiModule module intercepts HTTP requests
    //// and returns simulated server responses.
    //// Remove it when a real server is ready to receive requests.
    //HttpClientInMemoryWebApiModule.forRoot(
    //  InMemoryDataService, { dataEncapsulation: false }
    //),
    TreeModule.forRoot(),
    
    // Material modules
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    BrowserAnimationsModule,
    FlexLayoutModule
  ],
  entryComponents: [
	AboutDialogComponent,
    ChangeLogDialogComponent,
    ContributeDialogComponent,
    CreditsDialogComponent,
    DisclaimerDialogComponent,
    DownloadDialogComponent,
    HowToDialogComponent,
    PurchaseDialogComponent,
    CharterContentComponent
  ],
  declarations: [
    AppComponent,
    DashboardComponent,
    StandardMapsComponent,
    StandardMapDetailComponent,
	AboutDialogComponent,
    ChangeLogDialogComponent,
    ContributeDialogComponent,
    CreditsDialogComponent,
    DisclaimerDialogComponent,
    DownloadDialogComponent,
    HowToDialogComponent,
    PurchaseDialogComponent,
    MessagesComponent,
    StandardMapSearchComponent,
    D3TestComponent,
    CharterContentComponent
  ],
  providers: [ CookieService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }