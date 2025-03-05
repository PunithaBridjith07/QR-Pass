import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  //  Configure Properties
  readonly baseURL = "https://192.168.57.185:5984/qrpass"
  readonly username = "d_couchdb";
  readonly password = "Welcome#2";
  readonly headers = new HttpHeaders({
    "Authorization": 'Basic ' + btoa(this.username + ":" + this.password),
    "Content-type": "application/json"
  })

  constructor(readonly http: HttpClient) { }

  //  Authentication CRUD
  validateUser(email?: string) {
    const URL = `${this.baseURL}/_design/Views/_view/authenticateUserByEmail?key="${email}"`;
    return this.http.get<any>(URL, { headers: this.headers })
  }

  createUser(data: any) {
    const URL = this.baseURL
    return this.http.post<any>(URL, data, { headers: this.headers })
  }

  updateUser(_id: string, data: any) {
    const URL = `${this.baseURL}/${_id}`;
    return this.http.put<any>(URL, data, { headers: this.headers })
  }

}
