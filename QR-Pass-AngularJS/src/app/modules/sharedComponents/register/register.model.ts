import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AbstractControl, ValidationErrors } from "@angular/forms";
import { catchError, map, Observable, of } from "rxjs";


//  Model
export interface User {
    _id: string;
    data: {
        username: string;
        email: string;
        password: string;
        phonenumber: string;
        createdat: Date;
        type: "user";
    };
}


export function equalPassword(controlName1: string, controlName2: string) {
    return (control: AbstractControl) => {
        const value1 = control.get(controlName1)?.value
        const value2 = control.get(controlName2)?.value

        if (value1 === value2) {
            return null
        }
        return { passwordNotEqual: true }
    }
}

export function validateExistEmail(controlName1: any[]) {
    return (control: AbstractControl) => {
        const existData = controlName1.find((data) => data.email === control.value)
        if (!existData) {
            return of(null)
        }
        return of({ emailExist: true })
    }
}

export function emailIsUnique(http: HttpClient) {
    return (control: AbstractControl) => {
        if (!control.value) {
            return of(null); // No validation if empty
        }

        const url = `https://192.168.57.185:5984/qrpass/_design/Views/_view/authenticateUserByEmail?key="${control.value}"`;
        const username = "d_couchdb";
        const password = "Welcome#2";
        const headers = new HttpHeaders({
            "Authorization": 'Basic ' + btoa(username + ":" + password),
            "Content-type": "application/json"
        })
        return http.get(url, { headers: headers }).pipe(
            map((response: any) => {
                const existingUsers = response.rows
                    .map((user: any) => user.value)
                    .filter((user: any) => user.data.email === control.value);

                return existingUsers.length ? { emailExist: true } : null;
            }),
            catchError(() => of(null))
        );

    };
}

export function validateEmailIsUnique(http: HttpClient) {
    return (control: AbstractControl) => {
        if (!control.value) {
            return of(null); // No validation if empty
        }

        const url = `https://192.168.57.185:5984/qrpass/_design/Views/_view/authenticateUserByEmail?key="${control.value}"`;
        const username = "d_couchdb";
        const password = "Welcome#2";
        const headers = new HttpHeaders({
            "Authorization": 'Basic ' + btoa(username + ":" + password),
            "Content-type": "application/json"
        })
        return http.get(url, { headers: headers }).pipe(
            map((response: any) => {
                const existingUsers = response.rows
                    .map((user: any) => user.value)
                    .filter((user: any) => user.data.email === control.value);

                return !existingUsers.length ? { emailExist: true } : null;
            }),
            catchError(() => of(null))
        );

    };
}

export function validatePasswordIsValid(http: HttpClient, controlName1: string) {
    return (control: AbstractControl) => {
        if (!control.value) {
            return of(null); // No validation if empty
        }
        const form = control.parent;
        const email = form?.get(controlName1)?.value;
        if (!email) {
            return of(null);
        }
        const url = `https://192.168.57.185:5984/qrpass/_design/Views/_view/authenticateUserByEmail?key="${email}"`;
        const username = "d_couchdb";
        const password = "Welcome#2";
        const headers = new HttpHeaders({
            "Authorization": 'Basic ' + btoa(username + ":" + password),
            "Content-Type": "application/json"
        });
        return http.get<any>(url, { headers: headers }).pipe(
            map(response => {
                const validUser = response.rows.some((row: any) =>
                    row.value.data.email === email && row.value.data.password === control.value
                );

                return validUser ? null : { invalidCredentials: true }; // Return error if credentials are incorrect
            }),
            catchError(() => of(null))
        );
    };
}

export function validatePassword(controlName1: any[], controlName2: string) {
    return (control: AbstractControl) => {
        const existEmail = control.get(controlName2)?.value;
        const existData = controlName1.find((data) => data.email === existEmail && data.password === control.value)
        if (!existData) {
            return null
        }
        return { invalidPassword: true }
    }
}