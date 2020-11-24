import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';

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
import { ErrorsDialogComponent }    from './dialogs/errors-dialog.component';
import { CharterContentComponent }    from './dialogs/charter-content.component';
import { MessagesComponent }    from './messages/messages.component';
import { GraphComponent }      from './graph/graph.component';
import { TreeModule } from 'angular-tree-component';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';

import { PortalModule } from '@angular/cdk/portal';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { injectHighlightBodyPipe, injectHighlightSectionPipe, getCommentTextPipe } from './pipes/HighlightPipe';
import { getNodeColorPipe, getNodeIconPipe, getNodeIconAltPipe, getBodyPipe, getSectionPipe, getConnectionsTextPipe } from './pipes/NodePipe';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,

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
    PortalModule,
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
    ErrorsDialogComponent,
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
    ErrorsDialogComponent,
    MessagesComponent,
    StandardMapSearchComponent,
    GraphComponent,
    CharterContentComponent,

    injectHighlightBodyPipe,
    injectHighlightSectionPipe,
    getCommentTextPipe,
    getNodeColorPipe,
    getNodeIconPipe,
    getNodeIconAltPipe,
    getBodyPipe,
    getSectionPipe,
    getConnectionsTextPipe
  ],
  providers: [ CookieService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
