import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSideOffersComponent } from './subscription-offers.component';

describe('AdminSideOffersComponent', () => {
  let component: AdminSideOffersComponent;
  let fixture: ComponentFixture<AdminSideOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSideOffersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminSideOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
