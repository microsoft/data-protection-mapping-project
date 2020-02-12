import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { StandardMapSearchComponent } from '../standard-map-search/standard-map-search.component';

import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { StandardMapService } from '../standard-map.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let standardMapService;

  beforeEach(async(() => {
    standardMapService = jasmine.createSpyObj('StandardMapService', ['getStandardMaps']);
    TestBed.configureTestingModule({
      declarations: [
        DashboardComponent,
        StandardMapSearchComponent
      ],
      imports: [
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: StandardMapService, useValue: standardMapService }
      ]
    })
    .compileComponents();

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display "Top Standard Maps" as headline', () => {
    expect(fixture.nativeElement.querySelector('h3').textContent).toEqual('Top Standard Maps');
  });

  it('should display 4 links', async(() => {
    expect(fixture.nativeElement.querySelectorAll('a').length).toEqual(4);
  }));

});
