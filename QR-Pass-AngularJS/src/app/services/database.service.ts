import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { Booking } from '../modules/userModule/booking/booking.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  //  Configure Properties
  readonly baseURL = "https://192.168.57.185:5984/qrpass"
  readonly username = "d_couchdb";
  readonly password = "Welcome#2";
  readonly headers = new HttpHeaders({
    "Authorization": 'Basic ' + btoa(this.username + ":" + this.password),
    "Content-type": "application/json"
  })

  constructor(readonly http: HttpClient) { }

  //  User CRUD

  getUserById(_id: string) {
    const URL = `${this.baseURL}/_design/Views/_view/userbyid?key="${_id}"`;
    return this.http.get<any>(URL, { headers: this.headers })
  }

  //  Event CRUD
  getEventDetail() {
    const URL = `${this.baseURL}/_design/Views/_view/eventbyid`;

    return this.http.get<any>(URL, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }

  getEventById(_id: string) {
    const URL = `${this.baseURL}/_design/Views/_view/eventbyid?key="${_id}"`
    return this.http.get<any>(URL, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }

  createEvent(data: any) {
    const URL = `${this.baseURL}`;
    return this.http.post<any>(URL, data, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }

  updateEvent(eventId: string, data: any) {
    const URL = `${this.baseURL}/${eventId}`;
    return this.http.put<any>(URL, data, { headers: this.headers })
  }

  //  Organized Event CRUD
  getOrganizedEventDetail(organizedId: string) {
    const URL = `${this.baseURL}/_design/Views/_view/eventbyorganizedid?key="${organizedId}"`;
    return this.http.get<any>(URL, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }

  createOrganizedEvent(data: any) {
    const URL = `${this.baseURL}`;
    return this.http.post<any>(URL, data, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }

  updateOrganizedEvent(_id: string, data: Event) {
    const URL = `${this.baseURL}/${_id}`;
    return this.http.put<any>(URL, data, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }

  //  Seat CRUD
  getSeatDetailbyEventId(eventId: string): Observable<any> {
    const URL = `${this.baseURL}/_design/Views/_view/seatsbyeventid?key="${eventId}"`
    return this.http.get<any>(URL, { headers: this.headers }).pipe(
      map((response: any) => (response.rows.length > 0 ? response.rows[0].value : null)),
      catchError((error) => throwError(() => new Error(error)))
    )
  }

  createEventSeatDetail(data: any) {
    const URL = `${this.baseURL}`;
    return this.http.post<any>(URL, data, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }

  updateSeatDetail(_id: string, data: any) {
    const URL = `${this.baseURL}/${_id}`
    return this.http.put<any>(URL, data, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }

  //  Booking CRUD
  getBookingCount(userId: string) {
    const URL = `${this.baseURL}/_design/Views/_view/bookedcountbyuserid?key="${userId}"&reduce=true`
    return this.http.get<any>(URL, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }

  getBookingByUserId(userId: string): Observable<any> {
    const URL = `${this.baseURL}/_design/Views/_view/bookingbyuserid?key="${userId}"`
    return this.http.get<any>(URL, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }

  getBookingById(_id: string) {
    const URL = `${this.baseURL}/_design/Views/_view/bookingbyid?key="${_id}"`
    return this.http.get<any>(URL, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }

  createBooking(data: Booking): Observable<any> {
    const URL = `${this.baseURL}`;
    return this.http.post<any>(URL, data, { headers: this.headers }).pipe(
      catchError((error) => {
        return throwError(() => new Error("Failed to create booking. Please try again.", error));
      })
    );
  }

  updateBooking(_id: string, data: Booking) {
    const URL = `${this.baseURL}/${_id}`;
    return this.http.put<any>(URL, data, { headers: this.headers }).pipe(
      catchError((error) => {
        return throwError(() => new Error("Failed to update check-in. Please try again.", error));
      })
    );
  }

  //  Scanner CRUD
  getCheckedInBooking() {
    const URL = `${this.baseURL}/_design/Views/_view/bookingbycheckedin`
    return this.http.get<any>(URL, { headers: this.headers }).pipe(
      catchError((error) => {
        return throwError(() => new Error("Failed to fetch checked-In Booking. Please try again.", error));
      })
    );
  }

  //  Subscription Plan CRUD
  getSubscriptionPlan(_id?: string) {
    if (_id) {
      const URL = `${this.baseURL}/_design/Views/_view/subscriptionplanbyid?key="${_id}"`;
      return this.http.get<any>(URL, { headers: this.headers });
    }
    const URL = `${this.baseURL}/_design/Views/_view/subscriptionplanbyid`;
    return this.http.get<any>(URL, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }

  createSubscriptionPlan(data: any) {
    const URL = `${this.baseURL}`;
    return this.http.post<any>(URL, data, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }

  updateSubscriptionPlan(_id: string, data: any) {
    const URL = `${this.baseURL}/${_id}`;
    return this.http.put<any>(URL, data, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }

  //  Subscription Offer CRUD
  getSubscriptionOffer(_id?: string) {
    if (_id) {
      const URL = `${this.baseURL}/_design/Views/_view/subscriptionofferbyid?key="${_id}"`;
      return this.http.get<any>(URL, { headers: this.headers }).pipe(
        catchError((error) => error)
      );
    } else {
      const URL = `${this.baseURL}/_design/Views/_view/subscriptionofferbyid`;
      return this.http.get<any>(URL, { headers: this.headers }).pipe(
        catchError((error) => error)
      );
    }
  }

  createSubscriptionOffer(data: any) {
    const URL = `${this.baseURL}`;
    return this.http.post<any>(URL, data, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }

  updateSubscriptionOffer(_id: string, data: any) {
    const URL = `${this.baseURL}/${_id}`;
    return this.http.put<any>(URL, data, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }

  //  Subscribed Details CRUD
  getSubscribedDetail(status: string) {
    let URL = `${this.baseURL}/_design/Views/_view/subscribeddetailsbystatus?key="${status}"`;
    return this.http.get<any>(URL, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }

  addSubscribedDetail(data: any) {
    const URL = `${this.baseURL}`;
    return this.http.post<any>(URL, data, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }

  updateSubscribedDetail(_id: string, data: any) {
    const URL = `${this.baseURL}/${_id}`;
    return this.http.put<any>(URL, data, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }

  //  Payment CRUD
  getPaymentDetailByType(type?: string, reduce?: string) {
    let URL = `${this.baseURL}/_design/Views/_view/paymentsbytype`;
    if (type) {
      URL += `?key="${type}"`;
    }
    if (reduce === 'true') {
      URL += type ? `&reduce=true` : `?reduce=true`;
    }
    return this.http.get<any>(URL, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }

  addPaymentDetail(data: any) {
    const URL = `${this.baseURL}`;
    return this.http.post<any>(URL, data, { headers: this.headers }).pipe(
      catchError((error) => error)
    );
  }




  readonly nodeJsBaseURL = 'http://localhost:8000'

  //  Subscription Confirmation Via NodeJS
  onPaySubscription(data: any) {
    const URL = `${this.nodeJsBaseURL}/send-subscribed-email`
    return this.http.post<any>(URL, data).pipe(
      catchError((error) => error)
    );
  }

  //  Save image to Separate Folder Via NodeJs
  onStoreEventImage(userId: string, eventId: string, imageData: FormData) {
    const URL = `${this.nodeJsBaseURL}/event-image/${userId}/${eventId}`;
    return this.http.post<any>(URL, imageData).pipe(
      catchError((error) => error)
    );
  }

  //  Send QR code to Email Via NodeJS
  onBookEvent(data: any) {
    console.log(data);
    const URL = `${this.nodeJsBaseURL}/generate-qr`
    return this.http.post<any>(URL, data).pipe(
      catchError((error) => error)
    );
  }

  //  Download PDF
  onDownloadPdf(data: any) {
    
    const URL = `${this.nodeJsBaseURL}/download-ticket`;

    return this.http.post(URL, data, {
      responseType: 'blob' // Important for binary data
    });
  }


  // //  Send Booking Payment Confirmation Via NodeJS
  // onPayEventBooking(data: any) {
  //   const URL = `${this.nodeJsBaseURL}/send-booking-email`
  //   return this.http.post<any>(URL, data).pipe(
  //     catchError((error) => error)
  //   );
  // }
}
