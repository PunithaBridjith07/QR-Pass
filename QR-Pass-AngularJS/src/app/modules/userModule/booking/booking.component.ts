import { Component, inject, input, OnInit, signal } from '@angular/core';
import { map, Subscription } from 'rxjs';
import { DatabaseService } from '../../../services/database.service';
import { Event } from '../organize-event/organize-event.model';
import { DatePipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [UpperCasePipe, DatePipe],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css'
})
export class BookingComponent implements OnInit {

  //  Properties
  private subscription!: Subscription
  protected seats = input.required<string>()

  private eventId = signal<string>('')
  protected seatNames = signal<string[]>([])
  protected selectedEventDetail = signal<Event | null>(null)
  protected totalAmount = signal<number>(0)
  protected originalAmount = signal<number>(0)

  //Injections
  readonly dbService = inject(DatabaseService)

  //  LifeCycle Hooks
  constructor() { }

  ngOnInit() {
    this.setEventIdOfSeatsSelected()
    this.getEventDetailById(this.eventId())
    console.log(this.seats());
    console.log(this.seatNames());
    console.log(this.eventId());

  }

  //  Private Methods
  private setEventIdOfSeatsSelected() {
    this.seatNames.set(this.seats().split('+').slice(0, this.seatNames.length - 1))
    const eventId = this.seats().split('+')
    this.eventId.set(`event_2_${eventId[eventId.length - 1]}`)
  }

  private setTotalAmount(originalAmount: number, offerPercent: number) { }

  //  Protected Methods
  protected getEventDetailById(eventId: string) {
    this.subscription = this.dbService.getEventDetail(eventId).pipe(
      map((response: any) => { if (response.rows.length > 0) { return response.rows[0].value } }),
    ).subscribe({
      next: (event: Event) => this.selectedEventDetail.set(event),
      error: (error) => console.error("Selected Event Detail not Fetched"),
      complete: () => {
        console.log(this.selectedEventDetail())
        this.subscription.unsubscribe()
      }
    })
  }

}
