import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
    AbstractControl,
    AsyncValidatorFn,
    ValidationErrors,
} from '@angular/forms';
import { catchError, Observable, of, switchMap } from 'rxjs';

const baseURL: string = 'https://192.168.57.185:5984/qrpass';
const username = 'd_couchdb';
const password = 'Welcome#2';
const headers = new HttpHeaders({
    Authorization: 'Basic ' + btoa(username + ':' + password),
    'Content-type': 'application/json',
});

//  DataType of Organize Offer
export interface SubscriptionOffer {
    _id: string;
    _rev?: string;
    data: {
        offercode: string;
        offerpercent: number;
        offerapplicable: number;
        description: string;
        offerusedusers: string[];
        offerstatus: 1 | 0;
        type: string;
    }
}

//  Form Validation AsyncValidatorFn Functions
export function isOfferApplicableExist(http: HttpClient): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if (!control.value) {
            return of(null); // Skip validation if empty
        }

        const url = `${baseURL}/_design/Views/_view/subscriptionofferbyid`;

        return http.get<{ rows: any[] }>(url, { headers }).pipe(
            switchMap((response) => {
                const existingOfferApplicable = response.rows.some(
                    (offer) => offer.value.data.offerapplicable === Number(control.value)
                );
                return existingOfferApplicable
                    ? of({ OfferApplicableExist: true })
                    : of(null);
            }),
            catchError(() => of(null))
        );
    };
}

export function isDescriptionExist(http: HttpClient): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if (!control.value) {
            return of(null); // Skip validation if empty
        }

        const url = `${baseURL}/_design/Views/_view/subscriptionofferbyid`;

        return http.get<{ rows: any[] }>(url, { headers }).pipe(
            switchMap((response) => {
                const existingOfferDescription = response.rows.some(
                    (offer) => offer.value.data.offerdescription === control.value
                );
                return existingOfferDescription
                    ? of({ OfferDescriptionExist: true })
                    : of(null);
            }),
            catchError(() => of(null))
        );
    };
}
