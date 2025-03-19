import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';
import { forkJoin, map, of, Subscription, switchMap } from 'rxjs';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { EventData } from '../organize-event/organize-event.model';
import { BookedTicketData, Ticket } from '../booking/booking.model';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-booked',
  standalone: true,
  imports: [DatePipe, UpperCasePipe],
  templateUrl: './booked.component.html',
  styleUrl: './booked.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookedComponent implements OnInit {

  //  Injections
  protected subscription!: Subscription;

  readonly http = inject(HttpClient);
  readonly destroyRef = inject(DestroyRef);

  //  Properties
  protected readonly userId = input.required<string>();

  protected tickets = signal<Ticket[]>([]);

  //  LifeCycle Hooks
  constructor(readonly dbService: DatabaseService) { }

  ngOnInit() {
    this.getBookedEventById(this.userId().split('_2_')[1]);

  }

  //  Get Booked Event Detail according to event time(upto another 2 hrs)
  protected getBookedEventById(userId: string) {
    this.subscription = this.dbService.getBookingByUserId(userId).pipe(
      map((response: any) => {
        return response.rows.map((row: any) => ({
          bookingId: row.value._id.split('_2_')[1],  // Extracting bookingId
          eventId: row.value.data.event,
          seats: row.value.data.bookedseats.toUpperCase(),  // Extracting seats
          eventProof: row.value.data.userproof,
          totalAmount: row.value.data.totalamount  // Extracting totalAmount
        })) || [];
      }),
      switchMap((bookings: BookedTicketData[]) => {
        if (bookings.length === 0) return of([]); // Return an Observable of empty array

        const bookedEventRequests = bookings.map((booking: BookedTicketData) =>
          this.dbService.getEventById(`event_2_${booking.eventId}`).pipe(
            map((response) => {

              return response.rows.map((row: any) => ({
                bookingId: booking.bookingId,
                eventName: row.value.data.eventname,
                artist: row.value.data.artist,
                seats: booking.seats,
                eventProof: booking.eventProof,
                date: row.value.data.date,
                time: row.value.data.time,
                totalAmount: booking.totalAmount,
                venue: row.value.data.venue,
                district: row.value.data.district,
                state: row.value.data.state,
                locationUrl: row.value.data.locationviamap,
                imageUrl: row.value.data.imageurl
              }));
            })
          )
        );

        return forkJoin(bookedEventRequests);
      })
    ).subscribe({
      next: (events: Ticket[]) => {
        this.tickets.set(events.flat()); // Flatten and set the events
        console.log(this.tickets());
      },
      complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
    });
  }


  protected onDownloadPdf(ticketDetail: { bookingId: string, eventName: string, seats: string, eventProof: string, date: string, time: string, totalAmount: number, locationUrl: string }) {
    const currentDate = new Date(ticketDetail.date)
    const formatDate = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear()}`;
    const currentTime = new Date(ticketDetail.time)
    const formatTime = currentTime.toLocaleTimeString('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: 'Asia/Kolkata' })

    const bookingDetail = { bookingId: ticketDetail.bookingId, eventName: ticketDetail.eventName, seats: ticketDetail.seats, eventProof: ticketDetail.eventProof, date: formatDate, time: formatTime, totalAmount: ticketDetail.totalAmount, locationUrl: ticketDetail.locationUrl }

    this.subscription = this.dbService.onDownloadPdf(bookingDetail).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/pdf' }); // Ensure correct MIME type
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${bookingDetail.bookingId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading PDF:', error);
      }
    }
    );

  }

}
