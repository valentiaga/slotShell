import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteButtonCellRendererComponent } from './delete-button-cell-renderer.component';

describe('DeleteButtonCellRendererComponent', () => {
  let component: DeleteButtonCellRendererComponent;
  let fixture: ComponentFixture<DeleteButtonCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteButtonCellRendererComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeleteButtonCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
