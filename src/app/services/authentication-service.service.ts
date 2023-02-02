import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserData } from '../commons/user.data';


const httpOptions = {
  headers : new HttpHeaders({
    'Content-Type':'application/json',
    'Authorization': "Bearer "+ UserData.jwt
  })
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationServiceService {
  
  baseUrl: string = environment.urlApi + "/session";

  constructor(private http:HttpClient) { }

  Logout(user_data:any): Observable<any>{
    return this.http.post<any>(this.baseUrl+"/logout", user_data, httpOptions);
  }

  Login(user_data:any):Observable<any>{
    return this.http.post<any>(this.baseUrl+"/login", user_data, httpOptions);
  }

  RequestNewPassword(user_data:any):Observable<any>{
    return this.http.post<any>(this.baseUrl+"/new-password", user_data, httpOptions);
  }

  ResetPassword(user_data:any): Observable<any>{
    return this.http.post<any>(this.baseUrl+"/reset-password", user_data, httpOptions)
  }
  
}
