import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { forkJoin, mergeMap, of, Subscription, switchMap, throwError } from 'rxjs';
import { DatabaseService } from '../../../services/database.service';
import { EventData, Seat } from '../organize-event/organize-event.model';
import { CurrencyPipe, DatePipe, PercentPipe, UpperCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid'
import { Booking, BookingPayment } from './booking.model';


@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [ReactiveFormsModule, UpperCasePipe, DatePipe, CurrencyPipe, PercentPipe],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css'
})
export class BookingComponent implements OnInit {

  //Injections
  readonly dbService = inject(DatabaseService)
  readonly router = inject(Router)
  readonly destroyRef = inject(DestroyRef)

  //  Properties
  private subscription!: Subscription
  protected eventProofForm!: FormGroup

  protected userId = input.required<string>()
  protected seats = input.required<string>()

  protected isBookingSuccessful = signal<boolean>(false)
  readonly eventId = signal<string>('')
  protected seatNames = signal<string[]>([])

  protected selectedEventDetail = signal<EventData | null>(null)
  protected eventSeatDetail = signal<Seat | null>(null)
  protected totalAmount = signal<number>(0)
  protected originalAmount = signal<number>(0)
  protected bookedCount = signal<number>(0)

  //  LifeCycle Hooks
  constructor(readonly fb: FormBuilder) {
    this.eventProofForm = this.fb.group({
      aadhar: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]] // Ensures 12-digit Aadhar number
    });
  }

  ngOnInit() {
    this.setEventIdOfSeatsSelected()
    this.getEventDetailById(this.eventId())
  }

  //  Private Methods
  private setEventIdOfSeatsSelected() {
    this.seatNames.set(this.seats().split('+').slice(0, this.seatNames.length - 1))
    const bookingParams = this.seats().split('+')
    this.eventId.set(`event_2_${bookingParams[bookingParams.length - 1]}`)
    this.getSeatDetail(this.eventId().split('_2_')[1])
  }

  private setTotalAmount(perSeatAmount: number, noOfSeats: number, offerApplicable: number, offerPercent: number) {
    this.subscription = this.dbService.getBookingCount(this.userId()).subscribe({
      next: (response) => {

        this.originalAmount.set(perSeatAmount * noOfSeats);
        if (response.rows.length > 0) {
          this.bookedCount.set(response.rows[0].value);

          if (this.bookedCount() >= offerApplicable) {
            this.totalAmount.set(this.originalAmount())
            const offerAmount = this.originalAmount() / offerPercent
            this.totalAmount.set(this.totalAmount() - offerAmount)
          }

        }
        this.totalAmount.set(this.originalAmount())
      },
      complete: () => this.subscription.unsubscribe()
    })
  }

  //  Protected Methods
  protected onBookEvent() {
    if (this.eventProofForm.invalid) {
      console.error("Invalid Event Proof Form");
      return;
    }

    const bookingId = `booking_2_${uuidv4()}`;
    const userId = this.userId()?.split("_2_")[1];
    const eventId = this.eventId()?.split("_2_")[1];

    if (!userId || !eventId) {
      console.error("User ID or Event ID is missing");
      return;
    }

    const bookingData: Booking = {
      _id: bookingId,
      data: {
        user: userId,
        event: eventId,
        bookedseats: this.seatNames()?.join(",") || "",
        totalamount: this.totalAmount() || 0,
        userproof: this.eventProofForm.value.aadhar || "",
        bookedat: new Date().toISOString(),
        checkedinat: "",
        type: "booking",
      },
    };

    this.subscription = this.dbService.createBooking(bookingData).pipe(
      mergeMap((response) => {
        if (!response.ok) throw new Error("Booking creation failed");
        console.log(this.userId());
        
        return forkJoin({
          eventResponse: this.dbService.getEventById(this.eventId()),
          userResponse: this.dbService.getUserById(this.userId())
        });
      }),
      mergeMap(({ eventResponse, userResponse }) => {
        if (!eventResponse?.rows?.length) return throwError(() => new Error("Event not found"));
        if (!userResponse?.rows?.length) return throwError(() => new Error("User not found"));

        const event = eventResponse.rows[0].value;
        const userData = userResponse.rows[0].value;
        console.log(event);
        console.log(userData);
        

        const updatedEventData = {
          ...event,
          data: {
            ...event.data,
            seats: Math.max(0, event.data.seats - this.seatNames().length),
          },
        };

        const bookedSeats = this.seatNames().reduce((seats, seat) => {
          seats[seat] = "sold";
          return seats;
        }, {} as Record<string, string>);

        const updatedSeatData = {
          _id: this.eventSeatDetail()?._id,
          _rev: this.eventSeatDetail()?._rev,
          data: {
            ...this.eventSeatDetail()?.data,
            seats: {
              ...this.eventSeatDetail()?.data?.seats,
              ...bookedSeats,
            },
          },
        };

        const bookingPaymentData: BookingPayment = {
          _id: `payment_2_${uuidv4()}`,
          data: {
            user: userId,
            booking: bookingId.split("_2_")[1],
            paid: this.totalAmount() || 0,
            datetime: new Date().toISOString(),
            type: "bookingpayment",
          },
        };

        const mailData = {
          to: userData.data.email,
          bookingId: bookingData._id.split("_2_")[1],
          outputFormat: "jpeg",
          eventName: this.selectedEventDetail()?.data.eventname ?? "",
          locationUrl: this.selectedEventDetail()?.data.locationviamap ?? "",
          totalAmount: this.totalAmount() || 0,
        };

        console.log(mailData);


        return forkJoin({
          updatedEvent: this.dbService.updateEvent(this.eventId(), updatedEventData),
          updatedSeat: this.dbService.updateSeatDetail(this.eventSeatDetail()?._id!, updatedSeatData),
          paymentResponse: this.dbService.addPaymentDetail(bookingPaymentData),
          mailResponse: this.dbService.onBookEvent(mailData),
        });
      })
    ).subscribe({
      next: (response) => {
        if (!response.mailResponse.messageId) {
          console.error("Booking process failed");
          return;
        }

        setTimeout(() => {
          this.isBookingSuccessful.set(true);
          setTimeout(() => {
            this.isBookingSuccessful.set(false);
            this.router.navigate(["/", this.userId(), "booked"]);
          }, 3000);
        }, 50);
      },
      error: (err) => console.error("Error processing booking:", err.message),
      complete: () => {
        this.destroyRef.onDestroy(() => this.subscription.unsubscribe());
      },
    });
  }



  protected getEventDetailById(eventId: string) {
    this.subscription = this.dbService.getEventById(eventId).subscribe({
      next: (response: any) => {
        if (response.rows?.length > 0) {
          this.selectedEventDetail.set(response.rows[0].value);

          this.setTotalAmount(response.rows[0].value.data.price, this.seatNames().length, response.rows[0].value.data.offerapplicable, response.rows[0].value.data.offerpercent);
        } else {
          console.warn("No event found for ID:", eventId);
        }
      },
      error: (error) => console.error("Selected Event Detail not Fetched:", error.message),
      complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
    });
  }

  protected getSeatDetail(eventId: string) {
    this.subscription = this.dbService.getSeatDetailbyEventId(eventId).subscribe({
      next: (response) => {

        response ? this.eventSeatDetail.set(response) : this.eventSeatDetail.set(null)
      },
      complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
    })
  }

  protected onNavigateBack() {
    this.router.navigate(['/', this.userId(), 'event', this.eventId()])
  }
}
