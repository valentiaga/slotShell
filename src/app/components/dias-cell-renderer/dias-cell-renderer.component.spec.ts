import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiasCellRendererComponent } from './dias-cell-renderer.component';

describe('DiasCellRendererComponent', () => {
  let component: DiasCellRendererComponent;
  let fixture: ComponentFixture<DiasCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiasCellRendererComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DiasCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
