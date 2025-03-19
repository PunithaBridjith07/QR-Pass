import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, map, Subscription, switchMap } from 'rxjs';
import { DatabaseService } from '../../../services/database.service';
import { EventData, Seat } from '../organize-event/organize-event.model';
import { CommonModule, CurrencyPipe, DatePipe, PercentPipe, TitleCasePipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CurrencyPipe, DatePipe, UpperCasePipe, TitleCasePipe, PercentPipe],
  templateUrl: './event.component.html',
  styleUrl: './event.component.css'
})
export class EventComponent implements OnInit {

  //  Properties
  protected userId = input.required<string>()
  protected eventId = input.required<string>()

  private subscription!: Subscription
  // protected seatSelectionForm!: FormGroup

  protected event = signal<EventData | null>(null)
  protected eventSeat = signal<Seat | null>(null)
  protected manageSeats = signal<(`s${number}`)[]>([])
  protected isSeatSelectionOpen = signal<boolean>(false)
  protected selectedSeats = signal<string[]>([])

  //  LifeCycle Hooks
  // constructor() { }

  ngOnInit() {
    this.getEventDetail(this.eventId())
    this.getSeatNames()
  }

  //  Injections
  readonly dbService = inject(DatabaseService)

  readonly router = inject(Router)
  readonly destroyRef = inject(DestroyRef)

  //  Getter & Setter

  //  DOM Trigger Methods
  protected onNavigateAllEvent() {
    this.router.navigate(['/', this.userId(), 'all-event'])
  }

  triggerCancel() {
    this.isSeatSelectionOpen.set(false)
  }

  protected onShowSeatSelection() {
    this.isSeatSelectionOpen.set(true)

  }

  private getSeatNames() {
    const seats = this.eventSeat()?.data?.seats;

    if (!seats || typeof seats !== 'object') {
      this.manageSeats.set([]);
    }

    this.manageSeats.set(Object.keys(this.eventSeat()?.data?.seats || {}) as (`s${number}`)[]);

  }

  protected onSelectSeat(seatName: string) {
    if (!this.selectedSeats().includes(seatName) && this.selectedSeats().length <= 10) {
      this.selectedSeats.set([...this.selectedSeats(), seatName])
    } else {
      const index = this.selectedSeats().findIndex((seat) => seat === seatName)
      this.selectedSeats().splice(index, 1)
    }
  }

  protected onHandleSeatSelection() {
    this.router.navigate(['/', this.userId(), 'event', 'booking', `${this.selectedSeats().join('+')}+${this.eventId().split('_2_')[1]}`])
  }

  //  GetEventDetail Method
  protected getEventDetail(eventId: string) {
    this.subscription = this.dbService.getEventById(eventId).pipe(
      map((response: any) => {

        if (response.rows.length > 0) {
          this.event.set(response.rows[0].value)
        }
        return eventId.split('_2_')[1]
      }),
      switchMap((seatsEventId) => this.dbService.getSeatDetailbyEventId(seatsEventId).pipe(
        catchError(() => { throw new Error("Event Detail Not Fetched") })
      ))
    ).subscribe({
      next: (seats) => {
        this.eventSeat.set(seats)
        this.getSeatNames()
      },
      complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
    })
  }

}
