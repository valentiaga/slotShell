import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpViewerComponent } from './ip-viewer.component';

describe('IpViewerComponent', () => {
  let component: IpViewerComponent;
  let fixture: ComponentFixture<IpViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpViewerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IpViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
