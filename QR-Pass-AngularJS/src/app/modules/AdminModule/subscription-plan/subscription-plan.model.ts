import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
    AbstractControl,
    AsyncValidatorFn,
    ValidationErrors,
} from '@angular/forms';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

const baseURL: string = 'https://192.168.57.185:5984/qrpass';
const username = 'd_couchdb';
const password = 'Welcome#2';
const headers = new HttpHeaders({
    Authorization: 'Basic ' + btoa(username + ':' + password),
    'Content-type': 'application/json',
});

//  Subscription Interface
export interface SubscriptionPlan {
    _id: string;
    _rev?: string;
    data: {
        price: number;
        daysvalid: number;
        description: string;
        planstatus: number;
        type: string;
    }
}

export interface SubscriptionPayment {
    _id: string;
    _rev?:string
    data: {
        user: string;
        subscribeddetail: string;
        paid: number;
        datetime: string;
        type: "subscriptionpayment";
    };
}


//  Validations Methods(AsyncValidators)
export function isExistDaysValid(http: HttpClient): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if (!control.value) {
            return of(null); // No validation if empty
        }

        const url = `${baseURL}/_design/Views/_view/subscriptionplanbyid`;
        return http.get(url, { headers: headers }).pipe(
            switchMap((response: any) => {
                const existingPlan = response.rows.some(
                    (plan: any) => plan.value.daysvalid === Number(control.value)
                );

                return existingPlan ? of({ ExistPlanValid: true }) : of(null);
            }),
            catchError(() => of(null))
        );
    };
}

export function isExistPlanPrice(http: HttpClient): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if (!control.value) {
            return of(null); // Skip validation if empty
        }

        const url = `${baseURL}/_design/Views/_view/subscriptionplanbyid`;

        return http.get<{ rows: any[] }>(url, { headers }).pipe(
            switchMap((response) => {
                const existingPlan = response.rows.some(
                    (plan) => plan.value.price === Number(control.value)
                );
                return existingPlan ? of({ priceExist: true }) : of(null);
            }),
            catchError(() => of(null)) // Return null if API fails
        );
    };
}

export function isExistPlanDescription(http: HttpClient) {
    return (control: AbstractControl) => {
        if (!control.value) {
            return of(null); // No validation if empty
        }

        const url = `${baseURL}/_design/Views/_view/subscriptionplanbyid`;
        return http.get(url, { headers: headers }).pipe(
            map((response: any) => {
                const existingPlan = response.rows
                    .map((plan: any) => plan.value)
                    .filter((plan: any) => plan.description === control.value);

                return existingPlan.length ? of({ planDescriptionExist: true }) : of(null);
            }),
            catchError(() => of(null))
        );
    };
}
