import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSidePricingComponent } from './subscription-plan.component';

describe('AdminSidePricingComponent', () => {
  let component: AdminSidePricingComponent;
  let fixture: ComponentFixture<AdminSidePricingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSidePricingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminSidePricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
