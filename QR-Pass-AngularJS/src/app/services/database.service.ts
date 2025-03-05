import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Seat } from '../modules/userModule/organize-event/organize-event.model';

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
  getEventDetail(_id?: string) {
    if (_id) {
      const URL = `${this.baseURL}/_design/Views/_view/eventbyid?key="${_id}"`;
      return this.http.get<any>(URL, { headers: this.headers })
    } else {
      const URL = `${this.baseURL}/_design/Views/_view/eventbyid`
      return this.http.get<any>(URL, { headers: this.headers })
    }
  }

  createEvent(data: any) {
    const URL = `${this.baseURL}`;
    return this.http.post<any>(URL, data, { headers: this.headers })
  }

  updateEvent(_id: string, data: any) {
    const URL = `${this.baseURL}/${_id}`;
    return this.http.put<any>(URL, data, { headers: this.headers });
  }

  //  Organized Event CRUD
  getOrganizedEventDetail(organizedId?: string) {
    if (organizedId) {
      const URL = `${this.baseURL}/_design/Views/_view/eventbyorganizedid?key="${organizedId}"`;
      return this.http.get<any>(URL, { headers: this.headers })
    } else {
      const URL = `${this.baseURL}/_design/Views/_view/eventbyorganizedid`
      return this.http.get<any>(URL, { headers: this.headers })
    }
  }

  createOrganizedEvent(data: any) {
    const URL = `${this.baseURL}`;
    return this.http.post<any>(URL, data, { headers: this.headers })
  }

  updateOrganizedEvent(_id: string, data: any) {
    const URL = `${this.baseURL}/${_id}`;
    return this.http.put<any>(URL, data, { headers: this.headers });
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
    return this.http.post<any>(URL, data, { headers: this.headers })
  }

  updateSeatDetail(eventId: string, data: any) {
    const URL = `${this.baseURL}/_design/Views/_view/seatbyeventid?key="${eventId}"`
    return this.http.put<any>(URL, data, { headers: this.headers })
  }

  //  Subscription Plan CRUD
  getSubscriptionPlan(_id?: string) {
    if (_id) {
      const URL = `${this.baseURL}/_design/Views/_view/subscriptionplanbyid?key="${_id}"`;
      return this.http.get<any>(URL, { headers: this.headers });
    }
    const URL = `${this.baseURL}/_design/Views/_view/subscriptionplanbyid`;
    return this.http.get<any>(URL, { headers: this.headers });
  }

  createSubscriptionPlan(data: any) {
    const URL = `${this.baseURL}`;
    return this.http.post<any>(URL, data, { headers: this.headers });
  }

  updateSubscriptionPlan(_id: string, data: any) {
    const URL = `${this.baseURL}/${_id}`;
    return this.http.put<any>(URL, data, { headers: this.headers })
  }

  //  Subscription Offer CRUD
  getSubscriptionOffer(_id?: string) {
    if (_id) {
      const URL = `${this.baseURL}/_design/Views/_view/subscriptionofferbyid?key="${_id}"`;
      return this.http.get<any>(URL, { headers: this.headers });
    } else {
      const URL = `${this.baseURL}/_design/Views/_view/subscriptionofferbyid`;
      return this.http.get<any>(URL, { headers: this.headers })
    }
  }

  createSubscriptionOffer(data: any) {
    const URL = `${this.baseURL}`;
    return this.http.post<any>(URL, data, { headers: this.headers })
  }

  updateSubscriptionOffer(_id: string, data: any) {
    const URL = `${this.baseURL}/${_id}`;
    return this.http.put<any>(URL, data, { headers: this.headers })
  }

  //  Subscribed Details CRUD
  getSubscribedDetail(status: string) {
    let URL = `${this.baseURL}/_design/Views/_view/subscribeddetailsbystatus?key="${status}"`;
    return this.http.get<any>(URL, { headers: this.headers })
  }

  addSubscribedDetail(data: any) {
    const URL = `${this.baseURL}`;
    return this.http.post<any>(URL, data, { headers: this.headers })
  }

  updateSubscribedDetail(_id: string, data: any) {
    const URL = `${this.baseURL}/${_id}`;
    return this.http.put<any>(URL, data, { headers: this.headers })
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
    return this.http.get<any>(URL, { headers: this.headers });
  }

  addPaymentDetail(data: any) {
    const URL = `${this.baseURL}`;
    return this.http.post<any>(URL, data, { headers: this.headers })
  }

  //  Subscription Confirmation Via NodeJS
  onPaySubscription(data: any) {
    const URL = `http://localhost:8000/send-subscribed-email`
    return this.http.post<any>(URL, data)
  }

  //  Save image to Separate Folder Via NodeJs
  onStoreEventImage(userId: string, eventId: string, imageData: FormData) {
    const URL = `http://localhost:8000/event-image/${userId}/${eventId}`;
    return this.http.post<any>(URL, imageData)
  }

}
