import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent }   from './dashboard/dashboard.component';
import { StandardMapsComponent }      from './standard-maps/standard-maps.component';
import { StandardMapDetailComponent }  from './standard-map-detail/standard-map-detail.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'doctypes/:id', component: StandardMapDetailComponent },
  { path: 'standard-map', component: StandardMapsComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { useHash:true }) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
