import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IsActiveCellRendererComponent } from './is-active-cell-renderer.component';

describe('IsActiveCellRendererComponent', () => {
  let component: IsActiveCellRendererComponent;
  let fixture: ComponentFixture<IsActiveCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IsActiveCellRendererComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IsActiveCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
