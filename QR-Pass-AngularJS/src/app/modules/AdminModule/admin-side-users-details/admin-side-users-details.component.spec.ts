import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSideUsersDetailsComponent } from './admin-side-users-details.component';

describe('AdminSideUsersDetailsComponent', () => {
  let component: AdminSideUsersDetailsComponent;
  let fixture: ComponentFixture<AdminSideUsersDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSideUsersDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminSideUsersDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
