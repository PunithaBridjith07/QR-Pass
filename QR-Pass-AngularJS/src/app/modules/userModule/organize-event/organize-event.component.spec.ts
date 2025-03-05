import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganizeEventComponent } from './organize-event.component';


describe('EventComponent', () => {
  let component: OrganizeEventComponent;
  let fixture: ComponentFixture<OrganizeEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizeEventComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrganizeEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
