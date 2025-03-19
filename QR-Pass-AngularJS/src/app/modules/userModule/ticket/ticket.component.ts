import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { Booking } from '../booking/booking.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DatabaseService } from '../../../services/database.service';
import { map, Subscription, switchMap } from 'rxjs';
import { EventData } from '../organize-event/organize-event.model';
import { CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, UpperCasePipe],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.css'
})
export class TicketComponent implements OnInit {

  //  LifeCycle Hooks
  constructor(readonly dbService: DatabaseService) { }

  ngOnInit() {
    console.log(this.bookingId());
    this.getTicket(`booking_2_${this.bookingId()}`)
  }

  //  Injections
  readonly http = inject(HttpClient)
  readonly router = inject(Router)
  readonly destroyRef = inject(DestroyRef)

  //  Properties
  private subscription!: Subscription
  protected bookingId = input.required<string>()

  protected ticket = signal<Booking | null>(null)
  protected event = signal<EventData | null>(null)
  protected totalAmount = signal<number>(0)
  protected originalAmount = signal<number>(0)
  protected bookedCount = signal<number>(0)

  //Get Ticket Detail
  protected getTicket(bookingId: string) {
    this.subscription = this.dbService.getBookingById(bookingId).pipe(
      map((response) => {
        const ticketData = response.rows.length > 0 ? response.rows[0].value : null;
        this.ticket.set(ticketData);
        return ticketData;
      }),
      switchMap((ticketData) => {
        if (!ticketData?.data?.event) {
          throw new Error("Invalid event ID");
        }
        return this.dbService.getEventById(`event_2_${ticketData.data.event}`).pipe(
          map((response) => {

            return response.rows[0].value ?? null
          })
        );
      }),
    ).subscribe({
      next: (event) => {
        event ? this.event.set(event) : this.event.set(null);
      },
      error: (error) => {
        console.error("Failed Fetch Ticket ", error);
      },
      complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
    })
  }

  protected onNavigateEntryBooking() {
    this.router.navigate(['/', `user_2_${this.event()?.data?.user}`, 'entry', `${this.ticket()?.data.event}`])
  }

  // private setTotalAmount(perSeatAmount: number, noOfSeats: number, offerApplicable: number, offerPercent: number) {
  //   this.subscription = this.dbService.getBookingCount(this.userId()).subscribe({
  //     next: (response) => {

  //       this.originalAmount.set(perSeatAmount * noOfSeats);
  //       if (response.rows.length > 0) {
  //         this.bookedCount.set(response.rows[0].value);

  //         if (this.bookedCount() >= offerApplicable) {
  //           this.totalAmount.set(this.originalAmount())
  //           const offerAmount = this.originalAmount() / offerPercent
  //           this.totalAmount.set(this.totalAmount() - offerAmount)
  //         }

  //       }
  //       this.totalAmount.set(this.originalAmount())
  //     },
  //     complete: () => this.subscription.unsubscribe()
  //   })
  // }

}
