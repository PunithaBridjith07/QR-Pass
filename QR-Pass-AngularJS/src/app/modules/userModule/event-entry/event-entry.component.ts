import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { map, of, Subscription, switchMap } from 'rxjs';
import { DatabaseService } from '../../../services/database.service';
import { Booking } from '../booking/booking.model';
import { TitleCasePipe, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-event-entry',
  standalone: true,
  imports: [ZXingScannerModule, UpperCasePipe],
  templateUrl: './event-entry.component.html',
  styleUrl: './event-entry.component.css'
})
export class EventEntryComponent implements OnInit, AfterViewInit {

  //LifeCycle Hooks
  constructor(readonly dbService: DatabaseService) { }

  ngOnInit(): void {
    this.getAllCheckedInTicket()
  }

  ngAfterViewInit() {
    if (this.scanner) {
      this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
        console.log('Available Cameras:', devices);
      });
    } else {
      console.error("Scanner component is not initialized yet.");
    }
  }

  //  Allowed Format Of Scanner
  protected allowedFormat = [BarcodeFormat.QR_CODE]

  //  Properties
  @ViewChild('scanner', { static: false }) scanner!: ZXingScannerComponent

  private subscription!: Subscription

  protected checkedInBooking = signal<Booking[]>([])
  protected scannedTicket = signal<string>('')

  //  Injections
  readonly http = inject(HttpClient)
  readonly router = inject(Router)
  readonly destroyRef = inject(DestroyRef)

  //Handle Scanner
  protected onScanQR(scanResult: string) {
    const result: string[] = scanResult.split('/')
    this.scannedTicket.set(result[result.length - 1])
    console.log(this.scannedTicket());
    this.subscription = this.dbService.getBookingById(`booking_2_${this.scannedTicket()}`).pipe(
      map((response) => {
        const existBooking = response.rows.length > 0 ? response.rows[0].value : null
        return existBooking
      }),
      switchMap((existBooking) => {
        if (existBooking.data.checkedinat === "") {
          const updatedData: Booking = {
            ...existBooking,
            data: {
              ...existBooking.data,
              checkedinat: new Date()
            }
          }
          this.scanner.scanStop()

          return this.dbService.updateBooking(`booking_2_${this.scannedTicket()}`, updatedData).pipe(
            map((response) => {
              if (response.ok) {
                this.getAllCheckedInTicket()
              }
              return response.ok && { checkedin: true }
            })
          )
        }
        return of({ checkedin: false })
      })
    ).subscribe({
      next: (ticketChecked) => {
        if (ticketChecked.checkedin) {
          this.router.navigate(['/', 'ticket', this.scannedTicket()])
        } else {
          alert("Ticket Expired")
        }
      },
      error: (error) => console.error("Problem on check-in", error),
      complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
    })
  }

  protected onRedirectTicket() {
    // this.router.navigate(['/', 'ticket', this.scanedTicket()])
  }

  //  Get All Checked-In Ticket
  protected getAllCheckedInTicket() {
    this.subscription = this.dbService.getCheckedInBooking().subscribe({
      next: (response) => {
        console.log(response.rows.map((row: any) => row.value));
        response.rows.length > 0 ? this.checkedInBooking.set(response.rows.map((row: any) => row.value)) : this.checkedInBooking.set([])
      },
      error: (error) => {
        console.error("Failed to fetch checked-In Data ", error);
      },
      complete: () => this.destroyRef.onDestroy(() => this.subscription.unsubscribe())
    })
  }

}
