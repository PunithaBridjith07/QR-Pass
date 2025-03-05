import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSideEventDetailsComponent } from './admin-side-event-details.component';

describe('AdminSideEventDetailsComponent', () => {
  let component: AdminSideEventDetailsComponent;
  let fixture: ComponentFixture<AdminSideEventDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSideEventDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminSideEventDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
